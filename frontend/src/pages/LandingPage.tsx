import { CtaBand } from "@/components/landing/CtaBand";
import { Faq } from "@/components/landing/Faq";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Pricing } from "@/components/landing/Pricing";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { Testimonials } from "@/components/landing/Testimonials";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingNavbar } from "@/components/layout/MarketingNavbar";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <MarketingNavbar />
      <main>
        <Hero />
        <Features />
        <ProductPreview />
        <Testimonials />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
