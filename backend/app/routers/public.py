from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
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

class ToolRequest(BaseModel):
    target: str
    params: Optional[dict] = None

class SettingsResponse(BaseModel):
    site_title: str
    maintenance_mode: bool
    tools_enabled: dict
    ads_enabled: dict

@router.get("/settings", response_model=SettingsResponse)
async def get_public_settings():
    """Get public site settings"""
    # Get settings from Redis or database
    maintenance_mode = redis_client.get("settings:maintenance_mode") == "true"
    site_title = redis_client.get("settings:site_title") or "CyberTools Hub"
    
    tools_enabled = {
        "port_scanner": redis_client.get("settings:port_scanner") != "false",
        "dns_lookup": redis_client.get("settings:dns_lookup") != "false",
        "whois": redis_client.get("settings:whois") != "false",
        "ping": redis_client.get("settings:ping") != "false",
        "geo_ip": redis_client.get("settings:geo_ip") != "false",
        "ssl_check": redis_client.get("settings:ssl_check") != "false",
    }
    
    ads_enabled = {
        "hero": redis_client.get("settings:ads_hero") != "false",
        "sidebar": redis_client.get("settings:ads_sidebar") != "false",
        "footer": redis_client.get("settings:ads_footer") != "false",
    }
    
    return SettingsResponse(
        site_title=site_title,
        maintenance_mode=maintenance_mode,
        tools_enabled=tools_enabled,
        ads_enabled=ads_enabled
    )

@router.get("/ads")
async def get_ads():
    """Get ad codes for public display"""
    return {
        "hero_728x90": redis_client.get("ads:hero_728x90") or "",
        "sidebar_300x250": redis_client.get("ads:sidebar_300x250") or "",
        "footer": redis_client.get("ads:footer") or ""
    }

@router.get("/developer-profile")
async def get_developer_profile():
    """Get developer profile HTML for public display"""
    html_content = redis_client.get("developer_profile") or ""
    return {"html_content": html_content}
