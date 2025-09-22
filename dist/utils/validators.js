/**
 * validators.ts
 * Zod schemas for validating request bodies and limits.
 */
import { z } from 'zod';
export const transformSchema = z.object({
    task: z.enum(['rewrite', 'grammar', 'summarize', 'shorten', 'expand', 'extend', 'change_tone']),
    tone: z.enum(['neutral', 'formal', 'friendly', 'confident', 'persuasive', 'casual']).optional().default('neutral'),
    input: z.string().min(1).max(10_000),
    redact: z.boolean().optional().default(false)
}).refine((v) => v.task !== 'change_tone' || (v.tone && v.tone !== 'neutral'), {
    message: 'tone is required for change_tone and must not be neutral',
    path: ['tone']
});
