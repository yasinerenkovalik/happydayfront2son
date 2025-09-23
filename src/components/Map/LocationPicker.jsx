import { useState, useEffect, useRef } from 'react'

const LocationPicker = ({ latitude, longitude, onLocationChange, disabled = false }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Google Maps API'sini yükle
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap()
        return
      }

      // Google Maps API script'ini yükle
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeMap
      script.onerror = () => {
        setError('Google Maps yüklenemedi')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  const initializeMap = () => {
    try {
      const initialLat = parseFloat(latitude) || 41.0082
      const initialLng = parseFloat(longitude) || 28.9784

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      const markerInstance = new window.google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: mapInstance,
        draggable: !disabled,
        title: 'Şirket Konumu'
      })

      // Marker sürüklendiğinde konum güncelle
      if (!disabled) {
        markerInstance.addListener('dragend', (event) => {
          const newLat = event.latLng.lat()
          const newLng = event.latLng.lng()
          onLocationChange(newLat, newLng)
        })

        // Haritaya tıklandığında marker'ı taşı
        mapInstance.addListener('click', (event) => {
          const newLat = event.latLng.lat()
          const newLng = event.latLng.lng()
          markerInstance.setPosition({ lat: newLat, lng: newLng })
          onLocationChange(newLat, newLng)
        })
      }

      setMap(mapInstance)
      setMarker(markerInstance)
      setIsLoading(false)
    } catch (err) {
      setError('Harita başlatılamadı')
      setIsLoading(false)
    }
  }

  // Konum değiştiğinde marker'ı güncelle
  useEffect(() => {
    if (marker && latitude && longitude) {
      const newLat = parseFloat(latitude)
      const newLng = parseFloat(longitude)
      if (!isNaN(newLat) && !isNaN(newLng)) {
        marker.setPosition({ lat: newLat, lng: newLng })
        if (map) {
          map.setCenter({ lat: newLat, lng: newLng })
        }
      }
    }
  }, [latitude, longitude, marker, map])

  // Mevcut konumu al
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          onLocationChange(lat, lng)
        },
        (error) => {
          console.error('Konum alınamadı:', error)
          alert('Konum bilgisi alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.')
        }
      )
    } else {
      alert('Tarayıcınız konum hizmetlerini desteklemiyor.')
    }
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-border-light dark:border-border-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">error</span>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Konum bilgilerini manuel olarak girebilirsiniz</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-content-light dark:text-content-dark">
          Harita Üzerinden Konum Seçimi
        </h4>
        {!disabled && (
          <button
            type="button"
            onClick={getCurrentLocation}
            className="flex items-center gap-2 px-3 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">my_location</span>
            Mevcut Konum
          </button>
        )}
      </div>
      
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border border-border-light dark:border-border-dark"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Harita yükleniyor...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {disabled ? (
          <p>📍 Mevcut konum görüntüleniyor</p>
        ) : (
          <p>💡 Haritaya tıklayarak veya marker'ı sürükleyerek konum seçebilirsiniz</p>
        )}
      </div>
    </div>
  )
}

export default LocationPicker