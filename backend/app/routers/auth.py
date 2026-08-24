from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
import asyncpg
from main import get_db
from app.auth import (
    hash_password, verify_password, create_access_token, 
    create_refresh_token, verify_jwt_token, generate_verification_token,
    generate_reset_token, send_verification_email, send_password_reset_email
)
import redis
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)

# Pydantic models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_verified: bool
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str

class VerifyEmail(BaseModel):
    token: str

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: asyncpg.Connection = Depends(get_db)):
    # Check if user exists
    existing_user = await db.fetchrow(
        "SELECT id FROM users WHERE email = $1 OR username = $2",
        user_data.email, user_data.username
    )
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Generate verification token
    verification_token = generate_verification_token()
    
    # Insert user
    user = await db.fetchrow(
        """
        INSERT INTO users (username, email, password_hash, verification_token, role)
        VALUES ($1, $2, $3, $4, 'user')
        RETURNING id, username, email, role, is_verified, created_at
        """,
        user_data.username, user_data.email, hashed_password, verification_token
    )
    
    # Send verification email
    await send_verification_email(user_data.email, verification_token, user_data.username)
    
    # Generate tokens
    access_token = create_access_token({"sub": str(user["id"]), "role": user["role"]})
    refresh_token = create_refresh_token({"sub": str(user["id"])})
    
    # Store refresh token in Redis
    redis_client.setex(f"refresh_token:{user['id']}", 7 * 24 * 3600, refresh_token)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            role=user["role"],
            is_verified=user["is_verified"],
            created_at=str(user["created_at"])
        )
    )

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: asyncpg.Connection = Depends(get_db)):
    # Get user
    user = await db.fetchrow(
        "SELECT * FROM users WHERE email = $1",
        user_data.email
    )
    
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate tokens
    access_token = create_access_token({"sub": str(user["id"]), "role": user["role"]})
    refresh_token = create_refresh_token({"sub": str(user["id"])})
    
    # Store refresh token in Redis
    redis_client.setex(f"refresh_token:{user['id']}", 7 * 24 * 3600, refresh_token)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            role=user["role"],
            is_verified=user["is_verified"],
            created_at=str(user["created_at"])
        )
    )

@router.post("/refresh")
async def refresh_token(refresh_token: str, db: asyncpg.Connection = Depends(get_db)):
    payload = verify_jwt_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    
    # Check if refresh token exists in Redis
    stored_token = redis_client.get(f"refresh_token:{user_id}")
    if stored_token != refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    user = await db.fetchrow(
        "SELECT id, username, email, role FROM users WHERE id = $1",
        int(user_id)
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate new access token
    access_token = create_access_token({"sub": str(user["id"]), "role": user["role"]})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout(current_user: dict = Depends(lambda: {"sub": "1"})):
    # In a real implementation, this would invalidate the token
    return {"message": "Successfully logged out"}

@router.post("/verify-email")
async def verify_email(verify_data: VerifyEmail, db: asyncpg.Connection = Depends(get_db)):
    # Find user by verification token
    user = await db.fetchrow(
        "SELECT id FROM users WHERE verification_token = $1",
        verify_data.token
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Update user as verified
    await db.execute(
        "UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1",
        user["id"]
    )
    
    return {"message": "Email verified successfully"}

@router.post("/forgot-password")
async def forgot_password(forgot_data: ForgotPassword, db: asyncpg.Connection = Depends(get_db)):
    # Get user
    user = await db.fetchrow(
        "SELECT id, username, email FROM users WHERE email = $1",
        forgot_data.email
    )
    
    if not user:
        # Don't reveal if user exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = generate_reset_token()
    
    # Store reset token in Redis with 1 hour expiry
    redis_client.setex(f"reset_token:{user['id']}", 3600, reset_token)
    
    # Send reset email
    await send_password_reset_email(user["email"], reset_token, user["username"])
    
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/reset-password")
async def reset_password(reset_data: ResetPassword, db: asyncpg.Connection = Depends(get_db)):
    # Find user by reset token (stored in Redis)
    user_id = None
    for key in redis_client.scan_iter("reset_token:*"):
        if redis_client.get(key) == reset_data.token:
            user_id = key.split(":")[1]
            break
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    hashed_password = hash_password(reset_data.new_password)
    await db.execute(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        hashed_password, int(user_id)
    )
    
    # Delete reset token
    redis_client.delete(f"reset_token:{user_id}")
    
    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: dict = Depends(lambda: {"sub": "1", "role": "user"}), db: asyncpg.Connection = Depends(get_db)):
    user = await db.fetchrow(
        "SELECT id, username, email, role, is_verified, created_at FROM users WHERE id = $1",
        int(current_user["sub"])
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        role=user["role"],
        is_verified=user["is_verified"],
        created_at=str(user["created_at"])
    )
