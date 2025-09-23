const About = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-content-light dark:text-content-dark mb-8">
        Hakkımızda
      </h1>
      <div className="prose prose-lg max-w-none text-subtle-light dark:text-subtle-dark">
        <p className="mb-6">
          MutluGünüm, hayalinizdeki organizasyonu gerçekleştirmeniz için kurulmuş bir platformdur. 
          Amacımız, özel günlerinizi unutulmaz kılmak için en iyi hizmet sağlayıcıları ile sizi buluşturmaktır.
        </p>
        <p className="mb-6">
          Platformumuzda düğün, kına gecesi, doğum günü partileri, kurumsal etkinlikler ve daha birçok 
          organizasyon türü için profesyonel hizmet sağlayıcıları bulabilirsiniz.
        </p>
        <p>
          Kaliteli hizmet, güvenilir tedarikçiler ve müşteri memnuniyeti önceliklerimizdir.
        </p>
      </div>
    </div>
  )
}

export default About