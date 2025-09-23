import { useState, useEffect } from 'react'

const SimpleLocationPicker = ({ latitude, longitude, onLocationChange, disabled = false }) => {
  const [currentLat, setCurrentLat] = useState(parseFloat(latitude) || 41.0082)
  const [currentLng, setCurrentLng] = useState(parseFloat(longitude) || 28.9784)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Props değiştiğinde state'i güncelle
  useEffect(() => {
    if (latitude && longitude) {
      setCurrentLat(parseFloat(latitude))
      setCurrentLng(parseFloat(longitude))
    }
  }, [latitude, longitude])

  // Mevcut konumu al
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCurrentLat(lat)
          setCurrentLng(lng)
          onLocationChange(lat, lng)
          setIsGettingLocation(false)
        },
        (error) => {
          console.error('Konum alınamadı:', error)
          alert('Konum bilgisi alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.')
          setIsGettingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      alert('Tarayıcınız konum hizmetlerini desteklemiyor.')
    }
  }

  // Manuel konum girişi
  const handleManualInput = (field, value) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      if (field === 'lat') {
        setCurrentLat(numValue)
        onLocationChange(numValue, currentLng)
      } else {
        setCurrentLng(numValue)
        onLocationChange(currentLat, numValue)
      }
    }
  }

  // Harita URL'si oluştur (OpenStreetMap)
  const getMapUrl = () => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng-0.01},${currentLat-0.01},${currentLng+0.01},${currentLat+0.01}&layer=mapnik&marker=${currentLat},${currentLng}`
  }

  // Google Maps URL'si
  const getGoogleMapsUrl = () => {
    return `https://www.google.com/maps?q=${currentLat},${currentLng}&z=15&output=embed`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-content-light dark:text-content-dark">
          Konum Bilgileri
        </h4>
        {!disabled && (
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="flex items-center gap-2 px-3 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isGettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                Alınıyor...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">my_location</span>
                Mevcut Konum
              </>
            )}
          </button>
        )}
      </div>

      {/* Manuel Konum Girişi - Sadece disabled değilse göster */}
      {!disabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Enlem (Latitude)
            </label>
            <input
              type="number"
              step="any"
              value={currentLat}
              onChange={(e) => handleManualInput('lat', e.target.value)}
              className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark"
              placeholder="Örn: 41.0082"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
              Boylam (Longitude)
            </label>
            <input
              type="number"
              step="any"
              value={currentLng}
              onChange={(e) => handleManualInput('lng', e.target.value)}
              className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark"
              placeholder="Örn: 28.9784"
            />
          </div>
        </div>
      )}

      {/* Harita Önizlemesi */}
      <div className="space-y-2">
        {!disabled && (
          <h5 className="text-sm font-medium text-content-light dark:text-content-dark">
            Konum Önizlemesi
          </h5>
        )}
        <div className="relative">
          <iframe
            src={getMapUrl()}
            className="w-full h-64 rounded-lg border border-border-light dark:border-border-dark"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            title="Konum Haritası"
          />
          <div className="absolute top-2 right-2 space-x-2">
            <a
              href={`https://www.openstreetmap.org/?mlat=${currentLat}&mlon=${currentLng}&zoom=15`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-xs rounded shadow hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">open_in_new</span>
              OpenStreetMap
            </a>
            <a
              href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-800/90 text-xs rounded shadow hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">open_in_new</span>
              Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Konum Bilgileri - Sadece disabled değilse göster */}
      {!disabled && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">info</span>
            <div className="text-sm">
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                Seçili Konum: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                Koordinatları manuel olarak girebilir veya "Mevcut Konum" butonunu kullanabilirsiniz
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleLocationPicker