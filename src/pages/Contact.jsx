import { useState } from 'react'
import { CONTACT_INFO, getWhatsAppUrl, WHATSAPP_MESSAGES } from '../constants/contact'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // FormData oluştur (yeni API endpoint'i için)
      const formDataToSend = new FormData()
      formDataToSend.append('Name', formData.name)
      formDataToSend.append('SurName', formData.surname)
      formDataToSend.append('Email', formData.email)
      formDataToSend.append('Phone', formData.phone || 'Belirtilmedi')
      formDataToSend.append('Mesaage', `Konu: ${formData.subject}\n\n${formData.message}`) // API'deki yazım hatası korundu

      // API'ye gönder
      const response = await fetch('http://193.111.77.142/api/Concat/add', {
        method: 'POST',
        headers: {
          'accept': 'text/plain'
        },
        body: formDataToSend
      })

      if (response.ok) {
        setSubmitMessage('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
        setFormData({
          name: '',
          surname: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        throw new Error('Mesaj gönderilemedi')
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error)
      setSubmitMessage('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2">
        
        {/* Sol Taraf - Form */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tighter text-content-light dark:text-content-dark">
              Bizimle İletişime Geçin
            </h1>
            <p className="text-base text-subtle-light dark:text-subtle-dark">
              Herhangi bir sorunuz veya geri bildiriminiz varsa, lütfen aşağıdaki formu 
              kullanarak bizimle iletişime geçin.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Adınız *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Adınızı girin"
                  className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="surname" className="mb-2 block text-sm font-medium">
                  Soyadınız *
                </label>
                <input
                  id="surname"
                  name="surname"
                  type="text"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder="Soyadınızı girin"
                  className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  E-posta *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="E-posta adresinizi girin"
                  className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                  Telefon Numarası
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Telefon numaranızı girin"
                  className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                Konu
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Mesajınızın konusunu girin"
                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium">
                Mesaj
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Mesajınızı buraya yazın"
                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            {submitMessage && (
              <div className={`p-3 rounded-md text-sm ${
                submitMessage.includes('başarıyla') 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {submitMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  'Gönder'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sağ Taraf - Bilgiler */}
        <div className="space-y-12">
          
          {/* SSS Kartı */}
          <div className="rounded-xl bg-primary/5 dark:bg-primary/10 p-8">
            <h3 className="text-xl font-bold text-content-light dark:text-content-dark">
              Sıkça Sorulan Sorular
            </h3>
            <p className="mt-2 text-sm text-subtle-light dark:text-subtle-dark">
              Sıkça sorulan soruların cevaplarını bulmak için SSS sayfamızı ziyaret edin.
            </p>
            <button className="mt-6 flex h-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/20 dark:hover:bg-primary/30">
              SSS Sayfasına Git
            </button>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-xl font-bold text-content-light dark:text-content-dark">
              İletişim Bilgileri
            </h3>
            <div className="mt-6 space-y-4 border-t border-border-light dark:border-border-dark pt-6">
              <p className="flex items-center gap-3 text-sm">
                <span className="font-medium text-subtle-light dark:text-subtle-dark w-16">
                  Telefon:
                </span>
                <a href={`tel:${CONTACT_INFO.phone}`} className="hover:text-primary transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </p>
              <p className="flex items-center gap-3 text-sm">
                <span className="font-medium text-subtle-light dark:text-subtle-dark w-16">
                  E-posta:
                </span>
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-primary transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </p>
              <p className="flex items-center gap-3 text-sm">
                <span className="font-medium text-subtle-light dark:text-subtle-dark w-16">
                  Adres:
                </span>
                <span>{CONTACT_INFO.address}</span>
              </p>
              <p className="flex items-center gap-3 text-sm">
                <span className="font-medium text-subtle-light dark:text-subtle-dark w-16">
                  Çalışma:
                </span>
                <span>{CONTACT_INFO.workingHours}</span>
              </p>
            </div>
          </div>

          {/* WhatsApp Hızlı İletişim */}
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                  WhatsApp ile Hızlı İletişim
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Anında yanıt için WhatsApp'tan yazın
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <a
                href={getWhatsAppUrl(WHATSAPP_MESSAGES.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                </svg>
                WhatsApp'ta Mesaj Gönder
              </a>
              
              <div className="text-center">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Telefon: {CONTACT_INFO.whatsapp}
                </p>
              </div>
            </div>
          </div>

          {/* Sosyal Medya */}
          <div>
            <h3 className="text-xl font-bold text-content-light dark:text-content-dark">
              Bizi Takip Edin
            </h3>
            <div className="mt-6 flex flex-wrap gap-4">
              {/* Twitter */}
              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-border-light/50 dark:bg-border-dark/50 text-subtle-light dark:text-subtle-dark transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z" />
                </svg>
              </a>
              
              {/* Instagram */}
              <a
                href={CONTACT_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-border-light/50 dark:bg-border-dark/50 text-subtle-light dark:text-subtle-dark transition-colors hover:bg-primary/10 hover:text-primary"
                title={`Instagram: ${CONTACT_INFO.instagram}`}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
                </svg>
              </a>
              
              {/* Facebook */}
              <a
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-border-light/50 dark:bg-border-dark/50 text-subtle-light dark:text-subtle-dark transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact