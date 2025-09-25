import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/api';

const OrganizationMap = ({ organizations = [] }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Fiyat formatlama
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₺0'
    return `₺${price.toLocaleString('tr-TR')}`
  }

  // Leaflet haritasını yükle
  useEffect(() => {
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
        // Türkiye merkezli harita
        mapInstance.current = window.L.map(mapRef.current).setView([39.9334, 32.8597], 6);

        // Tile layer ekle
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        setMapLoaded(true);
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersRef.current = [];
        setMapLoaded(false);
      }
    };
  }, []);

  // Organizasyonları konuma göre grupla
  const groupOrganizationsByLocation = (organizations) => {
    const groups = {};
    const tolerance = 0.001; // Yaklaşık 100 metre tolerans

    organizations.forEach(org => {
      const lat = parseFloat(org.latitude);
      const lng = parseFloat(org.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      // Mevcut grupları kontrol et
      let foundGroup = false;
      for (const key in groups) {
        const [groupLat, groupLng] = key.split(',').map(parseFloat);
        if (Math.abs(lat - groupLat) < tolerance && Math.abs(lng - groupLng) < tolerance) {
          groups[key].push(org);
          foundGroup = true;
          break;
        }
      }

      // Yeni grup oluştur
      if (!foundGroup) {
        const key = `${lat},${lng}`;
        groups[key] = [org];
      }
    });

    return groups;
  };

  // Organizasyonları haritaya ekle
  useEffect(() => {
    if (mapInstance.current && mapLoaded && organizations.length > 0) {
      // Eski marker'ları temizle
      markersRef.current.forEach(marker => {
        mapInstance.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Geçerli koordinatlara sahip organizasyonları filtrele
      const validOrgs = organizations.filter(org => 
        org.latitude && org.longitude && 
        !isNaN(parseFloat(org.latitude)) && 
        !isNaN(parseFloat(org.longitude))
      );

      if (validOrgs.length === 0) return;

      // Organizasyonları konuma göre grupla
      const locationGroups = groupOrganizationsByLocation(validOrgs);

      // Her grup için marker ekle
      Object.entries(locationGroups).forEach(([locationKey, orgsInLocation]) => {
        const [lat, lng] = locationKey.split(',').map(parseFloat);
        const orgCount = orgsInLocation.length;

        // Grup için marker ikonu oluştur
        let markerHtml, iconSize;
        
        if (orgCount === 1) {
          // Tek organizasyon
          const org = orgsInLocation[0];
          markerHtml = `
            <div class="organization-marker single">
              <div class="marker-pin">
                <span class="material-symbols-outlined">location_on</span>
              </div>
              <div class="marker-price">${formatPrice(org.price)}</div>
            </div>
          `;
          iconSize = [60, 80];
        } else {
          // Çoklu organizasyon - cluster
          const minPrice = Math.min(...orgsInLocation.map(org => org.price || 0));
          const maxPrice = Math.max(...orgsInLocation.map(org => org.price || 0));
          markerHtml = `
            <div class="organization-marker cluster">
              <div class="marker-cluster">
                <span class="cluster-count">${orgCount}</span>
              </div>
              <div class="marker-price-range">
                ${minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
              </div>
            </div>
          `;
          iconSize = [80, 100];
        }

        const customIcon = window.L.divIcon({
          html: markerHtml,
          className: 'custom-marker',
          iconSize: iconSize,
          iconAnchor: [iconSize[0]/2, iconSize[1]],
          popupAnchor: [0, -iconSize[1]]
        });

        // Marker oluştur
        const marker = window.L.marker([lat, lng], { icon: customIcon })
          .addTo(mapInstance.current);

        // Popup içeriği - tek veya çoklu organizasyon
        let popupContent;
        
        if (orgCount === 1) {
          const org = orgsInLocation[0];
          popupContent = `
            <div class="organization-popup single">
              <div class="popup-image">
                <img src="${getImageUrl(org.coverPhotoPath)}" alt="${org.title}" 
                     onerror="this.src='https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'" />
              </div>
              <div class="popup-content">
                <h3 class="popup-title">${org.title || 'Başlık Yok'}</h3>
                <div class="popup-location">
                  <span class="material-symbols-outlined">location_on</span>
                  <span>${org.cityName || 'Şehir'}, ${org.districtName || 'İlçe'}</span>
                </div>
                <div class="popup-price">${formatPrice(org.price)}</div>
                <div class="popup-actions">
                  <a href="/organization/${org.id}" class="popup-button">
                    <span class="material-symbols-outlined">visibility</span>
                    Detayları Gör
                  </a>
                </div>
              </div>
            </div>
          `;
        } else {
          // Çoklu organizasyon listesi
          const orgList = orgsInLocation.map(org => `
            <div class="popup-org-item">
              <div class="popup-org-image">
                <img src="${getImageUrl(org.coverPhotoPath)}" alt="${org.title}" 
                     onerror="this.src='https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'" />
              </div>
              <div class="popup-org-info">
                <h4 class="popup-org-title">${org.title || 'Başlık Yok'}</h4>
                <div class="popup-org-price">${formatPrice(org.price)}</div>
                <a href="/organization/${org.id}" class="popup-org-button">
                  <span class="material-symbols-outlined">visibility</span>
                  Detay
                </a>
              </div>
            </div>
          `).join('');

          popupContent = `
            <div class="organization-popup cluster">
              <div class="popup-header">
                <h3 class="popup-cluster-title">Bu Konumda ${orgCount} Organizasyon</h3>
                <div class="popup-location">
                  <span class="material-symbols-outlined">location_on</span>
                  <span>${orgsInLocation[0].cityName || 'Şehir'}, ${orgsInLocation[0].districtName || 'İlçe'}</span>
                </div>
              </div>
              <div class="popup-org-list">
                ${orgList}
              </div>
            </div>
          `;
        }

        marker.bindPopup(popupContent, {
          maxWidth: orgCount === 1 ? 300 : 400,
          className: 'organization-popup-container'
        });

        // Marker tıklama olayı
        marker.on('click', () => {
          if (orgCount === 1) {
            setSelectedOrg(orgsInLocation[0]);
          }
        });

        markersRef.current.push(marker);
      });

      // Haritayı tüm marker'ları gösterecek şekilde ayarla
      if (markersRef.current.length > 1) {
        try {
          const group = new window.L.featureGroup(markersRef.current);
          mapInstance.current.fitBounds(group.getBounds().pad(0.1));
        } catch (error) {
          console.warn('Harita bounds ayarlanamadı:', error);
          // Fallback: Türkiye merkezine odaklan
          mapInstance.current.setView([39.9334, 32.8597], 6);
        }
      } else if (markersRef.current.length === 1) {
        const firstGroup = Object.values(locationGroups)[0];
        const org = firstGroup[0];
        mapInstance.current.setView([parseFloat(org.latitude), parseFloat(org.longitude)], 12);
      }
    }
  }, [organizations, mapLoaded]);

  // Haritayı yeniden boyutlandır
  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.invalidateSize();
      }, 100);
    }
  }, [mapLoaded]);

  return (
    <div className="space-y-4">
      {/* Harita Başlığı */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-content-light dark:text-content-dark">
          Organizasyonlar Haritası
        </h3>
        <div className="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>{organizations.filter(org => org.latitude && org.longitude).length} konum gösteriliyor</span>
        </div>
      </div>

      {/* Harita Container */}
      <div className="relative w-full h-96 rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
        <div 
          ref={mapRef}
          className="w-full h-full"
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Harita yükleniyor...</p>
            </div>
          </div>
        )}
      </div>

      {/* Harita Stilleri */}
      <style>{`
        .organization-marker {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        /* Tek organizasyon marker'ı */
        .organization-marker.single .marker-pin {
          background: #ef4444;
          color: white;
          border-radius: 50% 50% 50% 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .organization-marker.single .marker-pin .material-symbols-outlined {
          transform: rotate(45deg);
          font-size: 16px;
        }
        
        /* Cluster marker'ı */
        .organization-marker.cluster .marker-cluster {
          background: #2563eb;
          color: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        }
        
        .cluster-count {
          font-size: 14px;
          font-weight: bold;
        }
        
        .marker-price, .marker-price-range {
          background: white;
          color: #ef4444;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          margin-top: 2px;
          border: 1px solid #ef4444;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          white-space: nowrap;
        }
        
        .marker-price-range {
          color: #2563eb;
          border-color: #2563eb;
        }
        
        .organization-popup {
          width: 280px;
        }
        
        .popup-image {
          width: 100%;
          height: 120px;
          overflow: hidden;
          border-radius: 8px 8px 0 0;
        }
        
        .popup-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .popup-content {
          padding: 12px;
        }
        
        .popup-title {
          font-size: 16px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
          line-height: 1.2;
        }
        
        .popup-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .popup-location .material-symbols-outlined {
          font-size: 16px;
        }
        
        .popup-price {
          font-size: 18px;
          font-weight: bold;
          color: #ef4444;
          margin-bottom: 12px;
        }
        
        .popup-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ef4444;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .popup-button:hover {
          background: #dc2626;
        }
        
        .popup-button .material-symbols-outlined {
          font-size: 16px;
        }
      `}</style>

      {/* Harita Bilgilendirme */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">info</span>
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
              Harita Kullanım Rehberi:
            </p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Kırmızı pin'lere tıklayarak organizasyon detaylarını görün</li>
              <li>• Pin'lerin altındaki fiyat etiketleri ile hızlıca karşılaştırma yapın</li>
              <li>• Popup'ta "Detayları Gör" butonuna tıklayarak organizasyon sayfasına gidin</li>
              <li>• Haritayı zoom yaparak daha detaylı görüntüleyin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationMap;