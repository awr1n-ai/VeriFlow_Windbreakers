import { GoogleGenerativeAI } from "@google/generative-ai";

const BROKEN_CODE = `function add(a, b) { return a - b; }`;

const MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"];

export async function GoodAgent(spec: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const prompt = `You are a JavaScript code generator. Return ONLY a valid JavaScript function — no markdown, no explanation, no backticks.

Spec: ${spec}`;

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const isRetryable = msg.includes("503") || msg.includes("529") || msg.includes("overloaded");
        if (!isRetryable) break; // not a capacity error — try next model
        if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  throw new Error("All Gemini models are currently unavailable. Please try again.");
}

export async function LazyAgent(_spec: string): Promise<string> {
  return BROKEN_CODE;
}
