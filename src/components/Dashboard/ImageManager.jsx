import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApiUrl, getImageUrl } from '../../utils/api'

const ImageManager = ({ organizationId, currentImages, onImagesUpdated }) => {
  const { getAuthHeaders } = useAuth()
  const [newImages, setNewImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null) // Silinmekte olan resmin ID'si
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(files)
    setError('')
    setSuccess('')
  }

  const uploadImages = async () => {
    if (newImages.length === 0) {
      setError('Lütfen en az bir resim seçin')
      return
    }

    try {
      setUploading(true)
      setError('')
      
      const uploadPromises = newImages.map(async (image) => {
        const formData = new FormData()
        formData.append('OrganizationId', organizationId)
        formData.append('OrganizationImage', image)

        const response = await fetch(getApiUrl('/OrganizationImages/AddOrganizationImages'), {
          method: 'POST',
          headers: {
            'Accept': 'text/plain',
            ...getAuthHeaders()
          },
          body: formData
        })

        if (!response.ok) {
          throw new Error(`${image.name} yüklenemedi`)
        }

        const result = await response.json()
        if (!result.isSuccess) {
          throw new Error(result.message || `${image.name} yüklenemedi`)
        }

        return result
      })

      await Promise.all(uploadPromises)
      
      setSuccess(`${newImages.length} resim başarıyla yüklendi!`)
      setNewImages([])
      
      // File input'u temizle
      const fileInput = document.getElementById('imageUpload')
      if (fileInput) fileInput.value = ''
      
      // Parent component'i bilgilendir
      if (onImagesUpdated) {
        onImagesUpdated()
      }
      
      // 3 saniye sonra success mesajını temizle
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const removeSelectedImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const deleteImage = async (imageId) => {
    if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      setDeleting(imageId)
      setError('')
      
      const response = await fetch(getApiUrl(`/OrganizationImages/DeleteOrganizationImages/${imageId}`), {
        method: 'DELETE',
        headers: {
          'Accept': 'text/plain',
          ...getAuthHeaders()
        }
      })

      if (!response.ok) {
        throw new Error('Resim silinemedi')
      }

      const result = await response.json()
      if (result.isSuccess) {
        setSuccess('Resim başarıyla silindi!')
        
        // Parent component'i bilgilendir
        if (onImagesUpdated) {
          onImagesUpdated()
        }
        
        // 3 saniye sonra success mesajını temizle
        setTimeout(() => setSuccess(''), 3000)
      } else {
        throw new Error(result.message || 'Resim silinemedi')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Mevcut Kapak Fotoğrafı */}
      {currentImages?.coverPhoto && (
        <div>
          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-3">
            Mevcut Kapak Fotoğrafı
          </h3>
          <div className="relative group w-full max-w-md h-48 rounded-lg overflow-hidden border border-border-light dark:border-border-dark">
            <img
              src={getImageUrl(currentImages.coverPhoto)}
              alt="Kapak fotoğrafı"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
              }}
            />
            
            {/* Kapak Fotoğrafı Bilgisi */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm font-medium">Kapak Fotoğrafı</p>
              <p className="text-white/80 text-xs">Organizasyon düzenle sekmesinden değiştirebilirsiniz</p>
            </div>
          </div>
        </div>
      )}

      {/* Mevcut Galeri Resimleri */}
      {currentImages?.galleryImages && currentImages.galleryImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-3">
            Mevcut Galeri Resimleri ({currentImages.galleryImages.length} adet)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentImages.galleryImages.map((image, index) => (
              <div key={image.id || index} className="relative group aspect-square rounded-lg overflow-hidden border border-border-light dark:border-border-dark hover:shadow-lg transition-shadow">
                <img
                  src={getImageUrl(image.imageUrl || image.imagePath || image.path || image)}
                  alt={`Galeri resmi ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
                  }}
                />
                
                {/* Silme Butonu */}
                {image.id && (
                  <button
                    onClick={() => deleteImage(image.id)}
                    disabled={deleting === image.id || uploading}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Resmi sil"
                  >
                    {deleting === image.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <span className="material-symbols-outlined text-sm">delete</span>
                    )}
                  </button>
                )}
                
                {/* Yükleme Overlay */}
                {deleting === image.id && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-xs font-medium">Siliniyor...</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yeni Resim Ekleme */}
      <div className="border-t border-border-light dark:border-border-dark pt-6">
        <h3 className="text-lg font-semibold text-content-light dark:text-content-dark mb-4">
          Yeni Resimler Ekle
        </h3>
        
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* File Input */}
        <div className="space-y-4">
          <div>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              disabled={uploading}
              className="w-full px-4 py-3 border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background-light dark:bg-background-dark text-content-light dark:text-content-dark disabled:opacity-50"
            />
            <p className="text-sm text-subtle-light dark:text-subtle-dark mt-2">
              Birden fazla resim seçebilirsiniz. Desteklenen formatlar: JPG, PNG, GIF
            </p>
          </div>

          {/* Seçilen Resimlerin Önizlemesi */}
          {newImages.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-content-light dark:text-content-dark mb-3">
                Yüklenecek Resimler ({newImages.length} adet)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                {newImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/50 bg-primary/10">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Yeni resim ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeSelectedImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                      disabled={uploading}
                      title="Seçimden kaldır"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              <div className="flex gap-3">
                <button
                  onClick={uploadImages}
                  disabled={uploading || newImages.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      {newImages.length} Resmi Yükle
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setNewImages([])
                    const fileInput = document.getElementById('imageUpload')
                    if (fileInput) fileInput.value = ''
                    setError('')
                    setSuccess('')
                  }}
                  disabled={uploading}
                  className="px-4 py-3 border border-border-light dark:border-border-dark text-content-light dark:text-content-dark font-medium rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors disabled:opacity-50"
                >
                  Temizle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageManager