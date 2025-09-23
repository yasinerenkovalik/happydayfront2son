import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCities, useDistricts, useCategories } from '../../hooks/useFilterData'

const SearchForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    venueType: ''
  })

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

        <button
          type="submit"
          className="bg-primary text-white font-bold px-6 py-3 rounded-full shrink-0 hover:bg-primary/90 transition-colors w-full"
        >
          Ara
        </button>
      </div>

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

        <button
          type="submit"
          className="bg-primary text-white font-bold px-6 py-3 rounded-lg w-full hover:bg-primary/90 transition-colors"
        >
          Ara
        </button>
      </div>
    </form>
  )
}

export default SearchForm