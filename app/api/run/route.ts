import { NextRequest, NextResponse } from "next/server";
import { computeReceipt } from "@/lib/receipt";
import { runTests } from "@/lib/verifier";
import { GoodAgent, LazyAgent } from "@/lib/agent";
import { createTask, submitReceipt, settle } from "@/lib/chain";
import { taskCodeStore } from "@/lib/task-store";

const BUYER_SECRET = process.env.BUYER_SECRET!;
const AGENT_SECRET = process.env.AGENT_SECRET!;
const VERIFIER_SECRET = process.env.VERIFIER_SECRET!;

// Buyer's unit tests for the demo spec
const TESTS = `
if (typeof add !== 'function') throw new Error('add is not defined');
if (add(1, 2) !== 3) throw new Error('add(1,2) should be 3');
if (add(0, 0) !== 0) throw new Error('add(0,0) should be 0');
if (add(-1, 1) !== 0) throw new Error('add(-1,1) should be 0');
`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const agentType: "good" | "lazy" = body.agent === "lazy" ? "lazy" : "good";
  const spec =
    body.spec ??
    "Write a JavaScript function called `add` that takes two numbers and returns their sum.";

  const steps: Array<{
    step: string;
    txHash?: string;
    pass?: boolean;
    code?: string;
  }> = [];

  try {
    // Step 1 — buyer locks 10 XLM in escrow
    const { taskId, txHash: createTxHash } = await createTask(
      BUYER_SECRET,
      AGENT_SECRET,
      spec
    );
    steps.push({ step: "create_task", txHash: createTxHash });

    // Step 2 — agent generates code
    const code =
      agentType === "good"
        ? await GoodAgent(spec)
        : await LazyAgent(spec);
    taskCodeStore.set(taskId, code);
    steps.push({ step: "agent_generate", code });

    // Step 3 — agent submits receipt hash on-chain
    const receiptHash = computeReceipt(taskId, spec, code);
    const receiptTxHash = await submitReceipt(AGENT_SECRET, taskId, receiptHash);
    steps.push({ step: "submit_receipt", txHash: receiptTxHash });

    // Step 4 — verifier runs unit tests
    const { pass, error } = runTests(code, TESTS);
    steps.push({ step: "verify", pass, ...(error ? { code: error } : {}) });

    // Step 5 — verifier settles: PASS pays agent, FAIL refunds buyer
    const settleTxHash = await settle(VERIFIER_SECRET, taskId, pass);
    steps.push({ step: "settle", txHash: settleTxHash, pass });

    return NextResponse.json({ taskId, steps });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, steps }, { status: 500 });
  }
}
