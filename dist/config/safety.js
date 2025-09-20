/**
 * safety.ts
 * Safety and reliability settings for Gemini requests.
 */
export const safety = {
    maxOutputTokens: 256,
    timeoutMs: 8000,
    retry: { attempts: 2, backoffMs: 300 }
};
