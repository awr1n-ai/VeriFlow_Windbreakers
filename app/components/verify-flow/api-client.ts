import type {
  AgentType,
  AttackId,
  HashDisplayField,
  LiveStepRecord,
  RunResult,
  StageId,
  StageState,
} from "./types"

/**
 * Typed client for the real backend. This is the only place that knows the
 * wire shape of /api/run and /api/cheat (see app/api/run/route.ts and
 * app/api/cheat/route.ts) — components never parse raw responses themselves.
 */

// ---- Backend wire types, read directly off the route handlers ----

interface RunApiStep {
  step: string
  txHash?: string
  pass?: boolean
  code?: string
}

interface RunApiSuccess {
  taskId: number
  steps: RunApiStep[]
}

interface RunApiError {
  error: string
  steps: RunApiStep[]
}

export type BackendAttackId =
  | "agent_grades_self"
  | "fake_verdict"
  | "double_payout"
  | "tamper"

interface CheatApiResponse {
  blocked: boolean
  reason: string
}

// ---- Agreed UI id -> backend id mapping ----

export const ATTACK_ID_TO_BACKEND: Record<AttackId, BackendAttackId> = {
  "self-grading": "agent_grades_self",
  "fake-verdict": "fake_verdict",
  "double-payout": "double_payout",
  "tampered-receipt": "tamper",
}

// ---- Backend step <-> timeline stage mapping ----

const STEP_TO_STAGE: Record<string, StageId> = {
  create_task: "funded",
  agent_generate: "working",
  submit_receipt: "receipt",
  verify: "verified",
  settle: "settled",
}

const STEP_LABEL: Record<string, string> = {
  create_task: "Escrow funded",
  agent_generate: "Agent generated code",
  submit_receipt: "Receipt submitted",
  verify: "Tests verified",
  settle: "Settlement",
}

/**
 * Turns the backend's step log into StageState[] for the existing timeline
 * component. The real API is blocking, not streaming, so this is applied
 * once after the response arrives — never faked mid-request. A stage with no
 * matching step in the response is left "pending": the backend never
 * substantiated it, so the UI doesn't claim anything happened there.
 */
export function stagesFromSteps(
  baseStages: StageState[],
  steps: RunApiStep[]
): StageState[] {
  const byStage = new Map<StageId, RunApiStep>()
  for (const step of steps) {
    const stageId = STEP_TO_STAGE[step.step]
    if (stageId) byStage.set(stageId, step)
  }
  return baseStages.map((stage) => {
    const step = byStage.get(stage.id)
    if (!step) return { ...stage, status: "pending" as const }
    if (stage.id === "verified") {
      return { ...stage, status: step.pass ? ("success" as const) : ("failure" as const) }
    }
    return { ...stage, status: "success" as const }
  })
}

function toLiveSteps(steps: RunApiStep[]): LiveStepRecord[] {
  return steps.map((step) => ({
    step: step.step,
    label: STEP_LABEL[step.step] ?? step.step,
    txHash: step.txHash,
    pass: step.pass,
    note: step.code,
  }))
}

function txHashField(
  label: string,
  step: RunApiStep | undefined
): HashDisplayField {
  return step?.txHash
    ? { label, value: step.txHash, badge: "Testnet tx" }
    : { label, value: "Not available", badge: "Not returned" }
}

export interface RunLiveParams {
  agentType: AgentType
  spec: string
  /** Current timeline stages, used only as the template (id/label/description). */
  baseStages: StageState[]
}

export interface RunLiveOutcome {
  result: RunResult
  stages: StageState[]
}

/**
 * Calls the real POST /api/run and maps its response into both the shared
 * RunResult shape and the timeline's StageState[]. This is one blocking
 * request — there is no server-sent progress — so both are populated only
 * once, from whatever `steps` actually came back, never from simulated
 * intermediate updates. Centralized here so no component parses the raw
 * response itself.
 */
export async function runLive({
  agentType,
  spec,
  baseStages,
}: RunLiveParams): Promise<RunLiveOutcome> {
  const completedAt = new Date().toISOString()

  const empty = (errorMessage: string): RunLiveOutcome => ({
    result: {
      source: "live",
      agentType,
      functionName: "add",
      verified: false,
      outcome: null,
      generatedCode: null,
      testResults: null,
      serverTestSummary: null,
      hashFields: [],
      taskId: null,
      steps: null,
      errorMessage,
      completedAt,
    },
    stages: baseStages.map((stage) => ({ ...stage, status: "pending" as const })),
  })

  let response: Response
  try {
    response = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: agentType, spec }),
    })
  } catch {
    return empty(
      "Could not reach the backend. Check that the dev server and your network connection are up."
    )
  }

  const body = (await response.json().catch(() => null)) as
    | RunApiSuccess
    | RunApiError
    | null

  if (!body) {
    return empty(`Backend returned an unreadable response (HTTP ${response.status}).`)
  }

  const steps = body.steps ?? []
  const createTaskStep = steps.find((s) => s.step === "create_task")
  const agentStep = steps.find((s) => s.step === "agent_generate")
  const submitReceiptStep = steps.find((s) => s.step === "submit_receipt")
  const verifyStep = steps.find((s) => s.step === "verify")
  const settleStep = steps.find((s) => s.step === "settle")

  const pass = verifyStep?.pass ?? null
  const errorMessage = "error" in body ? body.error : null

  const result: RunResult = {
    source: "live",
    agentType,
    functionName: "add",
    verified: pass === true,
    outcome: pass === null ? null : pass ? "released" : "refunded",
    generatedCode: agentStep?.code ?? null,
    testResults: null,
    serverTestSummary:
      pass === null
        ? null
        : {
            pass,
            message:
              verifyStep?.code ??
              (pass
                ? "Fixed server-side test suite passed."
                : "Fixed server-side test suite failed."),
          },
    hashFields: [
      txHashField("Escrow funding tx hash", createTaskStep),
      txHashField("Receipt submission tx hash", submitReceiptStep),
      txHashField("Settlement tx hash", settleStep),
    ],
    taskId: "taskId" in body ? body.taskId : null,
    steps: toLiveSteps(steps),
    errorMessage,
    completedAt,
  }

  return { result, stages: stagesFromSteps(baseStages, steps) }
}

// ---- Attack simulation against the real backend ----

export type LiveAttackOutcomeKind =
  | "blocked"
  | "not-blocked"
  | "missing-task"
  | "request-error"

export interface LiveAttackOutcome {
  kind: LiveAttackOutcomeKind
  reason: string
}

export interface RunCheatLiveParams {
  attackId: AttackId
  taskId: number
  spec: string
}

export async function runCheatLive({
  attackId,
  taskId,
  spec,
}: RunCheatLiveParams): Promise<LiveAttackOutcome> {
  const backendAttack = ATTACK_ID_TO_BACKEND[attackId]

  let response: Response
  try {
    response = await fetch("/api/cheat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attack: backendAttack, taskId, spec }),
    })
  } catch {
    return { kind: "request-error", reason: "Could not reach the backend for this attack." }
  }

  const body = (await response.json().catch(() => null)) as CheatApiResponse | null
  if (!body) {
    return {
      kind: "request-error",
      reason: `Backend returned an unreadable response (HTTP ${response.status}).`,
    }
  }

  if (body.reason === "taskId not found in store") {
    return {
      kind: "missing-task",
      reason:
        "The backend lost track of this task's code (e.g. a dev-server restart since the run). This isn't a security result — run a fresh live task first.",
    }
  }

  return { kind: body.blocked ? "blocked" : "not-blocked", reason: body.reason }
}
