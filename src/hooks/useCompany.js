import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getApiUrl } from '../utils/api'

const useCompany = () => {
  const { user, getAuthHeaders } = useAuth()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCompany = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user?.companyId) {
        throw new Error('Şirket ID bulunamadı')
      }

      const response = await fetch(getApiUrl(`/Company/getbyid?Id=${user.companyId}`), {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          ...getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Şirket bilgileri yüklenemedi')
      }

      const result = await response.json()
      if (result.isSuccess && result.data) {
        setCompany(result.data)
      } else {
        throw new Error(result.message || 'Şirket bilgileri alınamadı')
      }
    } catch (err) {
      setError(err.message)
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.companyId) {
      fetchCompany()
    } else {
      setLoading(false)
    }
  }, [user?.companyId])

  const refetch = () => {
    fetchCompany()
  }

  return {
    company,
    loading,
    error,
    refetch
  }
}

export default useCompany