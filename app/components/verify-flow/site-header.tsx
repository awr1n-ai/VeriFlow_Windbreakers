import { ShieldCheck } from "lucide-react"

import { Badge } from "@/app/components/ui/badge"
import { Separator } from "@/app/components/ui/separator"

const NAV_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#run-demo", label: "Run demo" },
  { href: "#security", label: "Security" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">VeriFlow</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-xs text-muted-foreground">by WindBreakers</span>
          </div>
        </div>

        <nav
          aria-label="Section navigation"
          className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span
            className="hidden items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground sm:flex"
            title="Simulated network status"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]"
              aria-hidden="true"
            />
            Stellar Soroban &middot; Testnet
          </span>
          <Badge
            variant="outline"
            className="border-amber-400/30 bg-amber-400/10 text-amber-300"
          >
            Demo mode
          </Badge>
        </div>
      </div>
    </header>
  )
}
