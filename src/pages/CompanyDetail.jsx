import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getApiUrl, getImageUrl } from '../utils/api'
import SimpleLocationPicker from '../components/Map/SimpleLocationPicker'

const CompanyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [organizationsLoading, setOrganizationsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(getApiUrl(`/Company/getbyid?Id=${id}`), {
          method: 'GET',
          headers: {
            'Accept': 'text/plain',
          },
          mode: 'cors'
        })

        if (!response.ok) {
          throw new Error(`API Hatası: ${response.status} - ${response.statusText}`)
        }

        const result = await response.json()

        if (result.isSuccess) {
          setCompany(result.data)
        } else {
          throw new Error(result.message || 'Şirket detayları yüklenirken hata oluştu')
        }
      } catch (err) {
        setError(err.message)
        setCompany(null)
      } finally {
        setLoading(false)
      }
    }

    const fetchOrganizations = async () => {
      try {
        setOrganizationsLoading(true)

        const response = await fetch(getApiUrl(`/Organization/GetOrganizationWithICompany?Id=${id}`), {
          method: 'GET',
          headers: {
            'Accept': 'text/plain',
          },
          mode: 'cors'
        })

        if (!response.ok) {
          throw new Error(`API Hatası: ${response.status} - ${response.statusText}`)
        }

        const result = await response.json()

        if (result.isSuccess) {
          setOrganizations(result.data || [])
        } else {
          throw new Error(result.message || 'Organizasyonlar yüklenirken hata oluştu')
        }
      } catch (err) {
        console.error('Organizasyonlar yüklenirken hata:', err)
        setOrganizations([])
      } finally {
        setOrganizationsLoading(false)
      }
    }

    if (id) {
      fetchCompanyDetail()
      fetchOrganizations()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-subtle-light dark:text-subtle-dark">Şirket detayları yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Hata: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-subtle-light dark:text-subtle-dark">Şirket bulunamadı.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-content-light dark:text-content-dark mb-4">
            {company.name}
          </h1>
          <p className="text-lg text-subtle-light dark:text-subtle-dark max-w-2xl mx-auto">
            {company.description || 'Bu şirket henüz açıklama eklememiştir.'}
          </p>
        </div>

        {/* Contact Information Card */}
        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6 mb-8">
          <h2 className="text-2xl font-bold text-content-light dark:text-content-dark mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">business</span>
            İletişim Bilgileri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">email</span>
              </div>
              <div>
                <h3 className="font-semibold text-content-light dark:text-content-dark">E-posta</h3>
                <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                  {company.email}
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">phone</span>
              </div>
              <div>
                <h3 className="font-semibold text-content-light dark:text-content-dark">Telefon</h3>
                <a href={`tel:${company.phoneNumber}`} className="text-primary hover:underline">
                  {company.phoneNumber}
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <h3 className="font-semibold text-content-light dark:text-content-dark">Adres</h3>
                <p className="text-subtle-light dark:text-subtle-dark">
                  {company.adress || 'Adres bilgisi bulunmuyor'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        {company.latitude && company.longitude && (
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6 mb-8">
            <h2 className="text-2xl font-bold text-content-light dark:text-content-dark mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">map</span>
              Konum
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border-light dark:border-border-dark">
              <SimpleLocationPicker
                latitude={company.latitude}
                longitude={company.longitude}
                onLocationChange={() => {}} // Read-only
                disabled={true}
              />
            </div>
          </div>
        )}

        {/* Organizations */}
        <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6 mb-8">
          <h2 className="text-2xl font-bold text-content-light dark:text-content-dark mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">event</span>
            Organizasyonlar
          </h2>
          
          {organizationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-subtle-light dark:text-subtle-dark">Organizasyonlar yükleniyor...</p>
              </div>
            </div>
          ) : organizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((organization) => (
                <div
                  key={organization.id}
                  onClick={() => navigate(`/organization/${organization.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-border-light dark:border-border-dark overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  {/* Organization Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={organization.coverPhotoPath ? getImageUrl(organization.coverPhotoPath) : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                      alt={organization.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-primary text-white px-2 py-1 rounded-full text-sm font-medium">
                        {organization.price.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    {organization.isOutdoor && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">park</span>
                          Açık Alan
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Organization Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-2 line-clamp-2">
                      {organization.title}
                    </h3>
                    
                    <p className="text-subtle-light dark:text-subtle-dark text-sm mb-3 line-clamp-3">
                      {organization.description}
                    </p>

                    {/* Services */}
                    {organization.services && organization.services.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {organization.services.slice(0, 3).map((service, index) => (
                            <span
                              key={index}
                              className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {service}
                            </span>
                          ))}
                          {organization.services.length > 3 && (
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                              +{organization.services.length - 3} daha
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Organization Info */}
                    <div className="flex items-center justify-between text-sm text-subtle-light dark:text-subtle-dark">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">group</span>
                        <span>Max {organization.maxGuestCount} kişi</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <span>Detayları Gör</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl text-gray-400">event_busy</span>
              </div>
              <p className="text-subtle-light dark:text-subtle-dark">
                Bu şirketin henüz organizasyonu bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Cover Photo */}
        {company.coverPhotoPath && (
          <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6">
            <h2 className="text-2xl font-bold text-content-light dark:text-content-dark mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">photo</span>
              Şirket Görseli
            </h2>
            
            <div className="rounded-lg overflow-hidden">
              <img
                src={getImageUrl(company.coverPhotoPath)}
                alt={`${company.name} kapak fotoğrafı`}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyDetail