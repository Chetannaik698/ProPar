import { z } from 'zod';

const clarificationQuestionSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    question: z.string().trim().min(1).max(1000),
    reason: z.string().trim().min(1).max(1000),
    expectedImprovement: z.string().trim().min(1).max(1000),
    informationGain: z.string().trim().min(1).max(1000),
    type: z.enum(['multiple-choice', 'text']),
    options: z.array(z.string().trim().min(1).max(500)).max(5).optional(),
  })
  .superRefine((question, context) => {
    if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Multiple-choice questions require at least two options.',
        path: ['options'],
      });
    }

    if (question.type === 'text' && question.options && question.options.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Text questions must not include options.',
        path: ['options'],
      });
    }
  });

const missingContextItemSchema = z.object({
  item: z.string().trim().min(1).max(1000),
  whyItMatters: z.string().trim().min(1).max(2000),
  expectedImpact: z.string().trim().min(1).max(2000),
});

const assumptionItemSchema = z.object({
  assumption: z.string().trim().min(1).max(2000),
  risk: z.string().trim().min(1).max(2000),
  detectedBecause: z.string().trim().min(1).max(2000),
  challengeQuestion: z.string().trim().min(1).max(1000).optional(),
});

const recommendationItemSchema = z.object({
  recommendation: z.string().trim().min(1).max(2000),
  reason: z.string().trim().min(1).max(2000),
  consequence: z.string().trim().min(1).max(2000),
  opportunity: z.string().trim().min(1).max(2000).optional(),
  expectedBenefit: z.string().trim().min(1).max(2000),
});

const expertConsiderationSchema = z.object({
  expert: z.string().trim().min(1).max(1000),
  standsOut: z.string().trim().min(1).max(2000),
  concern: z.string().trim().min(1).max(2000),
  opportunity: z.string().trim().min(1).max(2000),
});

const inferredGoalSchema = z.object({
  value: z.string().trim().min(1).max(2000),
  inferredBecause: z.string().trim().min(1).max(2000),
});

const goalDiscoverySchema = z.object({
  primaryGoal: inferredGoalSchema,
  secondaryGoal: inferredGoalSchema,
  hiddenMotivation: inferredGoalSchema,
  expectedSuccess: inferredGoalSchema,
  possibleFailure: inferredGoalSchema,
});

const blindSpotSchema = z.object({
  impactRank: z.number().int().min(1).max(5),
  riskArea: z.string().trim().min(1).max(1000),
  blindSpot: z.string().trim().min(1).max(2000),
  consequence: z.string().trim().min(1).max(2000),
});

export const aiAnalysisSchema = z.object({
  goalDiscovery: goalDiscoverySchema,
  intent: z.string().trim().min(1),
  thinkingGap: z.string().trim().min(1),
  missingContext: z.array(missingContextItemSchema),
  hiddenAssumptions: z.array(assumptionItemSchema),
  blindSpots: z.array(blindSpotSchema).max(5).default([]),
  suggestions: z.array(recommendationItemSchema),
  expertConsiderations: z.array(expertConsiderationSchema).max(5).default([]),
  whatChanged: z.array(z.string().trim().min(1).max(1000)).max(8).default([]),
  thinkingScore: z.number().min(0).max(100).transform((v) => Math.round(v)),
  estimatedImprovement: z.number().min(0).max(100).transform((v) => Math.round(v)),
  improvedPrompt: z.string().trim(),
  needsClarification: z.boolean().default(false),
  clarificationQuestions: z.array(clarificationQuestionSchema).default([]),
}).superRefine((analysis, context) => {
  if (analysis.needsClarification) {
    if (analysis.clarificationQuestions.length < 1 || analysis.clarificationQuestions.length > 3) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Clarification mode requires between 1 and 3 questions.',
        path: ['clarificationQuestions'],
      });
    }
    return;
  }

  if (analysis.clarificationQuestions.length > 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Final analyses must not include clarification questions.',
      path: ['clarificationQuestions'],
    });
  }

  if (analysis.improvedPrompt.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Final analyses require an improved prompt.',
      path: ['improvedPrompt'],
    });
  }
});

export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;
