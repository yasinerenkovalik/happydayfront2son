import { useState, useEffect } from 'react'

const CampaignSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9S45T6pD2p-FpUQuDPUuuvq1mEdTrAi8ropQCGtks0Y1wuB6iMrGLXSq_LhQjqwR7x_4C2Bowu2QOTqk8WDdc_a6bIn1WR20QDanzzJIrClg9HIVXap_X180H9Nf3tnk2iub5pLjHLhYj-IacMtZBME8IHAls6aQjGeVbkGG0axO1N2VWa4-_WqsPz0WOhZUgf-crPEdTLxAiNmtMJaHgZ3r1u0wNtGpXRZkMSYwtT2hp2Ny9I_XR7vkXS-xUNH4fqJmdJjp02lA',
      title: 'Yaz Düğünlerinde %20 İndirim!',
      description: 'Hayalinizdeki yaz düğününü planlamak için harika bir fırsat. Anlaşmalı mekanlarımızda %20\'ye varan indirimleri kaçırmayın.'
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMkM0Ih6Sr6MnazHCfyyJ9DcvCsZvRe2wHrZBofskRwxQz76eNKoXaNu2GUIuts0KRBNfC7xen19WRhY7gNXk2nICWJ3QoI_gASMc_TcHb7lG2CGw9kcVclnxnhUyfxUS0jv_Gh8HtSiQd9lQ5nS3n3NXneT4LANq_ote5o-MWsvRmaQXvZbzhkygz4WfT1JrUSBaKiDi19WJ5TSka0FCt1yI84aquC9xKZ4Ql4C-mBX0Br0sfsMboDZQO3obNkOYSEfQiHUWk2bo',
      title: 'Kına Gecesi Paketleri',
      description: 'Geleneksel ve modern konseptlerde, her bütçeye uygun kına gecesi paketlerimizle unutulmaz bir gece yaşayın.'
    },
    {
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtUwAy4nVxae2p6GDa37pqGFqOHWPzVFyQHPRdN6Km8Fr3sFkDfZ4hjlrjvNRRdH-kebPEgmqlspRjm7AmTzW92AJREQdIqVdJsLxAM6Xmpe2kSoBi9NhiGoX94H7sH7syGBME_jp-xDyA9wsHUciSDXkbgS8ZMNejpZAHp72HLud_6stPAxl1lllTzzx8XShMfjwyUIwdWdRYR137ZDIDcHG_9yn2y_H0vz6iwFxMF6IctsZP5d6v6EtXfABWF1KzUsApj6cT_e8',
      title: 'Kurumsal Etkinliklerde Erken Rezervasyon Avantajı',
      description: 'Yıl sonu partileri ve şirket etkinlikleriniz için erken rezervasyon yapın, özel indirimlerden ve avantajlardan yararlanın.'
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 sm:py-24 bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-content-light dark:text-content-dark text-center">
          Öne Çıkan Kampanyalar
        </h2>
        
        <div className="mt-12 relative slider-container">
          <div 
            className="slider"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="slide px-2">
                <div className="relative rounded-xl overflow-hidden aspect-video md:aspect-[2.4/1]">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white p-8 max-w-2xl">
                      <h3 className="text-2xl md:text-4xl font-bold">
                        {slide.title}
                      </h3>
                      <p className="mt-4 text-sm md:text-lg">
                        {slide.description}
                      </p>
                      <button className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors">
                        Detayları Gör
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors ml-4 md:ml-8"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors mr-4 md:mr-8"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CampaignSlider