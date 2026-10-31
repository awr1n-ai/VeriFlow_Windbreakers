import { HeroSection } from "@/app/components/verify-flow/hero-section"
import { SiteHeader } from "@/app/components/verify-flow/site-header"
import { VerifyFlowDemo } from "@/app/components/verify-flow/verify-flow-demo"

export default function AppPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <VerifyFlowDemo />
      </main>
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        VeriFlow &middot; Built by Team WindBreakers for AKI HACKS &middot; Demo
        mode uses mock data; Live mode runs real transactions on Stellar testnet
        (never mainnet).
      </footer>
    </div>
  )
}
