/**
 * prompts.ts
 * Builds a single plain-text prompt combining System + task block + input.
 */

const SYSTEM = "You are a writing assistant embedded in a clipboard tool. Follow the requested task exactly. Preserve factual content, names, numbers, and URLs. Do not invent details. Keep formatting clean. Return only the transformed text—no preface or explanations.";

const REWRITE = {
  clear: "Rewrite to be clear, professional, and grammatically correct; keep similar length.",
  friendly: "Rewrite warm, friendly, still professional.",
  concise: "Rewrite ~35% shorter; remove filler; keep key points.",
  formal: "Rewrite in formal business tone.",
  grammar: "Correct grammar/spelling/punctuation only; do not change tone or structure."
} as const;

const SUMMARIZE = "Summarize the text into 3–5 crisp bullets with only the key points.";

export type Task = 'rewrite' | 'summarize';
export type Tone = keyof typeof REWRITE;

export function buildPrompt(task: Task, tone: Tone, input: string): string {
  const block = task === 'summarize' ? SUMMARIZE : REWRITE[tone];
  return `${SYSTEM}\n\n${block}\n\n${input}`;
}
