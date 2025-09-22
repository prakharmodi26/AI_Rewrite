/**
 * prompts.ts
 * Builds a single plain-text prompt combining System + task instruction + input.
 */
const SYSTEM = "You are a writing assistant embedded in a clipboard tool. Follow the requested task exactly. Preserve factual content, names, numbers, and URLs. Do not invent details. Keep formatting clean. Return only the transformed text—no preface or explanations.";
const TONE_INSTRUCTIONS = {
    formal: 'Use a formal, professional tone.',
    friendly: 'Use a warm, friendly tone.',
    confident: 'Use a confident, assertive tone.',
    persuasive: 'Use a persuasive tone that motivates the reader.',
    casual: 'Use a casual, conversational tone.'
};
function instructionFor(task, tone) {
    switch (task) {
        case 'rewrite':
            return tone === 'neutral'
                ? 'Rewrite this text clearly and smoothly, keeping the meaning the same.'
                : `Rewrite this text clearly and smoothly, keeping the meaning the same. ${TONE_INSTRUCTIONS[tone]}`;
        case 'grammar':
            return 'Correct grammar, punctuation, and spelling without changing tone or meaning.';
        case 'summarize':
            return 'Summarize this text in 2–3 clear sentences focusing only on the key points.';
        case 'shorten':
            return tone === 'neutral'
                ? 'Rewrite this text in a shorter, more concise way while preserving all key information.'
                : `Rewrite this text in a shorter, more concise way while preserving all key information. ${TONE_INSTRUCTIONS[tone]}`;
        case 'expand':
        case 'extend':
            return tone === 'neutral'
                ? 'Make this text longer with more detail and explanation, keeping the original meaning.'
                : `Make this text longer with more detail and explanation, keeping the original meaning. ${TONE_INSTRUCTIONS[tone]}`;
        case 'change_tone':
            // Tone must be provided and not neutral per validator
            return `${TONE_INSTRUCTIONS[tone]}`;
        default:
            return 'Rewrite this text clearly and smoothly, keeping the meaning the same.';
    }
}
export function buildPrompt(task, tone, input) {
    const block = instructionFor(task, tone);
    return `${SYSTEM}\n\n${block}\n\n${input}`;
}
