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
- ✅ `/etc/nginx/mime.types` dahil edildi (tüm MIME type'ları içerir)
- ✅ UTF-8 charset ayarlandı
- ✅ Gzip compression aktif
- ✅ Static asset cache ayarları
- ✅ SPA routing desteği

### 2. Dockerfile
- ✅ Multi-stage build (küçük image boyutu)
- ✅ Nginx config doğru yere kopyalanıyor
- ✅ Port 80 expose ediliyor

### 3. Build Optimizasyonları
- ✅ Vite production build optimize edildi
- ✅ Vendor chunk'ları ayrıldı
- ✅ Minification aktif

## Coolify'da Deployment

### Adım 1: Projeyi Git'e Push Edin
```bash
git add .
git commit -m "Fix MIME type issue for production deployment"
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

## Test Etme

Deploy sonrası kontrol edin:

1. **Browser Console**: JavaScript hataları var mı?
2. **Network Tab**: 
   - JS dosyaları `application/javascript` olarak mı sunuluyor?
   - CSS dosyaları `text/css` olarak mı sunuluyor?
3. **Response Headers**:
   ```
   Content-Type: application/javascript; charset=utf-8
   ```

## Manuel Test

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
   docker logs <container-id>
   ```

2. **Nginx config'i kontrol edin**:
   ```bash
   docker exec <container-id> cat /etc/nginx/conf.d/default.conf
   ```

3. **MIME types dosyasını kontrol edin**:
   ```bash
   docker exec <container-id> cat /etc/nginx/mime.types | grep javascript
   ```
   Çıktı şöyle olmalı:
   ```
   application/javascript  js;
   ```

### Cache Sorunu

Eğer eski dosyalar yükleniyorsa:
- Browser cache'i temizleyin (Cmd+Shift+R veya Ctrl+Shift+R)
- Coolify'da rebuild yapın

## Notlar

- ✅ Nginx Alpine image kullanılıyor (küçük boyut)
- ✅ Multi-stage build ile sadece gerekli dosyalar production'a gidiyor
- ✅ Gzip compression ile transfer boyutu küçültülüyor
- ✅ Static asset'ler 1 yıl cache'leniyor
