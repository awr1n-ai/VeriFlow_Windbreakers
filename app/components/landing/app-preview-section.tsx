import { ArrowUpRight, ShieldAlert } from "lucide-react"
import Link from "next/link"

const FEATURES = [
  "Good / Lazy agent selection",
  "Demo · Live mode toggle",
  "Five-stage verification timeline",
  "Receipt & transaction hashes",
  "Attack simulator against the live contract",
]

export function AppPreviewSection() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#AA88FF]">
              The application
            </p>
            <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
              Run a task against the real verification flow.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
              Post a task, pick an agent, and watch escrow, verification, and
              settlement happen stage by stage — in a local simulation, or
              against the real Soroban testnet contract.
            </p>
            <Link
              href="/app"
              className="mt-8 inline-flex items-center gap-1.5 rounded-sm bg-white px-6 py-3 font-mono text-sm uppercase tracking-wide text-black transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#AA88FF]"
            >
              Open the app
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.02] p-6">
            <div className="mb-5 flex items-center gap-2 border-b border-white/10 pb-4">
              <ShieldAlert className="h-4 w-4 text-[#AA88FF]" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                /app &middot; live verification dashboard
              </span>
            </div>
            <ul className="space-y-3">
              {FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 font-mono text-[13px] text-white/60"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[#AA88FF]" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
