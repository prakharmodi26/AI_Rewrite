/**
 * validators.ts
 * Zod schemas for validating request bodies and limits.
 */
import { z } from 'zod';

const ToneEnum = z.enum(['formal', 'friendly', 'confident', 'persuasive', 'casual']);
const PercentEnum = z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(40), z.literal(50), z.literal(60)]);
const SummaryLevelEnum = z.enum(['light', 'medium', 'heavy']);

const Base = {
  input: z.string().min(1).max(10_000),
  redact: z.boolean().optional().default(false)
};

const RewriteSchema = z.object({
  task: z.literal('rewrite'),
  tone: ToneEnum,
  ...Base
});

const GrammarSchema = z.object({
  task: z.literal('grammar'),
  ...Base
});

const ShortenSchema = z.object({
  task: z.literal('shorten'),
  percent: PercentEnum,
  ...Base
});

const ExpandSchema = z.object({
  task: z.literal('expand'),
  percent: PercentEnum,
  ...Base
});

const SummarizeSchema = z.object({
  task: z.literal('summarize'),
  summary_level: SummaryLevelEnum,
  ...Base
});

export const transformSchema = z.discriminatedUnion('task', [
  RewriteSchema,
  GrammarSchema,
  ShortenSchema,
  ExpandSchema,
  SummarizeSchema
]);

export type TransformInput = z.infer<typeof transformSchema>;
