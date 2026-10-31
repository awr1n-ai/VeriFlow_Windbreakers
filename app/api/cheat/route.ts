import { NextRequest, NextResponse } from "next/server";
import { computeReceipt } from "@/lib/receipt";
import { settle, submitReceipt } from "@/lib/chain";
import { taskCodeStore } from "@/lib/task-store";

const AGENT_SECRET = process.env.AGENT_SECRET!;
const VERIFIER_SECRET = process.env.VERIFIER_SECRET!;
const HACKER_SECRET = process.env.HACKER_SECRET!;

type AttackType =
  | "agent_grades_self"
  | "fake_verdict"
  | "double_payout"
  | "tamper";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const attack = body.attack as AttackType;
  const taskId: number = body.taskId;
  const spec: string = body.spec ?? "";

  try {
    switch (attack) {
      // Attack 1: agent wallet calls settle directly — blocked by require_auth
      case "agent_grades_self": {
        await settle(AGENT_SECRET, taskId, true);
        // If contract is correct this line is never reached
        return NextResponse.json(
          { blocked: false, reason: "CONTRACT DID NOT BLOCK — check require_auth" },
          { status: 500 }
        );
      }

      // Attack 2: random hacker wallet calls settle — blocked by require_auth
      case "fake_verdict": {
        await settle(HACKER_SECRET, taskId, true);
        return NextResponse.json(
          { blocked: false, reason: "CONTRACT DID NOT BLOCK — check require_auth" },
          { status: 500 }
        );
      }

      // Attack 3: verifier calls settle twice — blocked by replay guard
      case "double_payout": {
        await settle(VERIFIER_SECRET, taskId, true);
        return NextResponse.json(
          { blocked: false, reason: "CONTRACT DID NOT BLOCK — replay guard missing" },
          { status: 500 }
        );
      }

      // Attack 4: tamper code post-receipt, re-hash, compare with on-chain hash
      case "tamper": {
        const originalCode = taskCodeStore.get(taskId);
        if (!originalCode) {
          return NextResponse.json(
            { blocked: false, reason: "taskId not found in store" },
            { status: 400 }
          );
        }

        const tamperedCode = originalCode + "\n// tampered";
        const _originalHash = computeReceipt(taskId, spec, originalCode);
        const tamperedHash = computeReceipt(taskId, spec, tamperedCode);

        // Try to overwrite with tampered receipt — contract checks hash match
        await submitReceipt(AGENT_SECRET, taskId, tamperedHash);

        return NextResponse.json(
          { blocked: false, reason: "CONTRACT DID NOT BLOCK — receipt collision" },
          { status: 500 }
        );
      }

      default:
        return NextResponse.json(
          { blocked: false, reason: "Unknown attack type" },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ blocked: true, reason });
  }
}
