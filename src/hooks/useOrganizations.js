import { useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '../utils/api'

const useOrganizations = (pageNumber = 1, pageSize = 10, filters = {}) => {
    const [organizations, setOrganizations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [totalCount, setTotalCount] = useState(0)

    const fetchOrganizations = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Filter parametrelerini hazırla
            const filterParams = new URLSearchParams()

            // Sayfalama parametreleri (yeni API format)
            filterParams.append('Page', pageNumber)
            filterParams.append('PageSize', pageSize)

            // Filter parametreleri
            if (filters.cityId) filterParams.append('CityId', filters.cityId)
            if (filters.districtId) filterParams.append('DistrictId', filters.districtId)
            if (filters.categoryId) filterParams.append('CategoryId', filters.categoryId)
            if (filters.isOutdoor !== undefined) filterParams.append('IsOutdoor', filters.isOutdoor)
            if (filters.maxPrice) filterParams.append('MaxPrice', filters.maxPrice)

            const response = await fetch(
                getApiUrl(`/Organization/Filter?${filterParams.toString()}`),
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    mode: 'cors'
                }
            )

            if (!response.ok) {
                throw new Error(`API Hatası: ${response.status} - ${response.statusText}`)
            }

            const result = await response.json()

            // Yeni response yapısına göre güncelle
            if (result.isSuccess) {
                setOrganizations(result.data?.items || [])
                setTotalCount(result.data?.totalCount || 0)
            } else {
                throw new Error(result.message || 'API\'den hata döndü')
            }
        } catch (err) {
            setError(err.message)
            setOrganizations([])
            setTotalCount(0)
        } finally {
            setLoading(false)
        }
    }, [
        pageNumber,
        pageSize,
        filters.cityId,
        filters.districtId,
        filters.categoryId,
        filters.isOutdoor,
        filters.maxPrice
    ])

    useEffect(() => {
        fetchOrganizations()
    }, [fetchOrganizations])

    return { organizations, loading, error, totalCount }
}

export default useOrganizations