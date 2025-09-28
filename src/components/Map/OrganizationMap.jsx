import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/api';

const OrganizationMap = ({ organizations = [] }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef([]); // marker + çizgi + hub hepsi burada tutulacak

  const formatPrice = (price) => {
    const n = typeof price === 'string' ? Number(price) : price;
    if (!n || isNaN(n)) return '₺0';
    return `₺${n.toLocaleString('tr-TR')}`;
  };

  useEffect(() => {
    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
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
        mapInstance.current = window.L.map(mapRef.current).setView([39.9334, 32.8597], 6);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        setMapLoaded(true);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        layersRef.current = [];
        setMapLoaded(false);
      }
    };
  }, []);

  const groupOrganizationsByLocation = (items) => {
    const groups = {};
    const tolerance = 0.001; // ~100m
    items.forEach(org => {
      const lat = parseFloat(org.latitude);
      const lng = parseFloat(org.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      let foundKey = null;
      for (const key in groups) {
        const [gLat, gLng] = key.split(',').map(parseFloat);
        if (Math.abs(lat - gLat) < tolerance && Math.abs(lng - gLng) < tolerance) {
          foundKey = key;
          break;
        }
      }
      const key = foundKey ?? `${lat},${lng}`;
      groups[key] = groups[key] ? [...groups[key], org] : [org];
    });
    return groups;
  };

  // Daire yayılımı (spoke)
  const getMarkerOffset = (index, total) => {
    if (total <= 1) return [0, 0];
    const ringSize = 8;                       // bir halkada max 8 nokta
    const ring = Math.floor(index / ringSize); // kaçıncı halka
    const posInRing = index % ringSize;
    const baseRadius = 0.00045;               // ~50 m
    const radius = baseRadius + ring * 0.00018;
    const angle = (2 * Math.PI * posInRing) / Math.min(total, ringSize);
    const latOffset = radius * Math.cos(angle);
    const lngOffset = radius * Math.sin(angle);
    return [latOffset, lngOffset];
  };

  useEffect(() => {
    if (!(mapInstance.current && mapLoaded)) return;

    // Eski layer’ları temizle
    layersRef.current.forEach(layer => {
      try { 
        mapInstance.current.removeLayer(layer); 
      } catch (error) {
        // Ignore errors when removing layers
      }
    });
    layersRef.current = [];

    const validOrgs = organizations.filter(org =>
      org?.latitude && org?.longitude &&
      !isNaN(parseFloat(org.latitude)) &&
      !isNaN(parseFloat(org.longitude))
    );
    if (validOrgs.length === 0) return;

    const locationGroups = groupOrganizationsByLocation(validOrgs);

    Object.entries(locationGroups).forEach(([locationKey, orgsInLocation]) => {
      const [baseLat, baseLng] = locationKey.split(',').map(parseFloat);
      const orgCount = orgsInLocation.length;

      if (orgCount === 1) {
        const org = orgsInLocation[0];

        const markerHtml = `
          <div class="organization-marker single">
            <div class="marker-pin">
              <span class="material-symbols-outlined">location_on</span>
            </div>
            <div class="marker-price">${formatPrice(org.price)}</div>
          </div>
        `;
        const customIcon = window.L.divIcon({
          html: markerHtml,
          className: 'custom-marker',
          iconSize: [60, 80],
          iconAnchor: [30, 80],
          popupAnchor: [0, -80]
        });

        const marker = window.L.marker([baseLat, baseLng], { icon: customIcon, zIndexOffset: 0 })
          .addTo(mapInstance.current);

        const popupContent = `
          <div class="organization-popup single">
            <div class="popup-image">
              <img src="${getImageUrl(org.coverPhotoPath)}" alt="${org.title}"
                   onerror="this.src='https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=300&q=80'" />
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
        marker.bindPopup(popupContent, { maxWidth: 300, className: 'organization-popup-container' });
        marker.on('click', () => { setSelectedOrg(org); marker.setZIndexOffset(1000); });
        marker.on('popupclose', () => marker.setZIndexOffset(0));

        layersRef.current.push(marker);
      } else {
        // HUB: merkez nokta (küçük daire)
        const hub = window.L.circleMarker([baseLat, baseLng], {
          radius: 5,
          color: '#fb923c',        // turuncu kontur
          weight: 2,
          fillColor: '#fde68a',    // açık sarı iç
          fillOpacity: 0.9,
          pane: 'markerPane'
        }).addTo(mapInstance.current);
        layersRef.current.push(hub);

        // Her organizasyon için spoke + marker
        orgsInLocation.forEach((org, index) => {
          const [latOffset, lngOffset] = getMarkerOffset(index, orgCount);
          const markerLat = baseLat + latOffset;
          const markerLng = baseLng + lngOffset;

          // “ip/hat”
          const line = window.L.polyline(
            [[baseLat, baseLng], [markerLat, markerLng]],
            {
              color: '#fb923c',     // turuncu
              weight: 2,
              opacity: 0.6,
              bubblingMouseEvents: false
            }
          ).addTo(mapInstance.current);

          const markerHtml = `
            <div class="organization-marker small">
              <div class="marker-pin">
                <span class="material-symbols-outlined">location_on</span>
              </div>
              <div class="marker-price">${formatPrice(org.price)}</div>
            </div>
          `;
          const customIcon = window.L.divIcon({
            html: markerHtml,
            className: 'custom-marker',
            iconSize: [40, 55],
            iconAnchor: [20, 55],
            popupAnchor: [0, -55]
          });

          const marker = window.L.marker([markerLat, markerLng], { icon: customIcon, zIndexOffset: 0 })
            .addTo(mapInstance.current);

          const popupContent = `
            <div class="organization-popup single">
              <div class="popup-image">
                <img src="${getImageUrl(org.coverPhotoPath)}" alt="${org.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=150&q=80'" />
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
          marker.bindPopup(popupContent, { maxWidth: 300, className: 'organization-popup-container' });

          // Hover/Focus efektleri
          const emphasize = () => { line.setStyle({ weight: 3, opacity: 0.9 }); marker.setZIndexOffset(1200); };
          const deemphasize = () => { line.setStyle({ weight: 2, opacity: 0.6 }); marker.setZIndexOffset(0); };

          marker.on('mouseover', emphasize);
          marker.on('mouseout', deemphasize);
          marker.on('click', () => { setSelectedOrg(org); emphasize(); });
          marker.on('popupclose', deemphasize);

          layersRef.current.push(line, marker);
        });
      }
    });

    // Görüş alanı
    const onlyMarkers = layersRef.current.filter(l => l?.getLatLng); // polyline’ları atla (getBounds farklı)
    if (onlyMarkers.length > 1) {
      try {
        const group = new window.L.featureGroup(onlyMarkers);
        // Check if group is properly created and has getBounds method before using it
        if (group && typeof group.getBounds === 'function') {
          const bounds = group.getBounds();
          if (bounds && bounds.isValid()) {
            mapInstance.current.fitBounds(bounds.pad(0.1));
          } else {
            mapInstance.current.setView([39.9334, 32.8597], 6);
          }
        } else {
          mapInstance.current.setView([39.9334, 32.8597], 6);
        }
      } catch (error) {
        mapInstance.current.setView([39.9334, 32.8597], 6);
      }
    } else if (onlyMarkers.length === 1) {
      const ll = onlyMarkers[0].getLatLng();
      mapInstance.current.setView([ll.lat, ll.lng], 12);
    }
  }, [organizations, mapLoaded]);

  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current.invalidateSize();
      }, 100);
    }
  }, [mapLoaded]);

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-content-light dark:text-content-dark">
          Organizasyonlar Haritası
        </h3>
        <div className="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>{organizations.filter(org => org.latitude && org.longitude).length} konum gösteriliyor</span>
        </div>
      </div>

      {/* Harita */}
      <div className="relative w-full h-96 rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
        <div ref={mapRef} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Harita yükleniyor...</p>
            </div>
          </div>
        )}
      </div>

      {/* Stiller */}
      <style>{`
        .organization-marker {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          will-change: transform;
        }

        /* Tek marker (primary renk) */
        .organization-marker.single .marker-pin {
          background: #F8BBD0;
          color: #2D2D2D;
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

        /* Çoklu durumda küçük marker (turuncu) */
        .organization-marker.small .marker-pin {
          background: #f97316;
          color: white;
          border-radius: 50% 50% 50% 0;
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .organization-marker.small .marker-pin .material-symbols-outlined {
          transform: rotate(45deg);
          font-size: 12px;
        }
        .organization-marker.small .marker-price {
          background: white;
          color: #f97316;
          padding: 1px 3px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: bold;
          margin-top: 1px;
          border: 1px solid #f97316;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          white-space: nowrap;
        }

        .marker-price {
          background: white;
          color: #F8BBD0;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          margin-top: 2px;
          border: 1px solid #F8BBD0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          white-space: nowrap;
        }

        .organization-popup { width: 280px; }
        .popup-image { width: 100%; height: 120px; overflow: hidden; border-radius: 8px 8px 0 0; }
        .popup-image img { width: 100%; height: 100%; object-fit: cover; }
        .popup-content { padding: 12px; }
        .popup-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 8px; line-height: 1.2; }
        .popup-location { display: flex; align-items: center; gap: 4px; color: #6b7280; font-size: 14px; margin-bottom: 8px; }
        .popup-location .material-symbols-outlined { font-size: 16px; }
        .popup-price { font-size: 18px; font-weight: bold; color: #F8BBD0; margin-bottom: 12px; }
        .popup-button { display: inline-flex; align-items: center; gap: 6px; background: #F8BBD0; color: #2D2D2D; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; transition: background-color 0.2s; }
        .popup-button:hover { background: #F5E6CC; }
      `}</style>

      {/* Bilgilendirme */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">info</span>
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">Harita Kullanım Rehberi:</p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Aynı lokasyondaki seçenekler merkez hub’dan “iplerle” gösterilir</li>
              <li>• Marker üzerine gelince ilgili ip vurgulanır</li>
              <li>• “Detayları Gör” ile organizasyon sayfasına gidin</li>
              <li>• Yakınlaştırıp uzaklaştırarak daha detaylı görüntüleyin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationMap;
