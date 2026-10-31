import type {
  AgentType,
  AttackId,
  AttackResult,
  RunResult,
  StageId,
  StageState,
  TestCaseInput,
  TestCaseResult,
} from "./types"

export const DEFAULT_FUNCTION_NAME = "add"

export const DEFAULT_SPEC =
  "Implement a function that adds two integers and returns their sum. It must handle negative numbers and zero correctly."

export const DEFAULT_TEST_CASES_TEXT = JSON.stringify(
  [
    { input: [2, 3], expected: 5 },
    { input: [10, -4], expected: 6 },
    { input: [0, 0], expected: 0 },
  ],
  null,
  2
)

export const INITIAL_STAGES: StageState[] = [
  {
    id: "funded",
    label: "Funded",
    description: "Escrow funded for this task",
    status: "pending",
  },
  {
    id: "working",
    label: "Agent working",
    description: "Agent generates a solution",
    status: "pending",
  },
  {
    id: "receipt",
    label: "Receipt signed",
    description: "Agent signs a receipt for its submission",
    status: "pending",
  },
  {
    id: "verified",
    label: "Verified",
    description: "Independent verifier runs the test suite",
    status: "pending",
  },
  {
    id: "settled",
    label: "Settled",
    description: "Funds released or refunded",
    status: "pending",
  },
]

/**
 * Parses the test case textarea content. Thrown errors are caught by the
 * caller and surfaced as form validation messages.
 */
export function parseTestCases(raw: string): TestCaseInput[] {
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Test cases must be a non-empty JSON array.")
  }
  return parsed.map((entry, index) => {
    if (
      typeof entry !== "object" ||
      entry === null ||
      !Array.isArray(entry.input) ||
      entry.input.some((n: unknown) => typeof n !== "number") ||
      typeof entry.expected !== "number"
    ) {
      throw new Error(
        `Test case ${index + 1} must look like { "input": [number, ...], "expected": number }.`
      )
    }
    return { input: entry.input as number[], expected: entry.expected as number }
  })
}

/**
 * The two simulated agent implementations. This is a local mock only: the
 * actual spec/function name text is never executed. "Good" always submits a
 * correct two-argument sum; "Lazy" always submits a shortcut that ignores
 * the second argument, which realistic test suites catch.
 */
function implementationFor(agentType: AgentType): (a: number, b: number) => number {
  return agentType === "good" ? (a, b) => a + b : (a) => a
}

export function generatedCodeFor(agentType: AgentType, functionName: string): string {
  const name = functionName.trim() || "add"
  if (agentType === "good") {
    return `function ${name}(a, b) {\n  return a + b;\n}`
  }
  return `function ${name}(a, b) {\n  // shortcut: ignores "b" to finish fast\n  return a;\n}`
}

export function runTestCases(
  agentType: AgentType,
  cases: TestCaseInput[]
): TestCaseResult[] {
  const impl = implementationFor(agentType)
  return cases.map((testCase) => {
    try {
      const [a, b] = testCase.input
      const actual = impl(a, b)
      return { ...testCase, actual, passed: actual === testCase.expected }
    } catch (error) {
      return {
        ...testCase,
        actual: null,
        passed: false,
        error: error instanceof Error ? error.message : "Execution error",
      }
    }
  })
}

async function sha256Hex(payload: string): Promise<string> {
  const data = new TextEncoder().encode(payload)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function randomDemoHex(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export interface RunStageCallbacks {
  onStageChange: (stageId: StageId, status: StageState["status"]) => void
}

const STAGE_DELAY_MS = {
  funded: 450,
  working: 950,
  receipt: 650,
  verified: 900,
  settled: 550,
} as const

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runVerification(
  agentType: AgentType,
  functionName: string,
  testCases: TestCaseInput[],
  callbacks: RunStageCallbacks
): Promise<RunResult> {
  const { onStageChange } = callbacks

  onStageChange("funded", "active")
  await wait(STAGE_DELAY_MS.funded)
  onStageChange("funded", "success")

  onStageChange("working", "active")
  await wait(STAGE_DELAY_MS.working)
  const generatedCode = generatedCodeFor(agentType, functionName)
  onStageChange("working", "success")

  onStageChange("receipt", "active")
  await wait(STAGE_DELAY_MS.receipt)
  const receiptHash = await sha256Hex(
    JSON.stringify({ functionName, agentType, generatedCode, testCases })
  )
  onStageChange("receipt", "success")

  onStageChange("verified", "active")
  await wait(STAGE_DELAY_MS.verified)
  const testResults = runTestCases(agentType, testCases)
  const verified = testResults.every((result) => result.passed)
  onStageChange("verified", verified ? "success" : "failure")

  onStageChange("settled", "active")
  await wait(STAGE_DELAY_MS.settled)
  onStageChange("settled", "success")

  return {
    source: "demo",
    agentType,
    functionName,
    verified,
    outcome: verified ? "released" : "refunded",
    generatedCode,
    testResults,
    serverTestSummary: null,
    hashFields: [
      { label: "Receipt hash (SHA-256)", value: receiptHash, badge: "Demo" },
      { label: "Transaction reference", value: randomDemoHex(32), badge: "Illustrative only" },
    ],
    taskId: null,
    steps: null,
    errorMessage: null,
    completedAt: new Date().toISOString(),
  }
}

const ATTACK_COPY: Record<AttackId, AttackResult> = {
  "self-grading": {
    id: "self-grading",
    title: "Agent grades itself",
    blockedMessage:
      "the agent submitted its own passing grade instead of a verdict from the independent verifier. VeriFlow's flow requires a separate verifier role before funds can move, so self-attestation is rejected by design.",
  },
  "fake-verdict": {
    id: "fake-verdict",
    title: "Fake verifier verdict",
    blockedMessage:
      "a 'verified' verdict was submitted without a matching signed receipt. The verdict doesn't correspond to any receipt this task actually produced, so it's rejected.",
  },
  "double-payout": {
    id: "double-payout",
    title: "Double payout",
    blockedMessage:
      "a second settlement request was submitted for a task that was already settled. Each task can only be paid out once.",
  },
  "tampered-receipt": {
    id: "tampered-receipt",
    title: "Tamper with receipt",
    blockedMessage:
      "the receipt contents were altered after signing. The recomputed hash no longer matches the signed hash, so the mismatch is caught.",
  },
}

export function simulateAttack(id: AttackId): AttackResult {
  return ATTACK_COPY[id]
}
