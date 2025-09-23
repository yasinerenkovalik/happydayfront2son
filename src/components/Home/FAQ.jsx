import { useState } from 'react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'MutluGünüm platformu nasıl çalışır?',
      answer: 'MutluGünüm, organizasyon planlamanızı kolaylaştıran bir platformdur. İstediğiniz hizmeti, şehri ve tarihi seçerek arama yapabilir, size en uygun tedarikçileri ve mekanları listeleyebilirsiniz. Profilleri inceleyip, fiyat teklifi alabilir ve doğrudan iletişime geçebilirsiniz.'
    },
    {
      question: 'Platformu kullanmak ücretli mi?',
      answer: 'Hayır, MutluGünüm\'ü kullanmak ve tedarikçilerden teklif almak tamamen ücretsizdir. Sadece anlaştığınız hizmetler için ilgili tedarikçiye ödeme yaparsınız.'
    },
    {
      question: 'Tedarikçilerle nasıl iletişime geçebilirim?',
      answer: 'Beğendiğiniz tedarikçinin profil sayfasında bulunan "Teklif Al" veya "Mesaj Gönder" butonlarını kullanarak kolayca iletişime geçebilirsiniz.'
    },
    {
      question: 'Ödemeyi nasıl yapıyorum?',
      answer: 'Ödemeler doğrudan siz ve anlaştığınız tedarikçi arasında gerçekleşir. MutluGünüm ödeme işlemlerine aracılık etmemektedir. Ödeme koşullarını tedarikçi ile görüşmeniz gerekmektedir.'
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-content-light dark:text-content-dark text-center">
          Sıkça Sorulan Sorular
        </h2>
        
        <div className="mt-12 max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-border-light dark:border-border-dark rounded-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between cursor-pointer"
              >
                <h3 className="text-lg font-medium text-content-light dark:text-content-dark">
                  {faq.question}
                </h3>
                <span className="relative h-5 w-5 shrink-0">
                  <span 
                    className={`material-symbols-outlined absolute inset-0 transition-opacity ${
                      openIndex === index ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    add
                  </span>
                  <span 
                    className={`material-symbols-outlined absolute inset-0 transition-opacity ${
                      openIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    remove
                  </span>
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="leading-relaxed text-subtle-light dark:text-subtle-dark">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ