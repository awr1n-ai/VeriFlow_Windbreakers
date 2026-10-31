import Link from "next/link"

const LINKS = [
  { href: "/app", label: "Launch App" },
  { href: "#how-it-works", label: "How It Works" },
  {
    href: "https://github.com/awr1n-ai/VeriFlow_Windbreakers",
    label: "GitHub",
    external: true,
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <span className="text-sm font-medium tracking-[0.08em] text-white">
              VERIFLOW
            </span>
            <p className="mt-3 text-sm leading-relaxed text-white/40">
              Trustless payments for AI agents — escrowed on Stellar Soroban,
              released only after independent verification.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex gap-6 font-mono text-xs uppercase tracking-wide text-white/40"
          >
            {LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
        <p className="font-mono text-[11px] text-white/30">
          Built by Team WindBreakers for AKI HACKS &middot; Stellar Soroban
          testnet &middot; Demo mode uses mock data
        </p>
      </div>
    </footer>
  )
}
