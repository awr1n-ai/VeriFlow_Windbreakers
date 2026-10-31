"use client"

import {
  AlertTriangle,
  Check,
  Copy,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Separator } from "@/app/components/ui/separator"
import { cn } from "@/app/lib/utils"
import type { HashDisplayField, RunResult } from "./types"

interface ResultCardProps {
  result: RunResult | null
  isRunning: boolean
  onReset: () => void
}

function HashField({ label, value, badge }: HashDisplayField) {
  const [copied, setCopied] = useState(false)
  const hasValue = value !== "Not available"

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can fail silently (e.g. insecure context); no demo data is lost.
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Badge
          variant="outline"
          className={
            hasValue
              ? "border-amber-400/30 text-amber-300"
              : "border-border text-muted-foreground"
          }
        >
          {badge}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <code className="block flex-1 truncate rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs">
          {value}
        </code>
        {hasValue && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            aria-label={`Copy ${label.toLowerCase()}`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export function ResultCard({ result, isRunning, onReset }: ResultCardProps) {
  const isLive = result?.source === "live"

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Result</CardTitle>
        <CardDescription>
          {result
            ? "Verification outcome for this run."
            : "Run a verification to see the outcome here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!result && !isRunning && (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-center">
            <ShieldCheck className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
            <p className="max-w-[20rem] text-sm text-muted-foreground">
              No run yet. Post a task to see a verified result or a refund.
            </p>
          </div>
        )}

        {isRunning && !result && (
          <div className="flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">
              Waiting for the verification pipeline to finish&hellip;
            </p>
          </div>
        )}

        {result && (
          <>
            {result.errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {result.outcome === null
                    ? "Run did not complete: "
                    : "Run completed with an error on the way: "}
                  {result.errorMessage}
                </span>
              </div>
            )}

            {result.outcome !== null && (
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={cn(
                    "gap-1",
                    result.verified
                      ? "bg-emerald-600 text-white hover:bg-emerald-600/90"
                      : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {result.verified ? (
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {result.verified ? "Verified" : "Failed verification"}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    result.outcome === "released"
                      ? "border-emerald-500/30 text-emerald-400"
                      : "border-amber-400/30 text-amber-300"
                  )}
                >
                  {result.outcome === "released" ? "Payment released" : "Payment refunded"}
                </Badge>
                <Badge variant="secondary" className={cn("capitalize", isLive ? "" : "ml-auto")}>
                  {result.agentType} agent
                </Badge>
                {isLive && (
                  <Badge variant="outline" className="ml-auto border-sky-400/30 text-sky-300">
                    Live &middot; Stellar testnet
                  </Badge>
                )}
              </div>
            )}

            {result.generatedCode && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Function output ({result.functionName})
                </p>
                <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
                  <code>{result.generatedCode}</code>
                </pre>
                <p className="text-xs text-muted-foreground">
                  {isLive
                    ? "Returned by the live agent for this task — not independently re-executed by this UI."
                    : "Simulated output for this demo — not executed on a real runtime."}
                </p>
              </div>
            )}

            {result.testResults && (
              <ul className="space-y-1.5" aria-label="Test case results">
                {result.testResults.map((testCase, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs transition-colors",
                      testCase.passed ? "border-border" : "border-destructive/30 bg-destructive/5"
                    )}
                  >
                    <span className="font-mono text-muted-foreground">
                      {result.functionName}({testCase.input.join(", ")}) &rarr; expected{" "}
                      {testCase.expected}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 font-medium",
                        testCase.passed ? "text-emerald-400" : "text-destructive"
                      )}
                    >
                      {testCase.passed ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {testCase.passed ? "Passed" : `Got ${testCase.actual ?? "error"}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {result.serverTestSummary && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Backend test suite (fixed, server-side)
                </p>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium",
                    result.serverTestSummary.pass
                      ? "border-border text-emerald-400"
                      : "border-destructive/30 bg-destructive/5 text-destructive"
                  )}
                >
                  {result.serverTestSummary.pass ? (
                    <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{result.serverTestSummary.message}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The live backend runs its own fixed test suite for <code>add</code> —
                  per-test-case detail isn&apos;t returned by the API.
                </p>
              </div>
            )}

            {result.hashFields.length > 0 && (
              <>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.hashFields.map((field) => (
                    <HashField key={field.label} {...field} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLive
                    ? "Real Soroban testnet transactions — not mainnet funds."
                    : "These values are generated locally for this demo and are not real Soroban transactions or on-chain receipts."}
                </p>
              </>
            )}
          </>
        )}
      </CardContent>
      {result && (
        <CardFooter>
          <Button type="button" variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset and run again
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
