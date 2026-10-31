"use client"

import { useState } from "react"

import { runLive } from "./api-client"
import { CheatPanel } from "./cheat-panel"
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
  RunMode,
  RunResult,
  StageId,
  StageState,
  TestCaseInput,
} from "./types"
import { VerificationTimeline } from "./verification-timeline"

export function VerifyFlowDemo() {
  const [mode, setMode] = useState<RunMode>("demo")

  const [spec, setSpec] = useState(DEFAULT_SPEC)
  const [functionName, setFunctionName] = useState(DEFAULT_FUNCTION_NAME)
  const [testCasesText, setTestCasesText] = useState(DEFAULT_TEST_CASES_TEXT)
  const [agentType, setAgentType] = useState<AgentType>("good")

  const [stages, setStages] = useState<StageState[]>(INITIAL_STAGES)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RunResult | null>(null)

  // Lifted so the cheat panel can target the task a real run actually produced.
  const [liveTaskId, setLiveTaskId] = useState<number | null>(null)
  const [liveSpec, setLiveSpec] = useState("")

  function resetStages() {
    setStages(INITIAL_STAGES.map((stage) => ({ ...stage, status: "pending" })))
  }

  function handleModeChange(nextMode: RunMode) {
    if (isRunning) return
    setMode(nextMode)
    setError(null)
    setResult(null)
    resetStages()
  }

  async function handleRun() {
    if (isRunning) return

    if (!spec.trim()) {
      setError("Task specification is required.")
      return
    }

    if (mode === "demo") {
      if (!functionName.trim()) {
        setError("Function name is required.")
        return
      }

      let testCases: TestCaseInput[]
      try {
        testCases = parseTestCases(testCasesText)
      } catch (parseError) {
        setError(
          parseError instanceof Error ? parseError.message : "Test cases must be valid JSON."
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
              previous.map((stage) => (stage.id === stageId ? { ...stage, status } : stage))
            )
          },
        })
        setResult(runResult)
      } finally {
        setIsRunning(false)
      }
      return
    }

    // Live mode: one blocking call to the real backend, no fabricated progress.
    setError(null)
    setResult(null)
    resetStages()
    setIsRunning(true)

    try {
      const { result: runResult, stages: liveStages } = await runLive({
        agentType,
        spec,
        baseStages: INITIAL_STAGES,
      })
      setResult(runResult)
      setStages(liveStages)
      if (runResult.taskId !== null) {
        setLiveTaskId(runResult.taskId)
        setLiveSpec(spec)
      }
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
    <>
      <section id="run-demo" className="space-y-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <PostTaskCard
            mode={mode}
            onModeChange={handleModeChange}
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

      <CheatPanel mode={mode} liveTaskId={liveTaskId} liveSpec={liveSpec} />
    </>
  )
}
