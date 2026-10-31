export type AgentType = "good" | "lazy"

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

export interface RunResult {
  agentType: AgentType
  functionName: string
  verified: boolean
  outcome: "released" | "refunded"
  generatedCode: string
  testResults: TestCaseResult[]
  receiptHash: string
  demoTxHash: string
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
