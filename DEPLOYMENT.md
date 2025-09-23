# Vercel Deployment Talimatları

## 1. Vercel'de Environment Variables Ayarlama

Vercel dashboard'unda projenizin Settings > Environment Variables bölümünde:

```
Name: VITE_API_BASE_URL
Value: (boş bırakın - production'da proxy kullanılır)
Environment: Production
```

## 2. Vercel Proxy Yapılandırması

`vercel.json` dosyası otomatik olarak:
- `/api/*` isteklerini `http://193.111.77.142/api/*` adresine yönlendirir
- `/api-static/*` isteklerini `http://193.111.77.142/*` adresine yönlendirir (resimler için)

## 3. HTTPS Sorunu Çözümü

### Sorun:
- Vercel HTTPS kullanır
- API sunucunuz HTTP kullanır
- Browser mixed content hatası verir

### Çözüm:
- Vercel proxy kullanarak tüm API istekleri HTTPS üzerinden yapılır
- Browser güvenlik hatası almaz

## 4. Development vs Production

### Development (localhost):
```javascript
// API istekleri direkt HTTP sunucuya gider
fetch('http://193.111.77.142/api/endpoint')
```

### Production (Vercel):
```javascript
// API istekleri Vercel proxy üzerinden gider
fetch('/api/endpoint') // Vercel bunu http://193.111.77.142/api/endpoint'e yönlendirir
```

## 5. Deployment Adımları

1. Kodu GitHub'a push edin
2. Vercel'de projeyi import edin
3. Environment variables ayarlayın (yukarıda belirtildiği gibi)
4. Deploy edin

## 6. Test Etme

Deployment sonrası test edin:
- Login işlemi çalışıyor mu?
- API istekleri başarılı mı?
- Resimler yükleniyor mu?
- Console'da HTTPS hatası var mı?

## 7. Sorun Giderme

Eğer hala HTTPS hatası alıyorsanız:

1. Browser console'u kontrol edin
2. Network tab'inde istekleri kontrol edin
3. Vercel function logs'unu kontrol edin
4. API sunucusunun erişilebilir olduğunu kontrol edin

## 8. Alternatif Çözümler

Eğer proxy çalışmazsa:

### Seçenek A: API Sunucusunu HTTPS'e Geçirin
- SSL sertifikası ekleyin
- HTTPS port açın

### Seçenek B: CORS Headers Ekleyin
API sunucunuzda:
```
Access-Control-Allow-Origin: https://yourdomain.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
```

### Seçenek C: Vercel Serverless Functions
API isteklerini Vercel functions üzerinden proxy edin.