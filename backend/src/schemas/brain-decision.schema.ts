import { z } from 'zod';

export const priorityQuestionSchema = z.object({
  id: z.string().trim().min(1).max(80),
  question: z.string().trim().min(1).max(1000),
  reason: z.string().trim().min(1).max(1000),
  type: z.enum(['multiple-choice', 'text']),
  options: z.array(z.string().trim().min(1).max(500)).max(5).optional(),
});

export const brainDecisionSchema = z.object({
  intent: z.string().trim().min(1),
  goal: z.string().trim().min(1),
  knownContext: z.array(z.string().trim()).default([]),
  missingContext: z.array(z.string().trim()).default([]),
  ambiguities: z.array(z.string().trim()).default([]),
  assumptions: z.array(z.string().trim()).default([]),
  decision: z.enum(['answer', 'answer_with_assumptions', 'clarify']),
  priorityQuestions: z.array(priorityQuestionSchema).max(3).default([]),
  reasoningGuidance: z.string().trim().min(1),
});

export type BrainDecision = z.infer<typeof brainDecisionSchema>;
