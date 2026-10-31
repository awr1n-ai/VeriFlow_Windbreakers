"use client"

import {
  Copy as CopyIcon,
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  Siren,
  UserCheck,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/app/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { cn } from "@/app/lib/utils"
import { simulateAttack } from "./mock-engine"
import type { AttackId, AttackResult } from "./types"

const ATTACKS: {
  id: AttackId
  label: string
  description: string
  icon: typeof ShieldAlert
}[] = [
  {
    id: "self-grading",
    label: "Agent grades itself",
    description: "Agent submits its own passing grade.",
    icon: UserCheck,
  },
  {
    id: "fake-verdict",
    label: "Fake verifier verdict",
    description: "Forged 'verified' signature, no receipt.",
    icon: Siren,
  },
  {
    id: "double-payout",
    label: "Double payout",
    description: "Settles an already-paid task again.",
    icon: CopyIcon,
  },
  {
    id: "tampered-receipt",
    label: "Tamper with receipt",
    description: "Receipt edited after it was signed.",
    icon: FileWarning,
  },
]

export function CheatPanel() {
  const [lastResult, setLastResult] = useState<AttackResult | null>(null)
  const [pendingId, setPendingId] = useState<AttackId | null>(null)

  return (
    <section id="security" className="pb-20">
      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
            <CardTitle className="text-destructive">Try to cheat</CardTitle>
            <Badge variant="outline" className="border-destructive/30 text-destructive">
              Simulation only
            </Badge>
          </div>
          <CardDescription>
            These buttons simulate common attacks against the verification flow,
            entirely in the browser. They do not touch a smart contract or
            backend yet — this only shows how the design is meant to resist them.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ATTACKS.map((attack) => {
              const Icon = attack.icon
              const isLastClicked = lastResult?.id === attack.id
              return (
                <button
                  key={attack.id}
                  type="button"
                  onClick={() => {
                    setPendingId(attack.id)
                    setLastResult(simulateAttack(attack.id))
                    setTimeout(() => setPendingId(null), 200)
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3 text-left transition-all duration-150 motion-reduce:transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive disabled:cursor-not-allowed disabled:opacity-50",
                    isLastClicked
                      ? "border-destructive/60 bg-destructive/10"
                      : "border-destructive/25 hover:bg-destructive/10",
                    pendingId === attack.id && "scale-[0.98] motion-reduce:scale-100"
                  )}
                >
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-medium text-destructive">
                      {attack.label}
                    </span>
                    <span className="block text-xs text-destructive/70">
                      {attack.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {lastResult && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm"
            >
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                aria-hidden="true"
              />
              <p className="text-emerald-300">
                <span className="font-medium">
                  Blocked (simulated) — {lastResult.title}:
                </span>{" "}
                {lastResult.blockedMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
