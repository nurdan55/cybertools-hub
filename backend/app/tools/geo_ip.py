import requests
import socket
from typing import Dict

async def geo_ip_lookup(ip: str) -> Dict:
    """Get GeoIP information for an IP address"""
    try:
        # Validate IP
        try:
            socket.inet_aton(ip)
        except socket.error:
            return {"error": "Invalid IP address format"}
        
        # Use free GeoIP API (ip-api.com)
        # Note: For production, consider using a paid service or local database
        response = requests.get(
            f"http://ip-api.com/json/{ip}",
            timeout=10
        )
        
        if response.status_code != 200:
            return {"error": "GeoIP service unavailable"}
        
        data = response.json()
        
        if data.get("status") == "fail":
            return {"error": data.get("message", "GeoIP lookup failed")}
        
        # Format results
        result = {
            "ip": ip,
            "country": data.get("country", ""),
            "country_code": data.get("countryCode", ""),
            "region": data.get("regionName", ""),
            "region_code": data.get("region", ""),
            "city": data.get("city", ""),
            "zip": data.get("zip", ""),
            "latitude": data.get("lat", 0),
            "longitude": data.get("lon", 0),
            "timezone": data.get("timezone", ""),
            "isp": data.get("isp", ""),
            "org": data.get("org", ""),
            "as": data.get("as", ""),
            "is_proxy": data.get("proxy", False),
            "is_mobile": data.get("mobile", False),
            "is_hosting": data.get("hosting", False),
            "map_url": f"https://www.google.com/maps?q={data.get('lat', 0)},{data.get('lon', 0)}"
        }
        
        return result
        
    except requests.exceptions.Timeout:
        return {"error": "GeoIP service timeout"}
    except requests.exceptions.RequestException as e:
        return {"error": f"GeoIP service error: {str(e)}"}
    except Exception as e:
        return {"error": f"GeoIP lookup failed: {str(e)}"}
