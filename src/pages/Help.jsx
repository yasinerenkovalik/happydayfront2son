const Help = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-8">
        Yardım
      </h1>
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold text-content-light dark:text-content-dark mb-6">
          Nasıl Yardımcı Olabiliriz?
        </h2>
        <div className="space-y-6">
          <div className="border border-border-light dark:border-border-dark rounded-lg p-6">
            <h3 className="text-lg font-medium text-content-light dark:text-content-dark mb-3">
              Platform Kullanımı
            </h3>
            <p className="text-subtle-light dark:text-subtle-dark">
              MutluGünüm platformunu nasıl kullanacağınız hakkında detaylı bilgi için rehberimizi inceleyebilirsiniz.
            </p>
          </div>
          
          <div className="border border-border-light dark:border-border-dark rounded-lg p-6">
            <h3 className="text-lg font-medium text-content-light dark:text-content-dark mb-3">
              Tedarikçi Olmak
            </h3>
            <p className="text-subtle-light dark:text-subtle-dark">
              Platformumuzda hizmet vermek istiyorsanız, tedarikçi başvuru formunu doldurabilirsiniz.
            </p>
          </div>
          
          <div className="border border-border-light dark:border-border-dark rounded-lg p-6">
            <h3 className="text-lg font-medium text-content-light dark:text-content-dark mb-3">
              Teknik Destek
            </h3>
            <p className="text-subtle-light dark:text-subtle-dark">
              Teknik bir sorun yaşıyorsanız, destek ekibimizle iletişime geçebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help