# Coolify Deployment Rehberi

## Sorun: JavaScript MIME Type Hatası

Eğer canlıda şu hatayı alıyorsanız:
```
TypeError: 'text/plain' is not a valid JavaScript MIME type
```

Bu, nginx'in JavaScript dosyalarını yanlış Content-Type ile sunduğu anlamına gelir.

## Çözüm

Bu proje artık doğru şekilde yapılandırılmış:

### 1. Nginx Konfigürasyonu (`nginx.conf`)

**ÖNEMLİ DEĞİŞİKLİKLER:**
- ✅ `add_header Content-Type` kullanımı KALDIRILDI (bu yanlış bir yaklaşımdı)
- ✅ Her dosya tipi için `types {}` bloğu ile doğru MIME type tanımlandı
- ✅ `/etc/nginx/mime.types` dahil edildi (çakışma olmadan)
- ✅ UTF-8 charset ayarlandı
- ✅ Gzip compression aktif
- ✅ Security headers eklendi (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Static asset cache ayarları optimize edildi
- ✅ SPA routing desteği
- ✅ Font dosyaları için CORS desteği

**Neden Önceki Yapılandırma Çalışmıyordu?**
- `add_header Content-Type` kullanmak Nginx'te yanlış bir yaklaşımdır
- Content-Type header'ı `types {}` direktifi ile ayarlanmalıdır
- `types { }` (boş) kullanıp sonra `default_type` ayarlamak çakışmalara neden olur

### 2. Dockerfile

**İyileştirmeler:**
- ✅ Multi-stage build (küçük image boyutu)
- ✅ `npm ci --only=production` kullanımı (daha hızlı ve güvenilir)
- ✅ Default nginx config önce siliniyor, sonra bizimki kopyalanıyor
- ✅ Nginx config testi daha verbose (`nginx -t -c /etc/nginx/nginx.conf`)
- ✅ Port 80 expose ediliyor

### 3. Build Optimizasyonları
- ✅ Vite production build optimize edildi
- ✅ Vendor chunk'ları ayrıldı
- ✅ Minification aktif

## Coolify'da Deployment

### Adım 1: Değişiklikleri Git'e Push Edin

```bash
git add .
git commit -m "Fix MIME type issue - remove add_header Content-Type usage"
git push
```

### Adım 2: Coolify'da Proje Ayarları

1. **Build Pack**: Dockerfile
2. **Port**: 80
3. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://mutlugunum.com.tr
   ```

### Adım 3: Deploy

Coolify otomatik olarak:
1. Dockerfile'ı kullanarak build yapacak
2. Nginx container'ı başlatacak
3. Port 80'i expose edecek

### Adım 4: Cache Temizleme

Deploy sonrası **MUTLAKA** yapın:
1. **Browser cache temizle**: Cmd+Shift+R (Mac) veya Ctrl+Shift+R (Windows)
2. **Hard refresh**: Tarayıcıda birkaç kez yenile

## Test Etme

Deploy sonrası kontrol edin:

1. **Browser Console**: JavaScript hataları var mı?
2. **Network Tab**: 
   - JS dosyaları `application/javascript` olarak mı sunuluyor?
   - CSS dosyaları `text/css` olarak mı sunuluyor?
3. **Response Headers** (bir .js dosyasına tıklayın):
   ```
   Content-Type: application/javascript
   X-Content-Type-Options: nosniff
   Cache-Control: public, max-age=31536000, immutable
   ```

## Manuel Test (Local Docker)

Eğer local'de test etmek isterseniz:

```bash
# Docker build
docker build -t mutlugunum .

# Docker run
docker run -p 8080:80 mutlugunum

# Tarayıcıda aç
open http://localhost:8080
```

## Sorun Giderme

### Hala MIME type hatası alıyorsanız:

1. **Nginx loglarını kontrol edin**:
   ```bash
   # Coolify'da container loglarını görüntüleyin
   # veya SSH ile sunucuya bağlanıp:
   docker logs <container-id>
   ```

2. **Nginx config'i kontrol edin**:
   ```bash
   docker exec <container-id> cat /etc/nginx/conf.d/default.conf
   ```
   
   Çıktıda şunları görmeli siniz:
   ```nginx
   location ~* \.m?js$ {
       types {
           application/javascript js mjs;
       }
       ...
   }
   ```

3. **MIME types dosyasını kontrol edin**:
   ```bash
   docker exec <container-id> cat /etc/nginx/mime.types | grep javascript
   ```
   Çıktı şöyle olmalı:
   ```
   application/javascript  js;
   ```

4. **Bir JS dosyasının header'larını kontrol edin**:
   ```bash
   docker exec <container-id> sh -c "cd /usr/share/nginx/html && find . -name '*.js' | head -1"
   ```

### Cache Sorunu

Eğer eski dosyalar yükleniyorsa:
- Browser cache'i temizleyin (Cmd+Shift+R veya Ctrl+Shift+R)
- Coolify'da rebuild yapın
- Incognito/Private mode'da test edin

### Build Hatası

Eğer build sırasında hata alırsanız:
1. `package-lock.json` dosyasını kontrol edin
2. Node version'ı kontrol edin (20-alpine kullanılıyor)
3. Coolify build loglarını inceleyin

## Notlar

- ✅ Nginx Alpine image kullanılıyor (küçük boyut)
- ✅ Multi-stage build ile sadece gerekli dosyalar production'a gidiyor
- ✅ Gzip compression ile transfer boyutu küçültülüyor
- ✅ Static asset'ler 1 yıl cache'leniyor
- ✅ Security headers eklendi
- ✅ Font dosyaları için CORS aktif

## Önemli Hatırlatmalar

1. **ASLA `add_header Content-Type` kullanmayın** - Bu Nginx'te yanlış bir yaklaşımdır
2. **Her zaman `types {}` bloğu kullanın** - Bu doğru MIME type ayarlama yöntemidir
3. **Deploy sonrası cache temizleyin** - Eski dosyalar sorun yaratabilir
4. **Network tab'ı kontrol edin** - Content-Type header'larını doğrulayın
