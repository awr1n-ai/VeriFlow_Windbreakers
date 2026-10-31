export type AgentType = "good" | "lazy"

/** Demo = local mock-engine, unchanged. Live = real /api/run and /api/cheat. */
export type RunMode = "demo" | "live"

export type StageId = "funded" | "working" | "receipt" | "verified" | "settled"

export type StageStatus = "pending" | "active" | "success" | "failure"

export interface StageState {
  id: StageId
  label: string
  description: string
  status: StageStatus
}

export interface TestCaseInput {
  input: number[]
  expected: number
}

export interface TestCaseResult extends TestCaseInput {
  actual: number | null
  passed: boolean
  error?: string
}

/** Where a RunResult came from: the local mock, or a real call to /api/run. */
export type ResultSource = "demo" | "live"

/** One step from the real /api/run response, normalized for display. */
export interface LiveStepRecord {
  step: string
  label: string
  txHash?: string
  pass?: boolean
  note?: string
}

export interface HashDisplayField {
  label: string
  value: string
  badge: string
}

export interface ServerTestSummary {
  pass: boolean
  message: string
}

export interface RunResult {
  source: ResultSource
  agentType: AgentType
  functionName: string
  verified: boolean
  /** null when a live run didn't complete far enough to know an outcome. */
  outcome: "released" | "refunded" | null
  generatedCode: string | null
  /** Per-test-case breakdown — only available in demo mode. */
  testResults: TestCaseResult[] | null
  /** Pass/fail from the backend's fixed server-side suite — only available in live mode. */
  serverTestSummary: ServerTestSummary | null
  hashFields: HashDisplayField[]
  /** Real backend task id, needed to unlock the cheat panel. Null in demo mode. */
  taskId: number | null
  /** Raw step log from a live run, null in demo mode. */
  steps: LiveStepRecord[] | null
  /** Set when a live call failed or didn't fully complete. */
  errorMessage: string | null
  completedAt: string
}

export type AttackId =
  | "self-grading"
  | "fake-verdict"
  | "double-payout"
  | "tampered-receipt"

export interface AttackResult {
  id: AttackId
  title: string
  blockedMessage: string
}
