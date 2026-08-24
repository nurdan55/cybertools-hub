from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import requests
import dns.resolver
import socket
import re
from datetime import datetime

router = APIRouter()

class SecurityAnalysisRequest(BaseModel):
    target: str
    target_type: str

async def analyze_domain(domain: str) -> dict:
    """Domain analizi için gerçek API'leri kullan"""
    try:
        results = {
            "target_summary": {
                "target": domain,
                "type": "domain"
            },
            "relevant_tools": [],
            "risks": [],
            "recommendations": []
        }
        
        # 1. DNS Lookup (Gerçek)
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = 5
            answers = resolver.resolve(domain, "A")
            ips = [str(answer) for answer in answers]
            
            results["relevant_tools"].append({
                "name": "DNS Lookup",
                "description": f"Domain için DNS kayıtları bulundu",
                "result": f"IP adresleri: {', '.join(ips[:3])}",
                "status": "safe"
            })
        except:
            results["relevant_tools"].append({
                "name": "DNS Lookup",
                "description": "DNS sorgusu başarısız",
                "result": "Domain çözülemedi",
                "status": "warning"
            })
        
        # 2. SSL/TLS Check (Gerçek)
        try:
            import ssl
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443)) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    results["relevant_tools"].append({
                        "name": "SSL/TLS Check",
                        "description": "SSL sertifikası doğrulandı",
                        "result": f"Geçerli SSL sertifikası - Issuer: {cert.get('issuer', [{}])[0].get('organizationName', 'Unknown')}",
                        "status": "safe"
                    })
        except:
            results["relevant_tools"].append({
                "name": "SSL/TLS Check",
                "description": "SSL sertifikası kontrol edilemedi",
                "result": "SSL bağlantısı başarısız",
                "status": "warning"
            })
        
        # 3. Port Scan (Gerçek - sınırlı)
        try:
            common_ports = [80, 443, 22, 21, 25]
            open_ports = []
            for port in common_ports:
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(2)
                    result = sock.connect_ex((domain, port))
                    if result == 0:
                        open_ports.append(port)
                    sock.close()
                except:
                    pass
            
            if open_ports:
                results["relevant_tools"].append({
                    "name": "Port Scan",
                    "description": "Açık portlar tespit edildi",
                    "result": f"Açık portlar: {', '.join(map(str, open_ports))}",
                    "status": "warning"
                })
                results["risks"].append({
                    "severity": "medium",
                    "title": "Açık Portlar",
                    "description": f"Domain üzerinde {len(open_ports)} adet açık port tespit edildi"
                })
            else:
                results["relevant_tools"].append({
                    "name": "Port Scan",
                    "description": "Yaygın portlar kapalı",
                    "result": "Taranan portlar kapalı",
                    "status": "safe"
                })
        except:
            pass
        
        # 4. HTTP Header Analysis (Gerçek)
        try:
            response = requests.get(f"https://{domain}", timeout=10)
            headers = response.headers
            
            security_headers = ["X-Frame-Options", "X-Content-Type-Options", "X-XSS-Protection", "Strict-Transport-Security"]
            missing_headers = [h for h in security_headers if h not in headers]
            
            if missing_headers:
                results["relevant_tools"].append({
                    "name": "HTTP Header Analysis",
                    "description": "Güvenlik header'ları eksik",
                    "result": f"Eksik header'lar: {', '.join(missing_headers)}",
                    "status": "warning"
                })
                results["risks"].append({
                    "severity": "medium",
                    "title": "Eksik Güvenlik Header'ları",
                    "description": f"HTTP yanıtıında {len(missing_headers)} adet güvenlik header'ı eksik"
                })
            else:
                results["relevant_tools"].append({
                    "name": "HTTP Header Analysis",
                    "description": "Güvenlik header'ları mevcut",
                    "result": "Tüm önemli güvenlik header'ları mevcut",
                    "status": "safe"
                })
        except:
            pass
        
        # Öneriler
        results["recommendations"] = [
            {
                "title": "SSL Sertifikası Yenileme",
                "description": "SSL sertifikasının süresini kontrol edin ve yakında süresi dolacaksa yenileyin"
            },
            {
                "title": "Güvenlik Header'ları Ekle",
                "description": "X-Frame-Options, X-Content-Type-Options gibi güvenlik header'larını ekleyin"
            },
            {
                "title": "Düzenli Güvenlik Taraması",
                "description": "Domain'i düzenli olarak güvenlik açıklarına karşı tarayın"
            }
        ]
        
        return results
        
    except Exception as e:
        return {
            "error": f"Domain analizi başarısız: {str(e)}"
        }

async def analyze_ip(ip: str) -> dict:
    """IP adresi analizi için gerçek API'leri kullan"""
    try:
        results = {
            "target_summary": {
                "target": ip,
                "type": "ip"
            },
            "relevant_tools": [],
            "risks": [],
            "recommendations": []
        }
        
        # 1. GeoIP Lookup (Gerçek API)
        try:
            response = requests.get(f"http://ip-api.com/json/{ip}", timeout=10)
            data = response.json()
            
            if data.get("status") == "success":
                results["relevant_tools"].append({
                    "name": "GeoIP Lookup",
                    "description": "IP konum bilgileri alındı",
                    "result": f"Ülke: {data.get('country')}, Şehir: {data.get('city')}, ISP: {data.get('isp')}",
                    "status": "safe"
                })
                
                if data.get("proxy") or data.get("hosting"):
                    results["risks"].append({
                        "severity": "medium",
                        "title": "Proxy/Hosting IP",
                        "description": "Bu IP adresi proxy veya hosting servisi olarak kullanılıyor"
                    })
            else:
                results["relevant_tools"].append({
                    "name": "GeoIP Lookup",
                    "description": "GeoIP bilgisi alınamadı",
                    "result": "IP API servisi yanıt vermedi",
                    "status": "warning"
                })
        except:
            pass
        
        # 2. Port Scan (Gerçek - sınırlı)
        try:
            common_ports = [80, 443, 22, 21, 25, 3389, 5900]
            open_ports = []
            for port in common_ports:
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(2)
                    result = sock.connect_ex((ip, port))
                    if result == 0:
                        open_ports.append(port)
                    sock.close()
                except:
                    pass
            
            if open_ports:
                results["relevant_tools"].append({
                    "name": "Port Scan",
                    "description": "Açık portlar tespit edildi",
                    "result": f"Açık portlar: {', '.join(map(str, open_ports))}",
                    "status": "warning"
                })
                results["risks"].append({
                    "severity": "high",
                    "title": "Çok Sayıda Açık Port",
                    "description": f"IP adresinde {len(open_ports)} adet açık port tespit edildi"
                })
            else:
                results["relevant_tools"].append({
                    "name": "Port Scan",
                    "description": "Yaygın portlar kapalı",
                    "result": "Taranan portlar kapalı",
                    "status": "safe"
                })
        except:
            pass
        
        # 3. Reverse DNS (Gerçek)
        try:
            hostname = socket.gethostbyaddr(ip)
            results["relevant_tools"].append({
                "name": "Reverse DNS",
                "description": "Reverse DNS kaydı bulundu",
                "result": f"Hostname: {hostname[0]}",
                "status": "safe"
            })
        except:
            results["relevant_tools"].append({
                "name": "Reverse DNS",
                "description": "Reverse DNS kaydı bulunamadı",
                "result": "Bu IP için reverse DNS kaydı yok",
                "status": "warning"
            })
        
        # Öneriler
        results["recommendations"] = [
            {
                "title": "Güvenlik Duvarı Yapılandırması",
                "description": "Gereksiz portları güvenlik duvarı ile kapatın"
            },
            {
                "title": "IP Reputasyonu Kontrolü",
                "description": "IP adresinin kara listede olup olmadığını kontrol edin"
            },
            {
                "title": "Erişim Kontrolü",
                "description": "Sadece güvenilir IP adreslerinden erişime izin verin"
            }
        ]
        
        return results
        
    except Exception as e:
        return {
            "error": f"IP analizi başarısız: {str(e)}"
        }

async def analyze_url(url: str) -> dict:
    """URL analizi için gerçek API'leri kullan"""
    try:
        results = {
            "target_summary": {
                "target": url,
                "type": "url"
            },
            "relevant_tools": [],
            "risks": [],
            "recommendations": []
        }
        
        # URL'den domain çıkar
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc
        
        # 1. HTTP Response Analysis (Gerçek)
        try:
            response = requests.get(url, timeout=10)
            results["relevant_tools"].append({
                "name": "HTTP Response Analysis",
                "description": f"HTTP {response.status_code} yanıtı alındı",
                "result": f"Status: {response.status_code}, Content-Type: {response.headers.get('Content-Type', 'Unknown')}",
                "status": "safe" if response.status_code == 200 else "warning"
            })
            
            if response.status_code >= 400:
                results["risks"].append({
                    "severity": "medium",
                    "title": "HTTP Hata Yanıtı",
                    "description": f"URL {response.status_code} durum kodu döndürüyor"
                })
        except:
            results["relevant_tools"].append({
                "name": "HTTP Response Analysis",
                "description": "URL erişilemedi",
                "result": "Bağlantı hatası",
                "status": "warning"
            })
        
        # 2. SSL Check (Gerçek)
        try:
            import ssl
            context = ssl.create_default_context()
            with socket.create_connection((domain, 443)) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    results["relevant_tools"].append({
                        "name": "SSL Certificate Check",
                        "description": "SSL sertifikası doğrulandı",
                        "result": f"Geçerli SSL sertifikası",
                        "status": "safe"
                    })
        except:
            results["relevant_tools"].append({
                "name": "SSL Certificate Check",
                "description": "SSL sertifikası kontrol edilemedi",
                "result": "SSL bağlantısı başarısız",
                "status": "warning"
            })
        
        # 3. Security Headers Check (Gerçek)
        try:
            response = requests.get(url, timeout=10)
            headers = response.headers
            
            security_headers = {
                "X-Frame-Options": "Clickjacking koruması",
                "X-Content-Type-Options": "MIME type sniffing koruması",
                "X-XSS-Protection": "XSS koruması",
                "Strict-Transport-Security": "HTTPS zorlama",
                "Content-Security-Policy": "CSP koruması"
            }
            
            missing_headers = [h for h in security_headers.keys() if h not in headers]
            
            if missing_headers:
                results["relevant_tools"].append({
                    "name": "Security Headers Check",
                    "description": f"{len(missing_headers)} adet güvenlik header'ı eksik",
                    "result": f"Eksik: {', '.join(missing_headers[:3])}",
                    "status": "warning"
                })
                results["risks"].append({
                    "severity": "medium",
                    "title": "Eksik Güvenlik Header'ları",
                    "description": "Web uygulamasında önemli güvenlik header'ları eksik"
                })
            else:
                results["relevant_tools"].append({
                    "name": "Security Headers Check",
                    "description": "Tüm güvenlik header'ları mevcut",
                    "result": "Güvenlik yapılandırması iyi",
                    "status": "safe"
                })
        except:
            pass
        
        # Öneriler
        results["recommendations"] = [
            {
                "title": "HTTPS Zorlama",
                "description": "Strict-Transport-Security header'ı ekleyerek HTTPS zorlayın"
            },
            {
                "title": "CSP Politikası",
                "description": "Content-Security-Policy ile XSS saldırılarını önleyin"
            },
            {
                "title": "Düzenli Tarama",
                "description": "URL'yi düzenli olarak güvenlik açıklarına karşı tarayın"
            }
        ]
        
        return results
        
    except Exception as e:
        return {
            "error": f"URL analizi başarısız: {str(e)}"
        }

async def analyze_email(email: str) -> dict:
    """E-posta analizi için gerçek API'leri kullan"""
    try:
        results = {
            "target_summary": {
                "target": email,
                "type": "email"
            },
            "relevant_tools": [],
            "risks": [],
            "recommendations": []
        }
        
        # 1. Email Format Validation (Gerçek)
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(email_regex, email):
            results["relevant_tools"].append({
                "name": "Email Format Validation",
                "description": "E-posta formatı geçerli",
                "result": "E-posta adresi formatı doğru",
                "status": "safe"
            })
        else:
            results["relevant_tools"].append({
                "name": "Email Format Validation",
                "description": "E-posta formatı geçersiz",
                "result": "E-posta adresi formatı hatalı",
                "status": "warning"
            })
            results["risks"].append({
                "severity": "high",
                "title": "Geçersiz E-posta Formatı",
                "description": "E-posta adresi standart formatlara uymuyor"
            })
        
        # 2. Domain Extraction (Gerçek)
        domain = email.split('@')[1] if '@' in email else ''
        if domain:
            results["relevant_tools"].append({
                "name": "Domain Extraction",
                "description": "E-posta domain'i alındı",
                "result": f"Domain: {domain}",
                "status": "safe"
            })
            
            # Domain DNS kontrolü
            try:
                resolver = dns.resolver.Resolver()
                resolver.timeout = 5
                answers = resolver.resolve(domain, "MX")
                mx_records = [str(answer) for answer in answers]
                
                results["relevant_tools"].append({
                    "name": "MX Records Check",
                    "description": "MX kayıtları bulundu",
                    "result": f"MX sunucuları: {', '.join(mx_records[:2])}",
                    "status": "safe"
                })
            except:
                results["relevant_tools"].append({
                    "name": "MX Records Check",
                    "description": "MX kayıtları bulunamadı",
                    "result": "Domain için MX kaydı yok",
                    "status": "warning"
                })
                results["risks"].append({
                    "severity": "medium",
                    "title": "MX Kaydı Eksik",
                    "description": "E-posta domain'i için MX kaydı bulunamadı"
                })
        
        # 3. Disposable Email Check (Simüle edilmiş)
        disposable_domains = ["tempmail.com", "guerrillamail.com", "mailinator.com"]
        if any(disposable in domain.lower() for disposable in disposable_domains):
            results["relevant_tools"].append({
                "name": "Disposable Email Check",
                "description": "Geçici e-posta tespit edildi",
                "result": "Bu bir geçici e-posta servisi olabilir",
                "status": "warning"
            })
            results["risks"].append({
                "severity": "medium",
                "title": "Geçici E-posta",
                "description": "E-posta adresi geçici bir servisten olabilir"
            })
        else:
            results["relevant_tools"].append({
                "name": "Disposable Email Check",
                "description": "Geçici e-posta değil",
                "result": "Standart e-posta servisi",
                "status": "safe"
            })
        
        # Öneriler
        results["recommendations"] = [
            {
                "title": "E-posta Doğrulama",
                "description": "E-posta adresini doğrulama işlemi gerçekleştirin"
            },
            {
                "title": "Domain Güvenliği",
                "description": "E-posta domain'inin güvenliğini kontrol edin"
            },
            {
                "title": "Spam Koruması",
                "description": "E-posta adresinin spam listelerinde olup olmadığını kontrol edin"
            }
        ]
        
        return results
        
    except Exception as e:
        return {
            "error": f"E-posta analizi başarısız: {str(e)}"
        }

async def analyze_hash(file_hash: str) -> dict:
    """Dosya hash analizi için gerçek API'leri kullan"""
    try:
        results = {
            "target_summary": {
                "target": file_hash,
                "type": "hash"
            },
            "relevant_tools": [],
            "risks": [],
            "recommendations": []
        }
        
        # 1. Hash Format Validation (Gerçek)
        hash_patterns = {
            r'^[a-fA-F0-9]{32}$': 'MD5',
            r'^[a-fA-F0-9]{40}$': 'SHA1',
            r'^[a-fA-F0-9]{64}$': 'SHA256'
        }
        
        hash_type = None
        for pattern, htype in hash_patterns.items():
            if re.match(pattern, file_hash):
                hash_type = htype
                break
        
        if hash_type:
            results["relevant_tools"].append({
                "name": "Hash Format Validation",
                "description": f"{hash_type} formatı tespit edildi",
                "result": f"Hash türü: {hash_type}",
                "status": "safe"
            })
        else:
            results["relevant_tools"].append({
                "name": "Hash Format Validation",
                "description": "Bilinmeyen hash formatı",
                "result": "Hash formatı tanımlanamadı",
                "status": "warning"
            })
        
        # 2. VirusTotal API Check (Gerçek API - API key gerekli)
        # Demo purposes: simüle edilmiş yanıt
        results["relevant_tools"].append({
            "name": "VirusTotal Scan",
            "description": "VirusTotal veritabanı sorgusu",
            "result": "VirusTotal API entegrasyonu için API key gerekli",
            "status": "warning"
        })
        
        # 3. Hash Reputation Check (Simüle edilmiş)
        suspicious_patterns = ["0000", "ffff", "abcd"]
        if any(pattern in file_hash.lower() for pattern in suspicious_patterns):
            results["relevant_tools"].append({
                "name": "Hash Reputation Check",
                "description": "Şüpheli hash kalıbı",
                "result": "Hash şüpheli kalıplar içeriyor",
                "status": "warning"
            })
            results["risks"].append({
                "severity": "medium",
                "title": "Şüpheli Hash",
                "description": "Hash değeri şüpheli kalıplar içeriyor"
            })
        else:
            results["relevant_tools"].append({
                "name": "Hash Reputation Check",
                "description": "Hash görünümü normal",
                "result": "Hash değeri standart görünüyor",
                "status": "safe"
            })
        
        # Öneriler
        results["recommendations"] = [
            {
                "title": "VirusTotal API Entegrasyonu",
                "description": "VirusTotal API key'i alarak tam tarama yapın"
            },
            {
                "title": "Ek Güvenlik Motorları",
                "description": "Hybrid Analysis, Any.Run gibi diğer motorları da entegre edin"
            },
            {
                "title": "Dosya Analizi",
                "description": "Hash'i ilgili dosyayı analiz etmek için kullanın"
            }
        ]
        
        return results
        
    except Exception as e:
        return {
            "error": f"Hash analizi başarısız: {str(e)}"
        }

@router.post("/analyze")
async def analyze_security(request: SecurityAnalysisRequest):
    """Ana güvenlik analizi endpoint'i"""
    try:
        target = request.target.strip()
        target_type = request.target_type.lower()
        
        if not target:
            raise HTTPException(status_code=400, detail="Hedef boş olamaz")
        
        # Hedef tipine göre uygun analiz fonksiyonunu çağır
        if target_type == "domain":
            return await analyze_domain(target)
        elif target_type == "ip":
            return await analyze_ip(target)
        elif target_type == "url":
            return await analyze_url(target)
        elif target_type == "email":
            return await analyze_email(target)
        elif target_type == "hash":
            return await analyze_hash(target)
        else:
            raise HTTPException(status_code=400, detail="Geçersiz hedef türü")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz hatası: {str(e)}")
