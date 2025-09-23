import { useState, useEffect } from 'react'
import { getApiUrl } from '../utils/api'

// Şehirleri çekmek için hook
export const useCities = () => {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true)
        const response = await fetch(getApiUrl('/City/CityGetAll'), {
          method: 'GET',
          headers: {
            'Accept': 'text/plain',
          },
          mode: 'cors'
        })
        
        if (!response.ok) {
          throw new Error(`Şehirler API Hatası: ${response.status}`)
        }
        
        const result = await response.json()
        if (result.isSuccess) {
          // Yeni response yapısına göre: data array içinde id ve cityName var
          setCities(result.data || [])
        } else {
          throw new Error(result.message || 'Şehirler yüklenirken hata oluştu')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [])

  return { cities, loading, error }
}

// İlçeleri çekmek için hook
export const useDistricts = (cityId) => {
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cityId) {
      setDistricts([])
      return
    }

    const fetchDistricts = async () => {
      try {
        setLoading(true)
        const response = await fetch(getApiUrl('/District/GetAllDisctrictByCity'), {
          method: 'POST',
          headers: {
            'Accept': 'text/plain',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            cityId: parseInt(cityId)
          })
        })
        
        if (!response.ok) {
          throw new Error(`İlçeler API Hatası: ${response.status}`)
        }
        
        const result = await response.json()
        if (result.isSuccess) {
          setDistricts(result.data || [])
        } else {
          throw new Error(result.message || 'İlçeler yüklenirken hata oluştu')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDistricts()
  }, [cityId])

  return { districts, loading, error }
}

// Kategorileri çekmek için hook
export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch(getApiUrl('/Category/CategoryGetAll'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors'
        })
        
        if (!response.ok) {
          throw new Error(`Kategoriler API Hatası: ${response.status}`)
        }
        
        const result = await response.json()
        if (result.isSuccess) {
          setCategories(result.data || [])
        } else {
          throw new Error(result.message || 'Kategoriler yüklenirken hata oluştu')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}