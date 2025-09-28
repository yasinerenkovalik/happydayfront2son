import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiUrl, getImageUrl } from '../../utils/api'
import EditOrganization from './EditOrganization'

const AdminOrganizationList = () => {
  const { user, getAuthHeaders } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingOrgId, setEditingOrgId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    categoryId: '',
    cityId: '',
    isOutdoor: ''
  })
  
  const pageSize = 20

  useEffect(() => {
    fetchAllOrganizations()
  }, [currentPage, searchTerm, filters])

  const fetchAllOrganizations = async () => {
    try {
      setLoading(true)
      setError('')

      // Admin için tüm organizasyonları çek
      const filterParams = new URLSearchParams()
      filterParams.append('Page', currentPage)
      filterParams.append('PageSize', pageSize)
      
      if (searchTerm) {
        filterParams.append('SearchTerm', searchTerm)
      }
      if (filters.categoryId) {
        filterParams.append('CategoryId', filters.categoryId)
      }
      if (filters.cityId) {
        filterParams.append('CityId', filters.cityId)
      }
      if (filters.isOutdoor !== '') {
        filterParams.append('IsOutdoor', filters.isOutdoor)
      }

      const response = await fetch(getApiUrl(`/Organization/Filter?${filterParams.toString()}`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Organizasyonlar yüklenemedi')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setOrganizations(result.data?.items || [])
        setTotalCount(result.data?.totalCount || 0)
      } else {
        throw new Error(result.message || 'Organizasyonlar yüklenemedi')
      }
    } catch (err) {
      setError(err.message)
      setOrganizations([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const deleteOrganization = async (id) => {
    if (!confirm('Bu organizasyonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
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
        // Listeyi yenile
        fetchAllOrganizations()
        alert('Organizasyon başarıyla silindi!')
      } else {
        throw new Error(result.message || 'Organizasyon silinemedi')
      }
    } catch (err) {
      alert('Hata: ' + err.message)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchAllOrganizations()
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1)
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '₺0'
    return `₺${price.toLocaleString('tr-TR')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih yok'
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-subtle-light dark:text-subtle-dark">Tüm organizasyonlar yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-red-600 text-2xl">admin_panel_settings</span>
          <h2 className="text-2xl font-bold text-content-light dark:text-content-dark">
            Tüm Organizasyonlar
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-subtle-light dark:text-subtle-dark">
          <span className="material-symbols-outlined text-sm">event</span>
          <span>Toplam: {totalCount} organizasyon</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Organizasyon adı, açıklama veya şirket adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.isOutdoor}
              onChange={(e) => handleFilterChange('isOutdoor', e.target.value)}
              className="px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark focus:ring-2 focus:ring-red-500"
            >
              <option value="">Tüm Mekanlar</option>
              <option value="false">Kapalı Mekan</option>
              <option value="true">Açık Mekan</option>
            </select>
            
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              Ara
            </button>
            
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setFilters({ categoryId: '', cityId: '', isOutdoor: '' })
                setCurrentPage(1)
                fetchAllOrganizations()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">clear</span>
              Temizle
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 mr-2">error</span>
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {organizations.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4 block">
            event_busy
          </span>
          <h3 className="text-lg font-medium text-content-light dark:text-content-dark mb-2">
            {searchTerm || Object.values(filters).some(f => f) ? 'Arama kriterlerine uygun organizasyon bulunamadı' : 'Henüz hiç organizasyon yok'}
          </h3>
          <p className="text-subtle-light dark:text-subtle-dark">
            {searchTerm || Object.values(filters).some(f => f) ? 'Farklı arama kriterleri deneyin.' : 'Şirketler henüz organizasyon eklememişler.'}
          </p>
        </div>
      ) : (
        <>
          {/* Organizations Table */}
          <div className="bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Organizasyon
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Şirket
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Kapasite
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mekan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={getImageUrl(org.coverPhotoPath)}
                              alt={org.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-content-light dark:text-content-dark">
                              {org.title || 'Başlık Yok'}
                            </div>
                            <div className="text-sm text-subtle-light dark:text-subtle-dark">
                              {org.cityName || 'Şehir'}, {org.districtName || 'İlçe'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-content-light dark:text-content-dark">
                          {org.companyName || 'Şirket Adı Yok'}
                        </div>
                        <div className="text-xs text-subtle-light dark:text-subtle-dark">
                          ID: {org.companyId?.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-red-600">
                          {formatPrice(org.price)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-content-light dark:text-content-dark">
                          <span className="material-symbols-outlined text-sm">group</span>
                          {org.maxGuestCount || 0} kişi
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          org.isOutdoor 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          <span className="material-symbols-outlined text-xs mr-1">
                            {org.isOutdoor ? 'park' : 'home'}
                          </span>
                          {org.isOutdoor ? 'Açık' : 'Kapalı'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingOrgId(org.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="Düzenle"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Düzenle
                          </button>
                          
                          <button
                            onClick={() => deleteOrganization(org.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Sil"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {Math.ceil(totalCount / pageSize) > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-subtle-light dark:text-subtle-dark">
                Toplam {totalCount} organizasyondan {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} arası gösteriliyor
              </div>
              
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                  Önceki
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                    .slice(Math.max(0, currentPage - 3), currentPage + 2)
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-red-600 text-white'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-content-light dark:text-content-dark'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / pageSize)))}
                  disabled={currentPage === Math.ceil(totalCount / pageSize)}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-border-light dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sonraki
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingOrgId && (
        <EditOrganization
          organizationId={editingOrgId}
          onClose={() => setEditingOrgId(null)}
          onUpdate={() => {
            fetchAllOrganizations() // Listeyi yenile
          }}
        />
      )}
    </div>
  )
}

export default AdminOrganizationList