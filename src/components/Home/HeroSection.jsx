import SearchForm from './SearchForm'

const HeroSection = () => {
  return (
    <section 
      className="relative bg-gradient-hero" 
      style={{
        backgroundImage: `linear-gradient(rgba(248, 187, 208, 0.8), rgba(245, 230, 204, 0.9)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCEmKqHAxmKz28oAVJvKa3aLJnPVjEVeG603OY4UEGX_CLLuwrfV-QTpTujq7GgEsV3MvZeh0LzL7HWatoahXtPMRSl250tKary6ZCkdXg7DbDvU7h0pBHjhlFlTuOKGrPcTWzhzMKhPzHnqaEve3m1-R8z-4pzom8zC6dM8sQC0-j-fhyfl4U4UJAON8I6musQMn0dPwdLEAzvUEolSBhKa2YNnlMQUqq3QBtJ8jXakm-gJNz5FFejUyJei-xrBygOQdt1yS8swa0")`
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-content-light drop-shadow-lg">
          Hayallerinizdeki Organizasyonu Gerçekleştirin
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-content-light/80 drop-shadow-md">
          MutluGünüm ile unutulmaz anlar yaratın. Profesyonel organizasyon hizmetlerimizle 
          her detayı düşünülmüş bir deneyim sunuyoruz.
        </p>
        
        <div className="mt-8 max-w-3xl mx-auto">
          <SearchForm />
        </div>
      </div>
    </section>
  )
}

export default HeroSection