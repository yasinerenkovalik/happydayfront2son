import { useState, useEffect, useRef } from 'react';

const SimpleLocationPicker = ({ latitude, longitude, onLocationChange, disabled = false }) => {
  const [currentLat, setCurrentLat] = useState(parseFloat(latitude) || 41.0082);
  const [currentLng, setCurrentLng] = useState(parseFloat(longitude) || 28.9784);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  // Props değiştiğinde state'i güncelle
  useEffect(() => {
    const newLat = parseFloat(latitude);
    const newLng = parseFloat(longitude);
    
    if (!isNaN(newLat) && !isNaN(newLng)) {
      setCurrentLat(newLat);
      setCurrentLng(newLng);
      
      // Harita yüklendiyse konumu güncelle
      if (mapInstance.current && markerRef.current) {
        mapInstance.current.setView([newLat, newLng], mapInstance.current.getZoom());
        markerRef.current.setLatLng([newLat, newLng]);
      }
    }
  }, [latitude, longitude]);

  // Leaflet haritasını yükle
  useEffect(() => {
    // Leaflet CSS ve JS'i dinamik olarak yükle
    const loadLeaflet = async () => {
      // CSS yükle
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // JS yükle
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (mapRef.current && !mapInstance.current) {
        // Haritayı oluştur
        mapInstance.current = window.L.map(mapRef.current).setView([currentLat, currentLng], 13);

        // Tile layer ekle
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Marker ekle
        markerRef.current = window.L.marker([currentLat, currentLng], {
          draggable: !disabled
        }).addTo(mapInstance.current);

        // Marker sürüklendiğinde
        if (!disabled) {
          markerRef.current.on('dragend', function(e) {
            const position = e.target.getLatLng();
            setCurrentLat(position.lat);
            setCurrentLng(position.lng);
            onLocationChange(position.lat, position.lng);
          });

          // Haritaya tıklandığında
          mapInstance.current.on('click', function(e) {
            const { lat, lng } = e.latlng;
            setCurrentLat(lat);
            setCurrentLng(lng);
            onLocationChange(lat, lng);
            markerRef.current.setLatLng([lat, lng]);
          });
        }

        setMapLoaded(true);
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [disabled]);

  // Haritayı yeniden boyutlandır
  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.invalidateSize();
      }, 100);
    }
  }, [mapLoaded]);

  // Google Maps URL'i oluştur
  const getMapUrl = () => {
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgHz-y-2b8s&q=${currentLat},${currentLng}&zoom=15`
  }

  // OpenStreetMap URL'i oluştur (Google Maps alternatifi)
  const getOSMUrl = () => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng-0.01},${currentLat-0.01},${currentLng+0.01},${currentLat+0.01}&layer=mapnik&marker=${currentLat},${currentLng}`
  }

  return (
    <div className="space-y-4">
      {/* İnteraktif Harita */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium text-content-light dark:text-content-dark">
            İnteraktif Konum Haritası
          </h5>
          {!disabled && (
            <div className="flex items-center gap-2 text-xs text-subtle-light dark:text-subtle-dark">
              <span className="material-symbols-outlined text-xs">touch_app</span>
              <span>Haritaya tıklayın veya marker'ı sürükleyin</span>
            </div>
          )}
        </div>
        
        <div className="relative w-full h-64 rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
          <div 
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: '256px' }}
          />
          
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">İnteraktif harita yükleniyor...</p>
              </div>
            </div>
          )}
        </div>

        {!disabled && mapLoaded && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">info</span>
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  Konum Seçme Yöntemleri:
                </p>
                <ul className="text-blue-700 dark:text-blue-300 text-xs mt-1 space-y-1">
                  <li>• Haritaya tıklayarak konum seçin</li>
                  <li>• Kırmızı marker'ı sürükleyerek konumu değiştirin</li>
                  <li>• Yukarıdaki koordinat alanlarından manuel giriş yapın</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Harici Harita Linkleri */}
      <div className="flex flex-wrap gap-3">
        <a
          href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">map</span>
          Google Maps'te Aç
        </a>

        <a
          href={`https://www.openstreetmap.org/?mlat=${currentLat}&mlon=${currentLng}&zoom=15`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">public</span>
          OpenStreetMap'te Aç
        </a>

        <button
          onClick={() => {
            const mapUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`
            if (navigator.share) {
              navigator.share({
                title: 'Şirket Konumu',
                text: `Konum: ${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`,
                url: mapUrl
              })
            } else {
              navigator.clipboard.writeText(mapUrl)
              alert('Konum linki panoya kopyalandı!')
            }
          }}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">share</span>
          Konumu Paylaş
        </button>
      </div>

      {/* Konum Bilgileri */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">info</span>
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Mevcut Konum: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
              Yukarıdaki koordinat alanlarından konum değiştirebilirsiniz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLocationPicker;