import HeroSection from '../components/Home/HeroSection'
import CampaignSlider from '../components/Home/CampaignSlider'
import PopularCategories from '../components/Home/PopularCategories'
import FeaturedOrganizations from '../components/Home/FeaturedOrganizations'
import FAQ from '../components/Home/FAQ'

const Home = () => {
  return (
    <>
      <HeroSection />
      <CampaignSlider />
      <PopularCategories />
      <FeaturedOrganizations />
      <FAQ />
    </>
  )
}

export default Home