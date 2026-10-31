import vm from "vm";

export interface VerifierResult {
  pass: boolean;
  error?: string;
}

export function runTests(code: string, tests: string): VerifierResult {
  // Concatenate agent code + buyer's assertions into one script
  const script = `${code}\n${tests}`;
  try {
    // Empty sandbox — no require/process/etc. available to the agent code
    vm.runInNewContext(script, {}, { timeout: 3000 });
    return { pass: true };
  } catch (err: unknown) {
    return {
      pass: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
