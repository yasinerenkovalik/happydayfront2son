import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiUrl, getImageUrl } from '../../utils/api'
import EditOrganization from './EditOrganization'

const OrganizationList = () => {
  const { user, getAuthHeaders } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingOrgId, setEditingOrgId] = useState(null)

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

  const deleteOrganization = async (id) => {
    if (!confirm('Bu organizasyonu silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      // FormData kullan (API multipart/form-data bekliyor)
      const formData = new FormData()
      formData.append('Id', id)

      const response = await fetch(getApiUrl('/Organization/DeleteOrganization'), {
        method: 'DELETE',
        headers: {
          'Accept': 'text/plain',
          ...getAuthHeaders()
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Organizasyon silinemedi')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setOrganizations(prev => prev.filter(org => org.id !== id))
        alert('Organizasyon başarıyla silindi!')
      } else {
        throw new Error(result.message || 'Organizasyon silinemedi')
      }
    } catch (err) {
      alert('Hata: ' + err.message)
    }
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₺0'
    return `₺${price.toLocaleString('tr-TR')}`
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-content-light dark:text-content-dark">
          Organizasyonlarım
        </h2>
        <button
          onClick={fetchOrganizations}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Yenile
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4 block">
            event_busy
          </span>
          <h3 className="text-lg font-medium text-content-light dark:text-content-dark mb-2">
            Henüz organizasyon eklememişsiniz
          </h3>
          <p className="text-subtle-light dark:text-subtle-dark">
            İlk organizasyonunuzu eklemek için "Organizasyon Ekle" sekmesini kullanın.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizations.map((org) => (
            <div key={org.id} className="border border-border-light dark:border-border-dark rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={getImageUrl(org.coverPhotoPath)}
                  alt={org.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
                  }}
                />
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-2">
                  {org.title || 'Başlık Yok'}
                </h3>
                
                <div className="space-y-2 text-sm text-subtle-light dark:text-subtle-dark mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{org.cityName || 'Şehir'}, {org.districtName || 'İlçe'}</span>
                  </div>
                  
                  {org.maxGuestCount && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">group</span>
                      <span>{org.maxGuestCount} kişi</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    <span className="font-semibold text-primary">{formatPrice(org.price)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingOrgId(org.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Düzenle
                  </button>
                  
                  <button
                    onClick={() => deleteOrganization(org.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingOrgId && (
        <EditOrganization
          organizationId={editingOrgId}
          onClose={() => setEditingOrgId(null)}
          onUpdate={() => {
            fetchOrganizations() // Listeyi yenile
          }}
        />
      )}
    </div>
  )
}

export default OrganizationList