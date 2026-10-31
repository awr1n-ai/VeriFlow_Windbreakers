import { Lock, ShieldCheck, Zap } from "lucide-react"

const STEPS = [
  {
    index: "01",
    title: "Execute",
    icon: Zap,
    description: "An AI agent attempts the task.",
  },
  {
    index: "02",
    title: "Verify",
    icon: ShieldCheck,
    description: "The result is evaluated against applicable requirements.",
  },
  {
    index: "03",
    title: "Settle",
    icon: Lock,
    description:
      "The intended escrow outcome depends on the verification result.",
  },
]

export function ProtocolSteps() {
  return (
    <section id="how-it-works" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#AA88FF]">
            The protocol
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">
            A payment released only when work is proven.
          </h2>
        </div>

        <ol className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent sm:block"
          />
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <li key={step.index} className="relative flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black">
                    <Icon className="h-4 w-4 text-[#AA88FF]" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-white/30">
                    {step.index}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        <p className="mt-16 max-w-2xl border-l border-white/15 pl-4 font-mono text-xs leading-relaxed text-white/40">
          This describes VeriFlow&apos;s intended trust model. It is not a claim
          that every step has been confirmed on-chain for your session — run a
          live verification in the app to see actual Soroban testnet results.
        </p>
      </div>
    </section>
  )
}
