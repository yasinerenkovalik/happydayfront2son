import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCities, useDistricts, useCategories } from '../../hooks/useFilterData'
import SimpleLocationPicker from '../Map/SimpleLocationPicker'

const SearchForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    venueType: ''
  })
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState({ lat: null, lng: null })

  // API'den verileri çek
  const { cities } = useCities()
  const { districts } = useDistricts(formData.city)
  const { categories } = useCategories()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Form verilerini URL parametrelerine çevir
    const searchParams = new URLSearchParams()
    
    if (formData.city) {
      searchParams.set('cityId', formData.city)
    }
    if (formData.district) {
      searchParams.set('districtId', formData.district)
    }
    if (formData.venueType) {
      searchParams.set('categoryId', formData.venueType)
    }
    
    // Konum bilgileri varsa ekle
    if (selectedLocation.lat && selectedLocation.lng) {
      searchParams.set('lat', selectedLocation.lat.toString())
      searchParams.set('lng', selectedLocation.lng.toString())
    }
    
    // Services sayfasına yönlendir
    const queryString = searchParams.toString()
    navigate(`/services${queryString ? `?${queryString}` : ''}`)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      
      // Şehir değiştiğinde ilçeyi sıfırla
      if (name === 'city') {
        newData.district = ''
      }
      
      return newData
    })
  }

  const handleLocationSelect = (lat, lng) => {
    setSelectedLocation({ lat, lng })
    setShowLocationPicker(false)
  }

  const clearLocation = () => {
    setSelectedLocation({ lat: null, lng: null })
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-4 items-center bg-background-light dark:bg-background-dark rounded-full shadow-lg p-2 gap-2">
        <div className="relative">
          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            location_on
          </span>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full bg-transparent border-none focus:ring-0 text-content-light dark:text-content-dark pl-10 pr-4 py-3 rounded-full appearance-none"
          >
            <option value="">Şehir Seçin</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.cityName}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            map
          </span>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            disabled={!formData.city}
            className="w-full bg-transparent border-none focus:ring-0 text-content-light dark:text-content-dark pl-10 pr-4 py-3 rounded-full appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">İlçe Seçin</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.districtName || district.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            celebration
          </span>
          <select
            name="venueType"
            value={formData.venueType}
            onChange={handleChange}
            className="w-full bg-transparent border-none focus:ring-0 text-content-light dark:text-content-dark pl-10 pr-4 py-3 rounded-full appearance-none"
          >
            <option value="">Mekan Türü</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName || category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1">
         
          <button
            type="submit"
            className="bg-primary text-white font-bold px-4 py-3 rounded-full shrink-0 hover:bg-primary/90 transition-colors w-full"
          >
            Ara
          </button>
        </div>
      </div>

      {/* Konum Seçici Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-content-light dark:text-content-dark">
                  Harita Üzerinden Konum Seçin
                </h3>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <SimpleLocationPicker
                latitude={selectedLocation.lat}
                longitude={selectedLocation.lng}
                onLocationChange={handleLocationSelect}
              />

              {selectedLocation.lat && selectedLocation.lng && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Seçilen Konum: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                    <button
                      type="button"
                      onClick={clearLocation}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Temizle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      <div className="md:hidden bg-background-light dark:bg-background-dark rounded-xl shadow-lg p-4 space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            location_on
          </span>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full bg-transparent border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-content-light dark:text-content-dark pl-10 pr-4 py-3 rounded-lg appearance-none"
          >
            <option value="">Şehir Seçin</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.cityName}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            map
          </span>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            disabled={!formData.city}
            className="w-full bg-transparent border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-content-light dark:text-content-dark pl-10 pr-4 py-3 rounded-lg appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">İlçe Seçin</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.districtName || district.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            celebration
          </span>
          <select
            name="venueType"
            value={formData.venueType}
            onChange={handleChange}
            className="w-full bg-transparent border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary focus:border-transparent text-content-light dark:text-content-dark pl-10 pr-4 py-3 rounded-lg appearance-none"
          >
            <option value="">Mekan Türü</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName || category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowLocationPicker(true)}
            className="bg-green-600 text-white font-bold px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Haritadan
          </button>
          <button
            type="submit"
            className="bg-primary text-white font-bold px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ara
          </button>
        </div>
      </div>
    </form>
  )
}

export default SearchForm