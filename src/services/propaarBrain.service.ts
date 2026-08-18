import PROPAR_SYSTEM_PROMPT from '../prompts/propar.system';
import type { ProviderPayload, PromptBuilderOptions } from '../types/ai.types';
import { z } from 'zod';
import { AnalysisResponseSchema } from '../schemas/aiResponse.schema';

/**
 * Build a provider-agnostic payload for an LLM.
 * The payload includes the system prompt, the user prompt, and JSON instructions guiding
 * the model to return a strict JSON response.
 */
export function buildProviderPayload(userPrompt: string, options?: PromptBuilderOptions): ProviderPayload {
  const system = options?.systemPrompt ?? PROPAR_SYSTEM_PROMPT;

  const jsonInstructions = options?.jsonInstructions ?? {
    outputFormat: 'json',
    schema: {
      intent: 'string',
      thinkingGap: 'string',
      missingContext: '{ item: string, whyItMatters: string, expectedImpact: string }[]',
      hiddenAssumptions: '{ assumption: string, risk: string, detectedBecause: string }[]',
      suggestions: '{ recommendation: string, reason: string, expectedBenefit: string }[]',
      expertConsiderations: '{ consideration: string, whyItMatters: string }[]',
      whatChanged: 'string[]',
      thinkingScore: 'number',
      estimatedImprovement: 'number',
      improvedPrompt: 'string',
    },
  };

  const messages = [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: userPrompt },
  ];

  return { messages, jsonInstructions, metadata: { createdAt: Date.now() } };
}

/**
 * Validate an AI response object using Zod. Throws on invalid responses.
 */
export function validateAnalysisResponse(obj: unknown) {
  const parseResult = AnalysisResponseSchema.safeParse(obj);
  if (!parseResult.success) {
    // throw a well-typed error to be handled by caller logic
    const e = new Error('Invalid analysis response');
    // attach zod error for debugging
    (e as any).details = parseResult.error.format();
    throw e;
  }
  return parseResult.data;
}

/**
 * High-level: prepare request payload and validate a parsed LLM response.
 * This is provider-independent and will be used by provider adapters.
 */
export const ProParBrain = {
  buildProviderPayload,
  validateAnalysisResponse,
};

export default ProParBrain;
