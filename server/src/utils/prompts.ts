/**
 * prompts.ts
 * Builds a single plain-text prompt combining System + task instruction + input.
 */

const SYSTEM = "You are a writing assistant embedded in a clipboard tool. Follow the requested task exactly. Preserve factual content, names, numbers, and URLs. Do not invent details. Keep formatting clean. Return only the transformed text—no preface or explanations.";

export type Task = 'rewrite' | 'grammar' | 'summarize' | 'shorten' | 'expand';
export type Tone = 'formal' | 'friendly' | 'confident' | 'persuasive' | 'casual';

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  formal: 'Use a formal, professional tone.',
  friendly: 'Use a warm, friendly tone.',
  confident: 'Use a confident, assertive tone.',
  persuasive: 'Use a persuasive tone that motivates the reader.',
  casual: 'Use a casual, conversational tone.'
};

export function buildPrompt(params: { task: Task; input: string; tone?: Tone; percent?: 10|20|30|40|50|60; summary_level?: 'light'|'medium'|'heavy'; }): string {
  const { task, input } = params;
  const tone = params.tone;
  const toneText = task === 'rewrite' && tone ? ` ${TONE_INSTRUCTIONS[tone]}` : '';
  let instruction = '';

  if (task === 'rewrite') {
    instruction = `Rewrite this text clearly and smoothly, keeping the meaning the same.${toneText}`;
  } else if (task === 'grammar') {
    instruction = 'Correct grammar, punctuation, and spelling without changing tone or meaning.';
  } else if (task === 'shorten') {
    const p = params.percent ?? 20;
    instruction = `Rewrite this text to be about ${p}% shorter, removing filler but preserving key information.`;
  } else if (task === 'expand') {
    const p = params.percent ?? 20;
    instruction = `Make this text about ${p}% longer with more detail and explanation, keeping the original meaning.`;
  } else if (task === 'summarize') {
    const level = params.summary_level ?? 'medium';
    const byLevel: Record<'light'|'medium'|'heavy', string> = {
      light: 'Summarize this text in 1–2 brief sentences with only the key idea.',
      medium: 'Summarize this text in 2–3 clear sentences focusing on the key points.',
      heavy: 'Summarize this text into 4–6 concise bullet points covering all major points.'
    };
    instruction = byLevel[level];
  }

  return `${SYSTEM}\n\n${instruction}\n\n${input}`;
}
