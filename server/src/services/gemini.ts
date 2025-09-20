/**
 * gemini.ts
 * Google Generative AI client call with timeout, retry, and token usage parsing.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt } from '../utils/prompts.js';
import { safety } from '../config/safety.js';
import { UpstreamError } from '../utils/errors.js';
import { env } from '../config/env.js';

const MODEL = 'gemini-2.0-flash';

const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);

async function callGemini(prompt: string): Promise<{ text: string; tokens?: { in: number; out: number } }> {
  const model = client.getGenerativeModel({
    model: MODEL
    // If desired, we could move the system prompt into systemInstruction here,
    // but per requirements we concatenate into a single user prompt.
  });

  const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }]}], generationConfig: { maxOutputTokens: safety.maxOutputTokens } });
  const text = result.response.text().trim();
  const usage: any = (result as any)?.response?.usageMetadata;
  const tokens = usage ? { in: usage.promptTokenCount ?? undefined, out: usage.candidatesTokenCount ?? undefined } : undefined;
  return { text, tokens };
}

export async function generateTransform(params: { task: 'rewrite'|'summarize'; tone: 'clear'|'friendly'|'concise'|'formal'|'grammar'; input: string }): Promise<{ output: string; model: string; tokens?: { in: number; out: number } }> {
  const prompt = buildPrompt(params.task, params.tone, params.input);

  const to = safety.timeoutMs;
  let lastErr: any = null;
  for (let attempt = 1; attempt <= safety.retry.attempts; attempt++) {
    try {
      const res = await Promise.race([
        callGemini(prompt),
        new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('Timeout'), { status: 504 })), to))
      ]) as { text: string; tokens?: { in: number; out: number } };
      return { output: res.text.trim(), model: MODEL, tokens: res.tokens };
    } catch (err: any) {
      lastErr = err;
      const status = err?.status ?? err?.response?.status;
      if (status === 429 || (status >= 500 && status < 600)) {
        if (attempt < safety.retry.attempts) {
          await new Promise((r) => setTimeout(r, safety.retry.backoffMs));
          continue;
        }
      }
      break;
    }
  }
  throw new UpstreamError('Gemini request failed', lastErr?.status ?? lastErr?.response?.status);
}
