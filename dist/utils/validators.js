/**
 * validators.ts
 * Zod schemas for validating request bodies and limits.
 */
import { z } from 'zod';
export const transformSchema = z.object({
    task: z.enum(['rewrite', 'summarize']),
    tone: z.enum(['clear', 'friendly', 'concise', 'formal', 'grammar']),
    input: z.string().min(1).max(10_000),
    redact: z.boolean().optional().default(false)
});
