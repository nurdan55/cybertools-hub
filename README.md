# CyberTools Hub

Profesyonel web tabanlı siber güvenlik araçları platformu. Terminal araçlarını web'e taşıyan, gerçek IP/port verileriyle çalışan, devasa admin paneli, kullanıcı kayıt/giriş sistemi, Google Ads entegrasyonu ve "Geliştirici Ölümü" sayfası olan tam teşekküllü bir projedir.

## 🚀 Teknolojiler

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, PostgreSQL, Redis
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt password hashing, rate limiting, IP blacklist

## 📋 Özellikler

### Ana Sayfa Araçları (6 adet)
1. **Port Tarama** - Nmap tarzı, gerçek port sorgulama
2. **DNS Lookup** - A, MX, NS, TXT kayıtları
3. **WHOIS Sorgu** - domain/IP kayıt bilgileri
4. **Ping Testi** - ms, paket kaybı ölçümü
5. **IP Bilgi** - GeoIP (ülke, şehir, ISP, harita)
6. **SSL Sertifika Kontrolü** - geçerlilik, issuer bilgisi

### Kullanıcı Sistemi
- Kayıt/Giriş (JWT ile)
- Email doğrulama
- Şifremi unuttum
- Kullanıcı profili ve sorgu geçmişi

### Admin Paneli (/admin)
1. **Dashboard** - Grafikler, istatistikler, son sorgular
2. **Kullanıcı Yönetimi** - Ekle, düzenle, sil, rol ata
3. **Log Yönetimi** - Tüm sorguları gör, filtrele, export (CSV)
4. **IP Karaliste** - Manuel ekle, otomatik ban (rate limiting)
5. **Reklam Yönetimi** - Google Ads kodlarını güncelle, aç/kapat
6. **Site Ayarları** - Başlık, logo, araç aktiflik, bakım modu
7. **Geliştirici Ölümü** - HTML profil gömme sayfası
8. **Yedekleme** - Veritabanını yedekle ve geri yükle

### Google Ads
- Hero altı 728x90
- Sidebar 300x250
- Footer alanları (admin panelinden yönetilebilir)

## 📁 Proje Yapısı

```
deepapi/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── auth.py                    # JWT ve authentication
│   │   ├── middleware/                # Custom middleware
│   │   ├── models/                    # Pydantic modelleri
│   │   ├── routers/                   # API endpoint'leri
│   │   │   ├── admin.py              # Admin endpoint'leri
│   │   │   ├── auth.py               # Authentication endpoint'leri
│   │   │   ├── public.py             # Public endpoint'ler
│   │   │   └── tools.py              # Tool endpoint'leri
│   │   └── tools/                     # Tool fonksiyonları
│   │       ├── dns_lookup.py
│   │       ├── geo_ip.py
│   │       ├── ping_test.py
│   │       ├── port_scanner.py
│   │       ├── ssl_check.py
│   │       └── whois_query.py
│   ├── main.py                        # FastAPI uygulaması
│   ├── requirements.txt               # Python bağımlılıkları
│   ├── .env.example                   # Environment değişkenleri örneği
│   ├── init_db.sql                    # Veritabanı şeması
│   └── Dockerfile                     # Docker konfigürasyonu
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/                # Admin sayfaları
│   │   │   │   ├── ads/
│   │   │   │   ├── backup/
│   │   │   │   ├── blacklist/
│   │   │   │   ├── developer/
│   │   │   │   ├── logs/
│   │   │   │   ├── settings/
│   │   │   │   ├── users/
│   │   │   │   └── page.tsx
│   │   │   ├── tools/                # Tool sayfaları
│   │   │   │   ├── dns-lookup/
│   │   │   │   ├── geo-ip/
│   │   │   │   ├── ping/
│   │   │   │   ├── port-scan/
│   │   │   │   ├── ssl-check/
│   │   │   │   └── whois/
│   │   │   ├── developer/             # Geliştirici sayfası
│   │   │   ├── login/                # Giriş sayfası
│   │   │   ├── register/             # Kayıt sayfası
│   │   │   ├── globals.css           # Global stiller
│   │   │   ├── layout.tsx            # Ana layout
│   │   │   └── page.tsx              # Ana sayfa
│   │   ├── components/
│   │   │   └── Navbar.tsx            # Navigasyon bileşeni
│   │   └── lib/                       # Yardımcı fonksiyonlar
│   ├── public/                        # Statik dosyalar
│   ├── package.json                   # Node.js bağımlılıkları
│   ├── tsconfig.json                  # TypeScript konfigürasyonu
│   ├── tailwind.config.ts             # Tailwind CSS konfigürasyonu
│   ├── postcss.config.js              # PostCSS konfigürasyonu
│   ├── next.config.js                 # Next.js konfigürasyonu
│   └── Dockerfile                     # Docker konfigürasyonu
├── docker-compose.yml                 # Docker Compose konfigürasyonu
└── README.md                          # Bu dosya
```

## 🛠️ Kurulum Adımları

### Gereksinimler
- Docker ve Docker Compose
- Git (opsiyonel)

### 1. Projeyi Klonlayın veya İndirin

```bash
git clone <repository-url>
cd deepapi
```

### 2. Environment Değişkenlerini Ayarlayın

Backend için environment dosyasını oluşturun:

```bash
cd backend
cp .env.example .env
```

`.env` dosyasını düzenleyin ve gerekli değerleri girin:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cybertools

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@cybertoolshub.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
```

### 3. Docker Compose ile Başlatın

Tüm servisleri başlatmak için:

```bash
cd ..
docker-compose up -d
```

Bu komut şunları başlatır:
- PostgreSQL veritabanı (port 5432)
- Redis cache (port 6379)
- Backend API (port 8000)
- Frontend (port 3000)

### 4. Servislerin Durumunu Kontrol Edin

```bash
docker-compose ps
```

Tüm servislerin "healthy" durumda olduğundan emin olun.

### 5. Veritabanını Başlatın

Veritabanı otomatik olarak `init_db.sql` dosyasıyla başlatılacaktır. İlk admin kullanıcısı:
- **Kullanıcı adı**: admin
- **Şifre**: admin123
- **Email**: admin@cybertoolshub.com

⚠️ **Önemli**: İlk girişten sonra admin şifresini değiştirin!

### 6. Uygulamaya Erişin

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Dokümantasyonu**: http://localhost:8000/docs
- **Admin Paneli**: http://localhost:3000/admin

## 🔧 Manuel Kurulum (Docker olmadan)

### Backend Kurulumu

```bash
cd backend

# Python sanal ortamı oluşturun
python -m venv venv

# Sanal ortamı aktifleştirin
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Environment dosyasını oluşturun
cp .env.example .env
# .env dosyasını düzenleyin

# PostgreSQL veritabanını başlatın ve init_db.sql dosyasını çalıştırın

# Uygulamayı başlatın
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Kurulumu

```bash
cd frontend

# Node.js bağımlılıklarını yükleyin
npm install

# Uygulamayı başlatın
npm run dev
```

## 📝 Kullanım

### Araçları Kullanmak

1. Ana sayfadan istediğiniz aracı seçin
2. Gerekli parametreleri girin (IP, domain, port numarası vb.)
3. "Start" veya "Check" butonuna tıklayın
4. Sonuçları gerçek zamanlı görün

### Admin Paneli

1. Admin hesabıyla giriş yapın
2. `/admin` sayfasına gidin
3. İstenen yönetim fonksiyonunu seçin:
   - **Users**: Kullanıcı yönetimi
   - **Logs**: Sorgu logları ve export
   - **Blacklist**: IP engelleme
   - **Settings**: Site ayarları
   - **Ads**: Reklam yönetimi
   - **Developer**: Geliştirici profili
   - **Backup**: Veritabanı yedekleme

### Geliştirici Profili

Admin panelinde "Developer Profile" sayfasına gidin ve HTML içerik yapıştırın. Bu içerik `/developer` sayfasında görüntülenecektir.

## 🔒 Gülik Özellikleri

- **JWT Authentication**: Güvenli token tabanlı kimlik doğrulama
- **Rate Limiting**: 100 istek/dakika sınırı
- **IP Blacklist**: Kötü amaçlı IP'leri engelleme
- **Password Hashing**: bcrypt ile şifre güvenliği
- **CORS**: Cross-Origin Resource Sharing koruması
- **Input Validation**: Pydantic ile veri doğrulama

## 🐛 Sorun Giderme

### Servisler Başlamıyor

```bash
# Logları kontrol edin
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis
```

### Veritabanı Bağlantı Hatası

- PostgreSQL'in çalıştığından emin olun
- `.env` dosyasındaki veritabanı ayarlarını kontrol edin
- Port çakışması olmadığından emin olun

### Redis Bağlantı Hatası

- Redis'in çalıştığından emin olun
- `.env` dosyasındaki Redis ayarlarını kontrol edin

### Frontend API Hatası

- Backend'in çalıştığından emin olun (http://localhost:8000)
- `NEXT_PUBLIC_API_URL` environment değişkenini kontrol edin
- CORS ayarlarını kontrol edin

## 📝 Geliştirme

### Backend'i Geliştirme

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend'i Geliştirme

```bash
cd frontend
npm run dev
```

### Testler

Backend testlerini çalıştırmak için:
```bash
cd backend
pytest
```

Frontend testlerini çalıştırmak için:
```bash
cd frontend
npm test
```

## 🚀 Production'a Deploy

### Environment Değişkenleri

Production için güvenli ayarlar kullanın:
- Güçlü `JWT_SECRET`
- Güvenli veritabanı şifreleri
- SMTP ayarları (email gönderimi için)
- Production veritabanı URL'i

### Docker Compose Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Reverse Proxy

Nginx veya Apache kullanarak:
- SSL/TLS sertifikası yapılandırın
- Static dosya sunumunu optimize edin
- Load balancing ekleyin

## 📄 Lisans

Bu proje eğitim amaçlıdır. Production kullanımı için gerekli güvenlik önlemlerini alın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**CyberTools Hub** - Profesyonel Siber Güvenlik Araçları Platformu
