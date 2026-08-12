import { z } from 'zod';

export const AnalysisSchema = z.object({
  intent: z.string().min(1),
  thinkingGap: z.string().optional().default(''),
  missingContext: z.array(z.object({
    item: z.string().min(1),
    whyItMatters: z.string().min(1),
    expectedImpact: z.string().min(1),
  })).default([]),
  hiddenAssumptions: z.array(z.object({
    assumption: z.string().min(1),
    risk: z.string().min(1),
    detectedBecause: z.string().min(1),
  })).default([]),
  suggestions: z.array(z.object({
    recommendation: z.string().min(1),
    reason: z.string().min(1),
    expectedBenefit: z.string().min(1),
  })).default([]),
  expertConsiderations: z.array(z.object({
    consideration: z.string().min(1),
    whyItMatters: z.string().min(1),
  })).max(5).default([]),
  whatChanged: z.array(z.string()).default([]),
  thinkingScore: z.number().int().min(0).max(100),
  estimatedImprovement: z.number().int(),
  improvedPrompt: z.string().min(1),
});

export const AnalysisResponseSchema = z.object({
  success: z.literal(true),
  analysis: AnalysisSchema,
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
