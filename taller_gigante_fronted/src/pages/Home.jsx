import { Navigation } from "../components/Navigation";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { ScrollAssembly } from "../components/ScrollAssembly";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";
import { BackgroundGears } from "../components/BackgroundGears";

export default function Home() {
    return (
        <div className="min-h-screen bg-background relative">
        <BackgroundGears />

        <div className="relative z-10">
            <Navigation />
            <HeroSection />

            <section id="features">
            <FeaturesSection />
            </section>

            <section id="system">
            <ScrollAssembly />
            </section>

            <CTASection />
            <Footer />
        </div>
        </div>
    );
}
