import { GoogleGenerativeAI } from "@google/generative-ai";

const BROKEN_CODE = `function add(a, b) { return a - b; }`;

export async function GoodAgent(spec: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a JavaScript code generator. Return ONLY a valid JavaScript function — no markdown, no explanation, no backticks.

Spec: ${spec}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function LazyAgent(_spec: string): Promise<string> {
  return BROKEN_CODE;
}
