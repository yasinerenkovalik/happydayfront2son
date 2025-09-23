import { useState, useEffect } from 'react'

const LocationPicker = ({ latitude, longitude, onLocationChange, disabled = false }) => {
  const [coords, setCoords] = useState({
    lat: latitude || 41.0082,
    lng: longitude || 28.9784
  })

  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (latitude && longitude) {
      setCoords({ lat: latitude, lng: longitude })
    }
  }, [latitude, longitude])

  const handleCoordChange = (field, value) => {
    const newCoords = { ...coords, [field]: parseFloat(value) || 0 }
    setCoords(newCoords)
    onLocationChange(newCoords.lat, newCoords.lng)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCoords(newCoords)
          onLocationChange(newCoords.lat, newCoords.lng)
        },
        (error) => {
          console.error('Konum alınamadı:', error)
          alert('Konum bilgisi alınamadı. Lütfen tarayıcınızda konum iznini kontrol edin.')
        }
      )
    } else {
      alert('Tarayıcınız konum hizmetlerini desteklemiyor.')
    }
  }

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/@${coords.lat},${coords.lng},15z`
    window.open(url, '_blank')
  }

  const openMapSelector = () => {
    const url = `https://www.google.com/maps/place/${coords.lat},${coords.lng}/@${coords.lat},${coords.lng},15z`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
          Konum Bilgileri
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">my_location</span>
            Mevcut Konum
          </button>
          <button
            type="button"
            onClick={openMapSelector}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Haritadan Seç
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
            Enlem (Latitude)
          </label>
          <input
            type="number"
            step="any"
            value={coords.lat}
            onChange={(e) => handleCoordChange('lat', e.target.value)}
            placeholder="41.0082"
            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={disabled}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-light dark:text-content-dark mb-2">
            Boylam (Longitude)
          </label>
          <input
            type="number"
            step="any"
            value={coords.lng}
            onChange={(e) => handleCoordChange('lng', e.target.value)}
            placeholder="28.9784"
            className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Konum Önizlemesi */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-content-light dark:text-content-dark">
            Konum Önizlemesi
          </h4>
          <button
            type="button"
            onClick={openGoogleMaps}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Google Maps'te Aç
          </button>
        </div>
        
        <div className="text-sm text-subtle-light dark:text-subtle-dark space-y-1">
          <p><strong>Koordinatlar:</strong> {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
          <p><strong>Google Maps Link:</strong></p>
          <a 
            href={`https://www.google.com/maps/@${coords.lat},${coords.lng},15z`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs break-all"
          >
            https://www.google.com/maps/@{coords.lat},{coords.lng},15z
          </a>
        </div>
      </div>

      {/* Kullanım Talimatları */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">
          💡 Konum Seçme Rehberi
        </h4>
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p><strong>Yöntem 1:</strong> "Mevcut Konum" butonuna tıklayarak bulunduğunuz konumu alın.</p>
          <p><strong>Yöntem 2:</strong> "Haritadan Seç" butonuna tıklayarak Google Maps'te konumu seçin.</p>
          <p><strong>Yöntem 3:</strong> Google Maps'te istediğiniz yere sağ tıklayıp koordinatları kopyalayın.</p>
          <p><strong>Manuel:</strong> Enlem ve boylam değerlerini doğrudan yazabilirsiniz.</p>
        </div>
      </div>
    </div>
  )
}

export default LocationPicker