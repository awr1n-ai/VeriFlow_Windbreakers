import { AppPreviewSection } from "@/app/components/landing/app-preview-section"
import { LandingFooter } from "@/app/components/landing/landing-footer"
import { LandingHero } from "@/app/components/landing/landing-hero"
import { LandingNav } from "@/app/components/landing/landing-nav"
import { ProtocolSteps } from "@/app/components/landing/protocol-steps"

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <LandingNav />
      <main>
        <LandingHero />
        <ProtocolSteps />
        <AppPreviewSection />
      </main>
      <LandingFooter />
    </div>
  )
}
