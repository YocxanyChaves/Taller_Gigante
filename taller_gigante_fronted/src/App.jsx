import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import Register from "./pages/Register"

import { Navigation } from "./components/Navigation"
import { HeroSection } from "./components/HeroSection"
import { FeaturesSection } from "./components/FeaturesSection"
import { ScrollAssembly } from "./components/ScrollAsembly"
import { CTASection } from "./components/CTASection"
import { Footer } from "./components/Footer"
import { BackgroundGears } from "./components/BackgroundGears"

function Landing() {
  return (
    <div className="min-h-screen bg-black relative">
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App