import dns.resolver
import dns.exception
from typing import List, Dict

async def dns_lookup(domain: str, record_types: List[str] = None) -> Dict:
    """Perform DNS lookup for specified record types"""
    if record_types is None:
        record_types = ["A", "MX", "NS", "TXT"]
    
    results = {
        "domain": domain,
        "records": {}
    }
    
    for record_type in record_types:
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = 5
            resolver.lifetime = 10
            
            answers = resolver.resolve(domain, record_type)
            
            records = []
            for answer in answers:
                record_data = {
                    "type": record_type,
                    "ttl": answers.ttl,
                    "data": str(answer)
                }
                
                # Add specific parsing for different record types
                if record_type == "MX":
                    record_data["priority"] = answer.preference
                    record_data["exchange"] = str(answer.exchange)
                elif record_type == "NS":
                    record_data["nameserver"] = str(answer)
                elif record_type == "TXT":
                    record_data["text"] = str(answer).strip('"')
                elif record_type == "A":
                    record_data["ip"] = str(answer)
                elif record_type == "AAAA":
                    record_data["ipv6"] = str(answer)
                elif record_type == "CNAME":
                    record_data["canonical"] = str(answer)
                
                records.append(record_data)
            
            results["records"][record_type] = records
            
        except dns.resolver.NoAnswer:
            results["records"][record_type] = []
        except dns.resolver.NXDOMAIN:
            results["records"][record_type] = []
            results["error"] = f"Domain {domain} does not exist"
        except dns.resolver.Timeout:
            results["records"][record_type] = []
            results["error"] = f"DNS query timeout for {record_type}"
        except dns.exception.DNSException as e:
            results["records"][record_type] = []
            results["error"] = f"DNS error for {record_type}: {str(e)}"
        except Exception as e:
            results["records"][record_type] = []
            results["error"] = f"Unexpected error for {record_type}: {str(e)}"
    
    return results
