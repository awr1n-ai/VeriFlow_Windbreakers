import { createHash } from "crypto";

export function computeReceipt(
  taskId: number,
  spec: string,
  code: string
): string {
  return createHash("sha256")
    .update(JSON.stringify({ taskId, spec, code }))
    .digest("hex");
}
