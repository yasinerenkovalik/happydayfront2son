import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCategories } from '../../hooks/useFilterData'

const PopularCategories = () => {
  const { categories, loading, error } = useCategories()
  const [popularCategories, setPopularCategories] = useState([])

  // Sadece belirli kategorileri göstermek için anahtar kelimeler
  const targetCategories = ['nişan', 'düğün', 'kına', 'balo', 'davet']

  // Kategori resimlerini eşleştirmek için mapping
  const categoryImages = {
    'Düğün': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Nişan': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Kına': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Balo': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'Davet': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }

  // Kategori adına göre resim bulma fonksiyonu
  const getCategoryImage = (categoryName) => {
    const name = categoryName.toLowerCase()

    if (name.includes('düğün')) return categoryImages['Düğün']
    if (name.includes('nişan')) return categoryImages['Nişan']
    if (name.includes('kına')) return categoryImages['Kına']
    if (name.includes('balo')) return categoryImages['Balo']
    if (name.includes('davet') || name.includes('salon')) return categoryImages['Davet']

    // Varsayılan resim
    return categoryImages['Davet']
  }

  // Kategorileri filtrele - sadece istenen kategorileri göster
  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories.filter(category => {
        const name = (category.categoryName || category.name).toLowerCase()
        return targetCategories.some(target => name.includes(target))
      })
      setPopularCategories(filtered)
    }
  }, [categories])

  return (
    <section className="py-16 sm:py-24 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-content-light dark:text-content-dark mb-4">
            Popüler Kategoriler
          </h2>
          <p className="text-lg text-subtle-light dark:text-subtle-dark max-w-2xl mx-auto">
            En çok tercih edilen organizasyon türlerini keşfedin
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-subtle-light dark:text-subtle-dark">Kategoriler yükleniyor...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Hata: {error}</p>
            <p className="text-subtle-light dark:text-subtle-dark">Kategoriler yüklenirken bir hata oluştu.</p>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && (
          <>
            {popularCategories.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-subtle-light dark:text-subtle-dark mb-4 block">
                  category
                </span>
                <h3 className="text-xl font-medium text-content-light dark:text-content-dark mb-2">
                  Popüler kategoriler yükleniyor
                </h3>
                <p className="text-subtle-light dark:text-subtle-dark">
                  Nişan, Düğün, Kına, Balo ve Davet kategorileri gösterilecek.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 lg:gap-8">
                {popularCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/services?categoryId=${category.id}`}
                    className="group text-center"
                  >
                    {/* Category Image */}
                    <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                      <img
                        src={getCategoryImage(category.categoryName || category.name)}
                        alt={category.categoryName || category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                        }}
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Category Name Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm font-semibold text-center">
                          Keşfet
                        </p>
                      </div>
                    </div>

                    {/* Category Name */}
                    <h3 className="mt-4 text-base font-semibold text-content-light dark:text-content-dark group-hover:text-primary transition-colors duration-200">
                      {category.categoryName || category.name}
                    </h3>

                    {/* Hover Effect Arrow */}
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="material-symbols-outlined text-primary text-sm">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* View All Categories Button */}
            {popularCategories.length > 0 && (
              <div className="text-center mt-12">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Tüm Organizasyonları Gör
                  <span className="material-symbols-outlined">explore</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default PopularCategories