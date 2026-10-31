import Link from "next/link"

import { ParticleSculpture } from "./particle-sculpture"

export function LandingHero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <ParticleSculpture />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_42%,rgba(0,0,0,0.55),transparent)]" />

      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-white/60 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          Stellar Soroban &middot; Testnet application
        </span>

        <h1 className="max-w-4xl text-balance text-5xl font-medium leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.8)] sm:text-6xl lg:text-7xl">
          Trust, Engineered for AI.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-white/70 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-lg">
          Autonomous agents execute the work. Independent verification validates
          the result. Smart contracts govern the payment.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/app"
            className="rounded-sm bg-white px-7 py-3 font-mono text-sm uppercase tracking-wide text-black transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#AA88FF]"
          >
            Launch VeriFlow
          </Link>
          <a
            href="#how-it-works"
            className="rounded-sm border border-white/15 px-7 py-3 font-mono text-sm uppercase tracking-wide text-white/70 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#AA88FF]"
          >
            Explore the Protocol
          </a>
        </div>
      </div>
    </section>
  )
}
