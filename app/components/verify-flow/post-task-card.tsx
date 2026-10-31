"use client"

import { AlertCircle, Info, Loader2, Play } from "lucide-react"

import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { cn } from "@/app/lib/utils"
import { AgentSelector } from "./agent-selector"
import type { AgentType, RunMode } from "./types"

interface PostTaskCardProps {
  mode: RunMode
  onModeChange: (mode: RunMode) => void
  spec: string
  onSpecChange: (value: string) => void
  functionName: string
  onFunctionNameChange: (value: string) => void
  testCasesText: string
  onTestCasesChange: (value: string) => void
  agentType: AgentType
  onAgentTypeChange: (value: AgentType) => void
  isRunning: boolean
  error: string | null
  onSubmit: () => void
}

const MODES: { value: RunMode; label: string }[] = [
  { value: "demo", label: "Demo (mock)" },
  { value: "live", label: "Live (testnet)" },
]

export function PostTaskCard({
  mode,
  onModeChange,
  spec,
  onSpecChange,
  functionName,
  onFunctionNameChange,
  testCasesText,
  onTestCasesChange,
  agentType,
  onAgentTypeChange,
  isRunning,
  error,
  onSubmit,
}: PostTaskCardProps) {
  const isLive = mode === "live"

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Post a task</CardTitle>
            <CardDescription>
              Describe the work, pick an agent, and run verification.
            </CardDescription>
          </div>
          <div
            role="radiogroup"
            aria-label="Run mode"
            className="flex rounded-md border border-input p-0.5 text-xs"
          >
            {MODES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={mode === option.value}
                disabled={isRunning}
                onClick={() => onModeChange(option.value)}
                className={cn(
                  "rounded-sm px-2.5 py-1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  mode === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="task-spec">Task specification</Label>
            <Textarea
              id="task-spec"
              value={spec}
              onChange={(event) => onSpecChange(event.target.value)}
              rows={3}
              required
              disabled={isRunning}
            />
          </div>

          <div className="max-w-[12rem] space-y-1.5">
            <Label htmlFor="function-name">Function name</Label>
            <Input
              id="function-name"
              value={functionName}
              onChange={(event) => onFunctionNameChange(event.target.value)}
              required={!isLive}
              disabled={isRunning || isLive}
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="test-cases">Test cases (JSON)</Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {"{ input: number[], expected: number }"}
              </span>
            </div>
            <Textarea
              id="test-cases"
              value={testCasesText}
              onChange={(event) => onTestCasesChange(event.target.value)}
              rows={6}
              required={!isLive}
              disabled={isRunning || isLive}
              className="font-mono text-xs"
              aria-describedby={error ? "form-error" : undefined}
              aria-invalid={error ? true : undefined}
            />
          </div>

          {isLive && (
            <div className="flex items-start gap-2 rounded-md border border-sky-400/30 bg-sky-400/10 p-2.5 text-xs text-sky-300">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                Live mode calls the real backend, which always tests a fixed{" "}
                <code>add(a, b)</code> suite server-side. Function name and test cases
                above are only used in Demo mode and are disabled here so the UI
                doesn&apos;t claim they ran.
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Agent</Label>
            <AgentSelector
              value={agentType}
              onChange={onAgentTypeChange}
              disabled={isRunning}
            />
          </div>

          {error && (
            <div
              id="form-error"
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={isRunning} className="w-full gap-2">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                {isLive
                  ? "Running on Stellar testnet… this can take a minute"
                  : "Running verification…"}
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" />
                {isLive ? "Run on testnet" : "Run verification"}
              </>
            )}
          </Button>
          <p className="sr-only" role="status" aria-live="polite">
            {isRunning ? "Verification is running." : ""}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
