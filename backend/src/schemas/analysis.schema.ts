import { z } from 'zod';

const clarificationAnswerSchema = z.object({
  questionId: z
    .string()
    .trim()
    .min(1, { message: 'Question id is required.' })
    .max(120, { message: 'Question id must be no more than 120 characters long.' }),
  answer: z
    .string()
    .trim()
    .min(1, { message: 'Answer is required.' })
    .max(4000, { message: 'Answer must be no more than 4000 characters long.' }),
});

const historyItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(10000),
});

export const analysisRequestSchema = z.object({
  platform: z.enum(['chatgpt', 'claude', 'linkedin', 'gmail']).default('chatgpt'),
  prompt: z
    .string()
    .trim()
    .min(3, { message: 'Prompt must be at least 3 characters long.' })
    .max(10000, { message: 'Prompt must be no more than 10000 characters long.' })
    .refine((value) => value.length > 0, { message: 'Prompt cannot be empty.' }),
  clarificationAnswers: z.array(clarificationAnswerSchema).max(5).optional(),
  history: z.array(historyItemSchema).max(20).optional(),
});

export type AnalysisRequestSchema = z.infer<typeof analysisRequestSchema>;
