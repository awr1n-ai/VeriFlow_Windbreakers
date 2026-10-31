import Link from "next/link"

import { cn } from "@/app/lib/utils"

const LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "/app#security", label: "Security" },
  {
    href: "https://github.com/awr1n-ai/VeriFlow_Windbreakers",
    label: "Documentation",
    external: true,
  },
]

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#AA88FF]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z"
              stroke="#AA88FF"
              strokeWidth="1.2"
            />
            <path d="M12 2 V22 M3 7 L21 17 M21 7 L3 17" stroke="#AA88FF" strokeWidth="0.6" opacity="0.5" />
          </svg>
          <span className="text-sm font-medium tracking-[0.08em] text-white">
            VERIFLOW
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 font-mono text-[13px] uppercase tracking-wide text-white/50 md:flex"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="rounded-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#AA88FF]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/app"
          className={cn(
            "rounded-sm border border-[#AA88FF]/40 bg-[#AA88FF]/10 px-4 py-2 font-mono text-[13px] uppercase tracking-wide text-[#AA88FF] transition-colors",
            "hover:border-[#AA88FF]/70 hover:bg-[#AA88FF]/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#AA88FF]"
          )}
        >
          Launch App
        </Link>
      </div>
    </header>
  )
}
