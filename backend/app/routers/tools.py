from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import asyncpg
from main import get_db, verify_token
import redis
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)

# Import tool functions
from app.tools.port_scanner import scan_ports
from app.tools.dns_lookup import dns_lookup
from app.tools.whois_query import whois_query
from app.tools.ping_test import ping_test
from app.tools.geo_ip import geo_ip_lookup
from app.tools.ssl_check import ssl_check

# Pydantic models
class PortScanRequest(BaseModel):
    target: str
    ports: Optional[str] = "1-1024"  # Can be "1-1024", "80,443,8080", etc.

class DNSLookupRequest(BaseModel):
    domain: str
    record_types: Optional[List[str]] = ["A", "MX", "NS", "TXT"]

class WHOISRequest(BaseModel):
    target: str  # Can be domain or IP

class PingRequest(BaseModel):
    target: str
    count: Optional[int] = 4

class GeoIPRequest(BaseModel):
    ip: str

class SSLCheckRequest(BaseModel):
    domain: str

async def log_query(db: asyncpg.Connection, user_id: Optional[int], tool: str, target: str, result: dict):
    """Log query to database"""
    try:
        await db.execute(
            """
            INSERT INTO logs (user_id, tool, target, result, created_at)
            VALUES ($1, $2, $3, $4, $5)
            """,
            user_id, tool, target, str(result), datetime.utcnow()
        )
    except Exception as e:
        print(f"Error logging query: {str(e)}")

@router.post("/port-scan")
async def port_scan(
    request: PortScanRequest,
    current_user: Optional[dict] = Depends(verify_token),
    db: asyncpg.Connection = Depends(get_db)
):
    """Scan ports on target"""
    # Check if tool is enabled
    if redis_client.get("settings:port_scanner") == "false":
        raise HTTPException(status_code=503, detail="Port scanner is currently disabled")
    
    try:
        result = await scan_ports(request.target, request.ports)
        user_id = int(current_user["sub"]) if current_user else None
        await log_query(db, user_id, "port_scan", request.target, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dns-lookup")
async def dns_lookup_endpoint(
    request: DNSLookupRequest,
    current_user: Optional[dict] = Depends(verify_token),
    db: asyncpg.Connection = Depends(get_db)
):
    """Perform DNS lookup"""
    if redis_client.get("settings:dns_lookup") == "false":
        raise HTTPException(status_code=503, detail="DNS lookup is currently disabled")
    
    try:
        result = await dns_lookup(request.domain, request.record_types)
        user_id = int(current_user["sub"]) if current_user else None
        await log_query(db, user_id, "dns_lookup", request.domain, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/whois")
async def whois_endpoint(
    request: WHOISRequest,
    current_user: Optional[dict] = Depends(verify_token),
    db: asyncpg.Connection = Depends(get_db)
):
    """Perform WHOIS query"""
    if redis_client.get("settings:whois") == "false":
        raise HTTPException(status_code=503, detail="WHOIS lookup is currently disabled")
    
    try:
        result = await whois_query(request.target)
        user_id = int(current_user["sub"]) if current_user else None
        await log_query(db, user_id, "whois", request.target, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ping")
async def ping_endpoint(
    request: PingRequest,
    current_user: Optional[dict] = Depends(verify_token),
    db: asyncpg.Connection = Depends(get_db)
):
    """Perform ping test"""
    if redis_client.get("settings:ping") == "false":
        raise HTTPException(status_code=503, detail="Ping test is currently disabled")
    
    try:
        result = await ping_test(request.target, request.count)
        user_id = int(current_user["sub"]) if current_user else None
        await log_query(db, user_id, "ping", request.target, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/geo-ip")
async def geo_ip_endpoint(
    request: GeoIPRequest,
    current_user: Optional[dict] = Depends(verify_token),
    db: asyncpg.Connection = Depends(get_db)
):
    """Get GeoIP information"""
    if redis_client.get("settings:geo_ip") == "false":
        raise HTTPException(status_code=503, detail="GeoIP lookup is currently disabled")
    
    try:
        result = await geo_ip_lookup(request.ip)
        user_id = int(current_user["sub"]) if current_user else None
        await log_query(db, user_id, "geo_ip", request.ip, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ssl-check")
async def ssl_check_endpoint(
    request: SSLCheckRequest,
    current_user: Optional[dict] = Depends(verify_token),
    db: asyncpg.Connection = Depends(get_db)
):
    """Check SSL certificate"""
    if redis_client.get("settings:ssl_check") == "false":
        raise HTTPException(status_code=503, detail="SSL check is currently disabled")
    
    try:
        result = await ssl_check(request.domain)
        user_id = int(current_user["sub"]) if current_user else None
        await log_query(db, user_id, "ssl_check", request.domain, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_query_history(
    current_user: dict = Depends(verify_token),
    db: asyncpg.Connection = Depends(get_db)
):
    """Get user's query history"""
    try:
        logs = await db.fetch(
            """
            SELECT id, tool, target, result, created_at
            FROM logs
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 100
            """,
            int(current_user["sub"])
        )
        
        return [
            {
                "id": log["id"],
                "tool": log["tool"],
                "target": log["target"],
                "result": log["result"],
                "created_at": str(log["created_at"])
            }
            for log in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
