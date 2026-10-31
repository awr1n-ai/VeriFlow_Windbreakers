"use client"

import { Check, Copy, RotateCcw, ShieldAlert, ShieldCheck, X } from "lucide-react"
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
import type { RunResult } from "./types"

interface ResultCardProps {
  result: RunResult | null
  isRunning: boolean
  onReset: () => void
}

function HashField({ label, value, demoLabel }: { label: string; value: string; demoLabel: string }) {
  const [copied, setCopied] = useState(false)

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
        <Badge variant="outline" className="border-amber-400/30 text-amber-300">
          {demoLabel}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <code className="block flex-1 truncate rounded-md border border-border bg-muted/40 px-2 py-1.5 text-xs">
          {value}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        </Button>
      </div>
    </div>
  )
}

export function ResultCard({ result, isRunning, onReset }: ResultCardProps) {
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
              <Badge variant="secondary" className="ml-auto capitalize">
                {result.agentType} agent
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Function output ({result.functionName})
              </p>
              <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
                <code>{result.generatedCode}</code>
              </pre>
              <p className="text-xs text-muted-foreground">
                Simulated output for this demo — not executed on a real runtime.
              </p>
            </div>

            <ul className="space-y-1.5" aria-label="Test case results">
              {result.testResults.map((testCase, index) => (
                <li
                  key={index}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs transition-colors",
                    testCase.passed
                      ? "border-border"
                      : "border-destructive/30 bg-destructive/5"
                  )}
                >
                  <span className="font-mono text-muted-foreground">
                    {result.functionName}({testCase.input.join(", ")}) &rarr; expected {testCase.expected}
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

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <HashField
                label="Receipt hash (SHA-256)"
                value={result.receiptHash}
                demoLabel="Demo"
              />
              <HashField
                label="Transaction reference"
                value={result.demoTxHash}
                demoLabel="Illustrative only"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              These values are generated locally for this demo and are not real Soroban
              transactions or on-chain receipts.
            </p>
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
