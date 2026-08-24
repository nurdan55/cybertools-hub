import socket
import asyncio
from typing import List, Dict
import ipaddress

async def scan_port(target: str, port: int, timeout: float = 2.0) -> Dict:
    """Scan a single port"""
    try:
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(target, port),
            timeout=timeout
        )
        writer.close()
        await writer.wait_closed()
        
        # Try to get service name
        try:
            service = socket.getservbyport(port)
        except:
            service = "unknown"
        
        return {
            "port": port,
            "status": "open",
            "service": service,
            "state": "open"
        }
    except asyncio.TimeoutError:
        return {
            "port": port,
            "status": "filtered",
            "service": "unknown",
            "state": "filtered"
        }
    except ConnectionRefusedError:
        return {
            "port": port,
            "status": "closed",
            "service": "unknown",
            "state": "closed"
        }
    except Exception:
        return {
            "port": port,
            "status": "error",
            "service": "unknown",
            "state": "error"
        }

def parse_ports(port_string: str) -> List[int]:
    """Parse port string like '1-1024' or '80,443,8080' into list of ports"""
    ports = []
    
    for part in port_string.split(","):
        part = part.strip()
        if "-" in part:
            start, end = part.split("-")
            ports.extend(range(int(start), int(end) + 1))
        else:
            ports.append(int(part))
    
    return ports

async def scan_ports(target: str, ports: str = "1-1024") -> Dict:
    """Scan multiple ports on target"""
    try:
        # Validate target
        try:
            ipaddress.ip_address(target)
        except:
            # Try to resolve hostname
            try:
                target = socket.gethostbyname(target)
            except:
                return {"error": "Invalid target or hostname resolution failed"}
        
        # Parse ports
        port_list = parse_ports(ports)
        
        # Limit port scan to prevent abuse
        if len(port_list) > 1000:
            return {"error": "Port range too large. Maximum 1000 ports allowed."}
        
        # Scan ports concurrently
        tasks = [scan_port(target, port) for port in port_list]
        results = await asyncio.gather(*tasks)
        
        # Filter only open ports
        open_ports = [r for r in results if r["status"] == "open"]
        
        return {
            "target": target,
            "total_ports_scanned": len(port_list),
            "open_ports": open_ports,
            "closed_ports": len([r for r in results if r["status"] == "closed"]),
            "filtered_ports": len([r for r in results if r["status"] == "filtered"]),
            "scan_summary": {
                "open": len(open_ports),
                "closed": len([r for r in results if r["status"] == "closed"]),
                "filtered": len([r for r in results if r["status"] == "filtered"])
            }
        }
    except Exception as e:
        return {"error": str(e)}
