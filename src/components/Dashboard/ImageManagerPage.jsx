import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiUrl } from '../../utils/api'
import ImageManager from './ImageManager'

const ImageManagerPage = () => {
  const { user, getAuthHeaders } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [selectedOrg, setSelectedOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      
      if (!user?.companyId) {
        throw new Error('Şirket ID bulunamadı')
      }

      const response = await fetch(getApiUrl(`/Organization/GetOrganizationWithICompany?Id=${user.companyId}`), {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          ...getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Organizasyonlar yüklenemedi')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setOrganizations(result.data || [])
      } else {
        throw new Error(result.message || 'Organizasyonlar yüklenemedi')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizationImages = async (orgId) => {
    try {
      const response = await fetch(getApiUrl(`/Organization/GetOrganizationWithImages?Id=${orgId}`), {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          ...getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Organizasyon detayları yüklenemedi')
      }

      const result = await response.json()
      if (result.isSuccess && result.data) {
        return {
          coverPhoto: result.data.coverPhotoPath || null,
          galleryImages: result.data.images || []
        }
      }
      return { coverPhoto: null, galleryImages: [] }
    } catch (err) {
      console.error('Resim yükleme hatası:', err)
      return { coverPhoto: null, galleryImages: [] }
    }
  }

  const handleOrganizationSelect = async (org) => {
    setSelectedOrg({ ...org, loading: true })
    const images = await fetchOrganizationImages(org.id)
    setSelectedOrg({ ...org, images, loading: false })
  }

  const handleImagesUpdated = async () => {
    if (selectedOrg) {
      const images = await fetchOrganizationImages(selectedOrg.id)
      setSelectedOrg(prev => ({ ...prev, images }))
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-subtle-light dark:text-subtle-dark">Organizasyonlar yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Hata: {error}</p>
          <button 
            onClick={fetchOrganizations}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-content-light dark:text-content-dark mb-6">
        Resim Yönetimi
      </h2>

      {organizations.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4 block">
            photo_library
          </span>
          <h3 className="text-lg font-medium text-content-light dark:text-content-dark mb-2">
            Henüz organizasyon bulunmuyor
          </h3>
          <p className="text-subtle-light dark:text-subtle-dark">
            Resim yönetimi için önce bir organizasyon oluşturun.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organizasyon Listesi */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">
              Organizasyonlarınız
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedOrg?.id === org.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark'
                  }`}
                >
                  <h4 className="font-medium truncate">{org.title}</h4>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark mt-1">
                    {org.cityName}, {org.districtName}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Resim Yönetimi */}
          <div className="lg:col-span-2">
            {!selectedOrg ? (
              <div className="text-center py-12 border-2 border-dashed border-border-light dark:border-border-dark rounded-lg">
                <span className="material-symbols-outlined text-4xl text-subtle-light dark:text-subtle-dark mb-4 block">
                  photo_library
                </span>
                <p className="text-subtle-light dark:text-subtle-dark">
                  Resimlerini yönetmek için bir organizasyon seçin
                </p>
              </div>
            ) : selectedOrg.loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-subtle-light dark:text-subtle-dark">Resimler yükleniyor...</p>
              </div>
            ) : (
              <div>
                <div className="mb-6 p-4 bg-background-light/50 dark:bg-background-dark/50 rounded-lg border border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold text-content-light dark:text-content-dark">
                    {selectedOrg.title}
                  </h3>
                  <p className="text-sm text-subtle-light dark:text-subtle-dark">
                    {selectedOrg.cityName}, {selectedOrg.districtName}
                  </p>
                </div>
                
                <ImageManager
                  organizationId={selectedOrg.id}
                  currentImages={selectedOrg.images}
                  onImagesUpdated={handleImagesUpdated}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageManagerPage