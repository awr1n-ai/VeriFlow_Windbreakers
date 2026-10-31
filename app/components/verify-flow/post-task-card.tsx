"use client"

import { AlertCircle, Loader2, Play } from "lucide-react"

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
import { AgentSelector } from "./agent-selector"
import type { AgentType } from "./types"

interface PostTaskCardProps {
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

export function PostTaskCard({
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
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle>Post a task</CardTitle>
        <CardDescription>
          Describe the work, pick an agent, and run verification.
        </CardDescription>
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
              required
              disabled={isRunning}
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
              required
              disabled={isRunning}
              className="font-mono text-xs"
              aria-describedby={error ? "form-error" : undefined}
              aria-invalid={error ? true : undefined}
            />
          </div>

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
                Running verification&hellip;
              </>
            ) : (
              <>
                <Play className="h-4 w-4" aria-hidden="true" />
                Run verification
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
