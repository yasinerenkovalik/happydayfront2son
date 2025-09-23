import { useState, useEffect } from 'react'
import { getApiUrl } from '../utils/api'

const useOrganizationDetail = (organizationId) => {
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    const fetchOrganizationDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          getApiUrl(`/Organization/GetOrganizationWithImages?Id=${organizationId}`),
          {
            method: 'GET',
            headers: {
              'Accept': 'text/plain',
            },
            mode: 'cors'
          }
        )

        if (!response.ok) {
          throw new Error(`API Hatası: ${response.status} - ${response.statusText}`)
        }

        const result = await response.json()

        if (result.isSuccess) {
          setOrganization(result.data)
        } else {
          throw new Error(result.message || 'Organizasyon detayları yüklenirken hata oluştu')
        }
      } catch (err) {
        setError(err.message)
        setOrganization(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationDetail()
  }, [organizationId])

  return { organization, loading, error }
}

export default useOrganizationDetail