from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import redis
import asyncpg
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Redis
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)

# Database connection pool
db_pool: Optional[asyncpg.Pool] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    db_pool = await asyncpg.create_pool(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        database=os.getenv("DB_NAME", "cybertools")
    )
    yield
    await db_pool.close()

app = FastAPI(
    title="CyberTools Hub API",
    description="Professional Cyber Security Tools Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Dependency to get database connection
async def get_db():
    async with db_pool.acquire() as connection:
        yield connection

# Dependency to verify JWT token
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    from app.auth import verify_jwt_token
    token = credentials.credentials
    payload = verify_jwt_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    return payload

# Dependency to verify admin role
async def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    from app.auth import verify_jwt_token
    token = credentials.credentials
    payload = verify_jwt_token(token)
    if not payload or payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return payload

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    client_ip = request.client.host
    redis_key = f"rate_limit:{client_ip}"
    
    # Check if IP is blacklisted
    is_blacklisted = redis_client.get(f"blacklist:{client_ip}")
    if is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="IP is blacklisted"
        )
    
    # Rate limiting (100 requests per minute)
    current = redis_client.incr(redis_key)
    if current == 1:
        redis_client.expire(redis_key, 60)
    
    if current > 100:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded"
        )
    
    response = await call_next(request)
    return response

# Include routers
from app.routers import auth, tools, admin, public, security

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tools.router, prefix="/api/tools", tags=["Tools"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(public.router, prefix="/api/public", tags=["Public"])
app.include_router(security.router, prefix="/api/security", tags=["Security Analysis"])

@app.get("/")
async def root():
    return {
        "message": "CyberTools Hub API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    try:
        # Check Redis
        redis_client.ping()
        # Check PostgreSQL
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected", "redis": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
