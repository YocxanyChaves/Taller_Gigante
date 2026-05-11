import { Navigation } from "./components/Navigation"
import { HeroSection } from "./components/HeroSection"
import { FeaturesSection } from "./components/FeaturesSection"
import { ScrollAssembly } from "./components/ScrollAsembly"
import { CTASection } from "./components/CTASection"
import { Footer } from "./components/Footer"
import { BackgroundGears } from "./components/BackgroundGears"

function App() {
  return (
    <div className="min-h-screen bg-black">
      <BackgroundGears />


      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <ScrollAssembly />
      <CTASection />
      <Footer />
    </div>
  )
}

export default App