import pythonwhois
import socket
from typing import Dict
from datetime import datetime

async def whois_query(target: str) -> Dict:
    """Perform WHOIS lookup for domain or IP"""
    try:
        # Validate target
        is_ip = False
        try:
            socket.inet_aton(target)
            is_ip = True
        except socket.error:
            pass
        
        # Perform WHOIS lookup
        result = pythonwhois.get_whois(target)
        
        if not result:
            return {"error": "No WHOIS data found for target"}
        
        # Parse and format results
        formatted_result = {
            "target": target,
            "type": "ip" if is_ip else "domain",
            "raw_data": result
        }
        
        # Extract common fields
        if "registrar" in result and result["registrar"]:
            formatted_result["registrar"] = result["registrar"][0] if isinstance(result["registrar"], list) else result["registrar"]
        
        if "creation_date" in result and result["creation_date"]:
            creation_date = result["creation_date"][0] if isinstance(result["creation_date"], list) else result["creation_date"]
            if creation_date:
                formatted_result["creation_date"] = creation_date.isoformat() if hasattr(creation_date, 'isoformat') else str(creation_date)
        
        if "expiration_date" in result and result["expiration_date"]:
            expiration_date = result["expiration_date"][0] if isinstance(result["expiration_date"], list) else result["expiration_date"]
            if expiration_date:
                formatted_result["expiration_date"] = expiration_date.isoformat() if hasattr(expiration_date, 'isoformat') else str(expiration_date)
        
        if "updated_date" in result and result["updated_date"]:
            updated_date = result["updated_date"][0] if isinstance(result["updated_date"], list) else result["updated_date"]
            if updated_date:
                formatted_result["updated_date"] = updated_date.isoformat() if hasattr(updated_date, 'isoformat') else str(updated_date)
        
        if "name_servers" in result and result["name_servers"]:
            formatted_result["name_servers"] = result["name_servers"] if isinstance(result["name_servers"], list) else [result["name_servers"]]
        
        if "status" in result and result["status"]:
            formatted_result["status"] = result["status"] if isinstance(result["status"], list) else [result["status"]]
        
        if "org" in result and result["org"]:
            formatted_result["organization"] = result["org"][0] if isinstance(result["org"], list) else result["org"]
        
        if "country" in result and result["country"]:
            formatted_result["country"] = result["country"][0] if isinstance(result["country"], list) else result["country"]
        
        if "emails" in result and result["emails"]:
            formatted_result["emails"] = result["emails"] if isinstance(result["emails"], list) else [result["emails"]]
        
        return formatted_result
        
    except Exception as e:
        return {"error": f"WHOIS lookup failed: {str(e)}"}
