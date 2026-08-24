import ssl
import socket
from datetime import datetime
from typing import Dict
import OpenSSL

async def ssl_check(domain: str) -> Dict:
    """Check SSL certificate for domain"""
    try:
        # Get SSL certificate
        context = ssl.create_default_context()
        
        # Set timeout
        socket.setdefaulttimeout(10)
        
        # Get certificate
        with socket.create_connection((domain, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                cert_der = ssock.getpeercert(binary_form=True)
        
        # Parse certificate with OpenSSL for more details
        x509 = OpenSSL.crypto.load_certificate(OpenSSL.crypto.FILETYPE_ASN1, cert_der)
        
        # Extract certificate information
        result = {
            "domain": domain,
            "valid": True,
            "subject": {},
            "issuer": {},
            "validity": {},
            "details": {}
        }
        
        # Parse subject
        for item in cert.get("subject", []):
            key, value = item[0]
            result["subject"][key] = value
        
        # Parse issuer
        for item in cert.get("issuer", []):
            key, value = item[0]
            result["issuer"][key] = value
        
        # Parse validity
        not_before = cert.get("notBefore", "")
        not_after = cert.get("notAfter", "")
        
        if not_before:
            try:
                not_before_dt = datetime.strptime(not_before, "%b %d %H:%M:%S %Y %Z")
                result["validity"]["not_before"] = not_before_dt.isoformat()
            except:
                result["validity"]["not_before"] = not_before
        
        if not_after:
            try:
                not_after_dt = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                result["validity"]["not_after"] = not_after_dt.isoformat()
                
                # Check if certificate is expired
                if datetime.utcnow() > not_after_dt:
                    result["valid"] = False
                    result["expired"] = True
                else:
                    result["expired"] = False
                    
                # Calculate days remaining
                days_remaining = (not_after_dt - datetime.utcnow()).days
                result["validity"]["days_remaining"] = days_remaining
                
                if days_remaining < 30:
                    result["warning"] = f"Certificate expires in {days_remaining} days"
                    
            except:
                result["validity"]["not_after"] = not_after
        
        # Extract additional details from OpenSSL
        result["details"]["version"] = x509.get_version()
        result["details"]["serial_number"] = hex(x509.get_serial_number())
        result["details"]["signature_algorithm"] = x509.get_signature_algorithm().decode('utf-8')
        
        # Get subject alternative names
        san_extensions = []
        for i in range(x509.get_extension_count()):
            ext = x509.get_extension(i)
            if ext.get_short_name() == b'subjectAltName':
                san_extensions.append(str(ext))
        
        if san_extensions:
            result["subject_alternative_names"] = san_extensions
        
        # Get certificate chain information
        result["protocol"] = "TLS"
        result["protocol_version"] = ssock.version()
        
        return result
        
    except ssl.SSLCertVerificationError as e:
        return {
            "domain": domain,
            "valid": False,
            "error": "SSL certificate verification failed",
            "details": str(e)
        }
    except ssl.SSLError as e:
        return {
            "domain": domain,
            "valid": False,
            "error": "SSL error",
            "details": str(e)
        }
    except socket.timeout:
        return {
            "domain": domain,
            "valid": False,
            "error": "Connection timeout"
        }
    except ConnectionRefusedError:
        return {
            "domain": domain,
            "valid": False,
            "error": "Connection refused - SSL port (443) may not be open"
        }
    except Exception as e:
        return {
            "domain": domain,
            "valid": False,
            "error": f"SSL check failed: {str(e)}"
        }
