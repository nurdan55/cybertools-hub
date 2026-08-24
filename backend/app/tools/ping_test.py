import asyncio
import socket
import time
import platform
import subprocess
from typing import Dict

async def ping_test(target: str, count: int = 4) -> Dict:
    """Perform ping test to target"""
    try:
        # Validate target
        try:
            socket.gethostbyname(target)
        except socket.gaierror:
            return {"error": "Invalid target or hostname resolution failed"}
        
        # Determine the ping command based on platform
        if platform.system().lower() == "windows":
            command = ["ping", "-n", str(count), target]
        else:
            command = ["ping", "-c", str(count), target]
        
        # Run ping command
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            return {
                "error": "Ping command failed",
                "details": stderr.decode()
            }
        
        # Parse ping output
        output = stdout.decode()
        
        # Parse results (basic parsing)
        results = {
            "target": target,
            "count": count,
            "packet_transmitted": 0,
            "packet_received": 0,
            "packet_loss": 0,
            "results": []
        }
        
        lines = output.split('\n')
        
        # Parse individual ping results
        for line in lines:
            if "bytes from" in line or "bytes=" in line:
                try:
                    # Extract time from ping output
                    if "time=" in line or "time<" in line:
                        time_part = line.split("time=")[1].split()[0] if "time=" in line else line.split("time<")[1].split()[0]
                        try:
                            time_ms = float(time_part.replace("ms", ""))
                            results["results"].append({
                                "sequence": len(results["results"]) + 1,
                                "time_ms": time_ms,
                                "status": "success"
                            })
                        except ValueError:
                            pass
                except:
                    pass
        
        # Parse summary line
        for line in lines:
            if "packets transmitted" in line or "packets sent" in line:
                try:
                    parts = line.split(",")
                    for part in parts:
                        if "transmitted" in part or "sent" in part:
                            results["packet_transmitted"] = int(part.strip().split()[0])
                        elif "received" in part:
                            results["packet_received"] = int(part.strip().split()[0])
                        elif "loss" in part:
                            loss_part = part.strip().split()[0]
                            results["packet_loss"] = float(loss_part.replace("%", ""))
                except:
                    pass
        
        # Calculate statistics
        if results["results"]:
            times = [r["time_ms"] for r in results["results"]]
            results["statistics"] = {
                "min": min(times),
                "max": max(times),
                "avg": sum(times) / len(times),
                "packet_loss_percent": results["packet_loss"]
            }
        
        results["raw_output"] = output
        
        return results
        
    except Exception as e:
        return {"error": f"Ping test failed: {str(e)}"}
