from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import asyncpg
from main import get_db, verify_admin
import redis
import os
from datetime import datetime
import csv
import io
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
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_verified: Optional[bool] = None

class BlacklistAdd(BaseModel):
    ip: str
    reason: str

class SettingsUpdate(BaseModel):
    site_title: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    tools_enabled: Optional[dict] = None
    ads_enabled: Optional[dict] = None

class AdUpdate(BaseModel):
    hero_728x90: Optional[str] = None
    sidebar_300x250: Optional[str] = None
    footer: Optional[str] = None

class DeveloperProfile(BaseModel):
    html_content: str

@router.get("/dashboard")
async def get_dashboard(
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Get dashboard statistics"""
    try:
        # Get user count
        user_count = await db.fetchval("SELECT COUNT(*) FROM users")
        
        # Get query count today
        today = datetime.utcnow().date()
        query_count_today = await db.fetchval(
            "SELECT COUNT(*) FROM logs WHERE DATE(created_at) = $1",
            today
        )
        
        # Get total query count
        total_queries = await db.fetchval("SELECT COUNT(*) FROM logs")
        
        # Get recent queries
        recent_queries = await db.fetch(
            """
            SELECT l.tool, l.target, l.created_at, u.username
            FROM logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            LIMIT 10
            """
        )
        
        # Get tool usage stats
        tool_stats = await db.fetch(
            """
            SELECT tool, COUNT(*) as count
            FROM logs
            GROUP BY tool
            ORDER BY count DESC
            """
        )
        
        return {
            "user_count": user_count,
            "query_count_today": query_count_today,
            "total_queries": total_queries,
            "recent_queries": [
                {
                    "tool": q["tool"],
                    "target": q["target"],
                    "created_at": str(q["created_at"]),
                    "username": q["username"]
                }
                for q in recent_queries
            ],
            "tool_stats": [
                {"tool": stat["tool"], "count": stat["count"]}
                for stat in tool_stats
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users")
async def get_users(
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Get all users"""
    try:
        users = await db.fetch(
            """
            SELECT id, username, email, role, is_verified, created_at
            FROM users
            ORDER BY created_at DESC
            """
        )
        
        return [
            {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "is_verified": user["is_verified"],
                "created_at": str(user["created_at"])
            }
            for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users")
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Create a new user"""
    from app.auth import hash_password
    
    try:
        hashed_password = hash_password(user_data.password)
        
        user = await db.fetchrow(
            """
            INSERT INTO users (username, email, password_hash, role, is_verified)
            VALUES ($1, $2, $3, $4, true)
            RETURNING id, username, email, role, is_verified, created_at
            """,
            user_data.username, user_data.email, hashed_password, user_data.role
        )
        
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "is_verified": user["is_verified"],
            "created_at": str(user["created_at"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Update a user"""
    try:
        update_fields = []
        values = []
        param_count = 1
        
        if user_data.username is not None:
            update_fields.append(f"username = ${param_count}")
            values.append(user_data.username)
            param_count += 1
        
        if user_data.email is not None:
            update_fields.append(f"email = ${param_count}")
            values.append(user_data.email)
            param_count += 1
        
        if user_data.role is not None:
            update_fields.append(f"role = ${param_count}")
            values.append(user_data.role)
            param_count += 1
        
        if user_data.is_verified is not None:
            update_fields.append(f"is_verified = ${param_count}")
            values.append(user_data.is_verified)
            param_count += 1
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(user_id)
        
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ${param_count}"
        await db.execute(query, *values)
        
        return {"message": "User updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Delete a user"""
    try:
        await db.execute("DELETE FROM users WHERE id = $1", user_id)
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_logs(
    tool: Optional[str] = None,
    user_id: Optional[int] = None,
    limit: int = 100,
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Get logs with optional filtering"""
    try:
        conditions = []
        values = []
        param_count = 1
        
        if tool:
            conditions.append(f"tool = ${param_count}")
            values.append(tool)
            param_count += 1
        
        if user_id:
            conditions.append(f"user_id = ${param_count}")
            values.append(user_id)
            param_count += 1
        
        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        
        logs = await db.fetch(
            f"""
            SELECT l.id, l.tool, l.target, l.result, l.created_at, u.username, u.email
            FROM logs l
            LEFT JOIN users u ON l.user_id = u.id
            {where_clause}
            ORDER BY l.created_at DESC
            LIMIT ${param_count}
            """,
            *values, limit
        )
        
        return [
            {
                "id": log["id"],
                "tool": log["tool"],
                "target": log["target"],
                "result": log["result"],
                "created_at": str(log["created_at"]),
                "username": log["username"],
                "email": log["email"]
            }
            for log in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/export/csv")
async def export_logs_csv(
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Export logs as CSV"""
    try:
        logs = await db.fetch(
            """
            SELECT l.tool, l.target, l.result, l.created_at, u.username, u.email
            FROM logs l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
            """
        )
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Tool", "Target", "Result", "Created At", "Username", "Email"])
        
        for log in logs:
            writer.writerow([
                log["tool"],
                log["target"],
                log["result"],
                str(log["created_at"]),
                log["username"] or "",
                log["email"] or ""
            ])
        
        return {
            "filename": "logs_export.csv",
            "content": output.getvalue()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/blacklist")
async def get_blacklist(current_user: dict = Depends(verify_admin)):
    """Get all blacklisted IPs"""
    try:
        blacklist = []
        for key in redis_client.scan_iter("blacklist:*"):
            ip = key.split(":")[1]
            reason = redis_client.get(key)
            blacklist.append({"ip": ip, "reason": reason})
        
        return blacklist
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/blacklist")
async def add_to_blacklist(
    blacklist_data: BlacklistAdd,
    current_user: dict = Depends(verify_admin)
):
    """Add IP to blacklist"""
    try:
        redis_client.set(f"blacklist:{blacklist_data.ip}", blacklist_data.reason)
        return {"message": "IP added to blacklist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/blacklist/{ip}")
async def remove_from_blacklist(
    ip: str,
    current_user: dict = Depends(verify_admin)
):
    """Remove IP from blacklist"""
    try:
        redis_client.delete(f"blacklist:{ip}")
        return {"message": "IP removed from blacklist"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings")
async def get_settings(current_user: dict = Depends(verify_admin)):
    """Get admin settings"""
    try:
        return {
            "site_title": redis_client.get("settings:site_title") or "CyberTools Hub",
            "maintenance_mode": redis_client.get("settings:maintenance_mode") == "true",
            "tools_enabled": {
                "port_scanner": redis_client.get("settings:port_scanner") != "false",
                "dns_lookup": redis_client.get("settings:dns_lookup") != "false",
                "whois": redis_client.get("settings:whois") != "false",
                "ping": redis_client.get("settings:ping") != "false",
                "geo_ip": redis_client.get("settings:geo_ip") != "false",
                "ssl_check": redis_client.get("settings:ssl_check") != "false",
            },
            "ads_enabled": {
                "hero": redis_client.get("settings:ads_hero") != "false",
                "sidebar": redis_client.get("settings:ads_sidebar") != "false",
                "footer": redis_client.get("settings:ads_footer") != "false",
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings")
async def update_settings(
    settings_data: SettingsUpdate,
    current_user: dict = Depends(verify_admin)
):
    """Update admin settings"""
    try:
        if settings_data.site_title is not None:
            redis_client.set("settings:site_title", settings_data.site_title)
        
        if settings_data.maintenance_mode is not None:
            redis_client.set("settings:maintenance_mode", "true" if settings_data.maintenance_mode else "false")
        
        if settings_data.tools_enabled:
            for tool, enabled in settings_data.tools_enabled.items():
                redis_client.set(f"settings:{tool}", "true" if enabled else "false")
        
        if settings_data.ads_enabled:
            for ad, enabled in settings_data.ads_enabled.items():
                redis_client.set(f"settings:ads_{ad}", "true" if enabled else "false")
        
        return {"message": "Settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ads")
async def get_ads(current_user: dict = Depends(verify_admin)):
    """Get ad codes"""
    try:
        return {
            "hero_728x90": redis_client.get("ads:hero_728x90") or "",
            "sidebar_300x250": redis_client.get("ads:sidebar_300x250") or "",
            "footer": redis_client.get("ads:footer") or ""
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/ads")
async def update_ads(
    ad_data: AdUpdate,
    current_user: dict = Depends(verify_admin)
):
    """Update ad codes"""
    try:
        if ad_data.hero_728x90 is not None:
            redis_client.set("ads:hero_728x90", ad_data.hero_728x90)
        
        if ad_data.sidebar_300x250 is not None:
            redis_client.set("ads:sidebar_300x250", ad_data.sidebar_300x250)
        
        if ad_data.footer is not None:
            redis_client.set("ads:footer", ad_data.footer)
        
        return {"message": "Ad codes updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/developer-profile")
async def get_developer_profile(current_user: dict = Depends(verify_admin)):
    """Get developer profile HTML"""
    try:
        html_content = redis_client.get("developer_profile") or ""
        return {"html_content": html_content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/developer-profile")
async def update_developer_profile(
    profile_data: DeveloperProfile,
    current_user: dict = Depends(verify_admin)
):
    """Update developer profile HTML"""
    try:
        redis_client.set("developer_profile", profile_data.html_content)
        return {"message": "Developer profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/backup")
async def create_backup(
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Create database backup"""
    try:
        # This is a simplified backup - in production, use pg_dump
        tables = ["users", "logs", "blacklist", "settings"]
        backup_data = {}
        
        for table in tables:
            rows = await db.fetch(f"SELECT * FROM {table}")
            backup_data[table] = [dict(row) for row in rows]
        
        # Store backup in Redis with timestamp
        import json
        backup_key = f"backup:{datetime.utcnow().isoformat()}"
        redis_client.setex(backup_key, 7 * 24 * 3600, json.dumps(backup_data))
        
        return {"message": "Backup created successfully", "backup_key": backup_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/backups")
async def list_backups(current_user: dict = Depends(verify_admin)):
    """List available backups"""
    try:
        backups = []
        for key in redis_client.scan_iter("backup:*"):
            timestamp = key.split(":")[1]
            backups.append({"key": key, "timestamp": timestamp})
        
        return sorted(backups, key=lambda x: x["timestamp"], reverse=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/restore/{backup_key}")
async def restore_backup(
    backup_key: str,
    current_user: dict = Depends(verify_admin),
    db: asyncpg.Connection = Depends(get_db)
):
    """Restore database from backup"""
    try:
        import json
        backup_data = json.loads(redis_client.get(backup_key))
        
        # This is a simplified restore - in production, use proper restore procedures
        for table, rows in backup_data.items():
            # Clear existing data
            await db.execute(f"DELETE FROM {table}")
            
            # Insert backup data
            for row in rows:
                columns = row.keys()
                placeholders = [f"${i+1}" for i in range(len(columns))]
                values = list(row.values())
                
                query = f"""
                INSERT INTO {table} ({', '.join(columns)})
                VALUES ({', '.join(placeholders)})
                """
                await db.execute(query, *values)
        
        return {"message": "Backup restored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
