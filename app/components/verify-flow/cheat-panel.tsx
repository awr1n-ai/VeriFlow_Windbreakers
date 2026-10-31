"use client"

import {
  Copy as CopyIcon,
  FileWarning,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
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
import { runCheatLive } from "./api-client"
import { simulateAttack } from "./mock-engine"
import type { AttackId, RunMode } from "./types"

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

type DisplayKind = "demo-blocked" | "blocked" | "not-blocked" | "missing-task" | "request-error"

interface DisplayResult {
  id: AttackId
  title: string
  kind: DisplayKind
  message: string
}

interface CheatPanelProps {
  mode: RunMode
  /** Real backend task id from a prior live run. Null until one exists. */
  liveTaskId: number | null
  /** The spec that live task was created with (needed by the tamper endpoint). */
  liveSpec: string
}

export function CheatPanel({ mode, liveTaskId, liveSpec }: CheatPanelProps) {
  const [lastResult, setLastResult] = useState<DisplayResult | null>(null)
  const [pendingId, setPendingId] = useState<AttackId | null>(null)

  const isLive = mode === "live"
  const liveLocked = isLive && liveTaskId === null

  async function handleAttack(attackId: AttackId, title: string) {
    if (pendingId) return

    if (!isLive) {
      setPendingId(attackId)
      const { blockedMessage } = simulateAttack(attackId)
      setLastResult({ id: attackId, title, kind: "demo-blocked", message: blockedMessage })
      setTimeout(() => setPendingId(null), 200)
      return
    }

    if (liveTaskId === null) return

    setPendingId(attackId)
    setLastResult(null)
    try {
      const outcome = await runCheatLive({ attackId, taskId: liveTaskId, spec: liveSpec })
      setLastResult({ id: attackId, title, kind: outcome.kind, message: outcome.reason })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section id="security" className="pb-20">
      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
            <CardTitle className="text-destructive">Try to cheat</CardTitle>
            <Badge variant="outline" className="border-destructive/30 text-destructive">
              {isLive ? "Live — real testnet contract" : "Simulation only"}
            </Badge>
          </div>
          <CardDescription>
            {isLive
              ? "These buttons call the real backend and the deployed Soroban contract for the task above. A result of “not blocked” is a genuine finding, not a simulation."
              : "These buttons simulate common attacks against the verification flow, entirely in the browser. They do not touch a smart contract or backend yet — this only shows how the design is meant to resist them."}
          </CardDescription>
          {liveLocked && (
            <p className="text-xs text-destructive/80">
              Run a live verification above first — these attacks need a real task id.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ATTACKS.map((attack) => {
              const Icon = attack.icon
              const isLastClicked = lastResult?.id === attack.id
              const isPending = pendingId === attack.id
              const disabled = liveLocked || (pendingId !== null && !isPending)
              return (
                <button
                  key={attack.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleAttack(attack.id, attack.label)}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3 text-left transition-all duration-150 motion-reduce:transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive disabled:cursor-not-allowed disabled:opacity-50",
                    isLastClicked
                      ? "border-destructive/60 bg-destructive/10"
                      : "border-destructive/25 hover:bg-destructive/10",
                    isPending && "scale-[0.98] motion-reduce:scale-100"
                  )}
                >
                  {isPending ? (
                    <Loader2
                      className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-destructive motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                  )}
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
              className={cn(
                "flex items-start gap-2 rounded-md border p-3 text-sm",
                lastResult.kind === "demo-blocked" || lastResult.kind === "blocked"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : lastResult.kind === "not-blocked"
                    ? "border-destructive/50 bg-destructive/15"
                    : "border-amber-400/30 bg-amber-400/10"
              )}
            >
              {lastResult.kind === "demo-blocked" || lastResult.kind === "blocked" ? (
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                  aria-hidden="true"
                />
              ) : lastResult.kind === "not-blocked" ? (
                <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              ) : (
                <ShieldAlert
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                  aria-hidden="true"
                />
              )}
              <p
                className={cn(
                  lastResult.kind === "demo-blocked" || lastResult.kind === "blocked"
                    ? "text-emerald-300"
                    : lastResult.kind === "not-blocked"
                      ? "text-destructive"
                      : "text-amber-200"
                )}
              >
                <span className="font-medium">
                  {lastResult.kind === "demo-blocked" && `Blocked (simulated) — ${lastResult.title}:`}
                  {lastResult.kind === "blocked" && `Blocked — ${lastResult.title}:`}
                  {lastResult.kind === "not-blocked" && `NOT BLOCKED — ${lastResult.title}:`}
                  {lastResult.kind === "missing-task" && `Couldn't run — ${lastResult.title}:`}
                  {lastResult.kind === "request-error" && `Request failed — ${lastResult.title}:`}
                </span>{" "}
                {lastResult.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
