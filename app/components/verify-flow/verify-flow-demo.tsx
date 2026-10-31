"use client"

import { useState } from "react"

import {
  DEFAULT_FUNCTION_NAME,
  DEFAULT_SPEC,
  DEFAULT_TEST_CASES_TEXT,
  INITIAL_STAGES,
  parseTestCases,
  runVerification,
} from "./mock-engine"
import { PostTaskCard } from "./post-task-card"
import { ResultCard } from "./result-card"
import type {
  AgentType,
  RunResult,
  StageId,
  StageState,
  TestCaseInput,
} from "./types"
import { VerificationTimeline } from "./verification-timeline"

export function VerifyFlowDemo() {
  const [spec, setSpec] = useState(DEFAULT_SPEC)
  const [functionName, setFunctionName] = useState(DEFAULT_FUNCTION_NAME)
  const [testCasesText, setTestCasesText] = useState(DEFAULT_TEST_CASES_TEXT)
  const [agentType, setAgentType] = useState<AgentType>("good")

  const [stages, setStages] = useState<StageState[]>(INITIAL_STAGES)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)

  function resetStages() {
    setStages(INITIAL_STAGES.map((stage) => ({ ...stage, status: "pending" })))
  }

  async function handleRun() {
    if (isRunning) return

    if (!spec.trim() || !functionName.trim()) {
      setError("Task specification and function name are required.")
      return
    }

    let testCases: TestCaseInput[]
    try {
      testCases = parseTestCases(testCasesText)
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? parseError.message
          : "Test cases must be valid JSON."
      )
      return
    }

    setError(null)
    setResult(null)
    resetStages()
    setIsRunning(true)

    try {
      const runResult = await runVerification(agentType, functionName, testCases, {
        onStageChange: (stageId: StageId, status) => {
          setStages((previous) =>
            previous.map((stage) =>
              stage.id === stageId ? { ...stage, status } : stage
            )
          )
        },
      })
      setResult(runResult)
    } finally {
      setIsRunning(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
    resetStages()
  }

  return (
    <section id="run-demo" className="space-y-6 pb-14">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <PostTaskCard
          spec={spec}
          onSpecChange={setSpec}
          functionName={functionName}
          onFunctionNameChange={setFunctionName}
          testCasesText={testCasesText}
          onTestCasesChange={setTestCasesText}
          agentType={agentType}
          onAgentTypeChange={setAgentType}
          isRunning={isRunning}
          error={error}
          onSubmit={handleRun}
        />
        <ResultCard result={result} isRunning={isRunning} onReset={handleReset} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h3 className="mb-5 text-sm font-medium text-muted-foreground">
          Verification timeline
        </h3>
        <VerificationTimeline stages={stages} />
      </div>
    </section>
  )
}
