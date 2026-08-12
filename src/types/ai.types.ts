/**
 * Strongly typed interfaces for ProPar Brain AI responses and builder.
 */

export interface Analysis {
  intent: string;
  thinkingGap: string;
  missingContext: Array<{
    item: string;
    whyItMatters: string;
    expectedImpact: string;
  }>;
  hiddenAssumptions: Array<{
    assumption: string;
    risk: string;
    detectedBecause: string;
  }>;
  suggestions: Array<{
    recommendation: string;
    reason: string;
    expectedBenefit: string;
  }>;
  expertConsiderations: Array<{
    consideration: string;
    whyItMatters: string;
  }>;
  whatChanged: string[];
  thinkingScore: number; // 0-100
  estimatedImprovement: number; // percentage integer, e.g. 42
  improvedPrompt: string;
}

export interface AnalysisResponse {
  success: true;
  analysis: Analysis;
}

export type JsonInstructions = Record<string, unknown>;

export interface ProviderPayload {
  // Provider-agnostic payload shape. Consumers can map this to provider-specific clients.
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  jsonInstructions?: JsonInstructions;
  metadata?: Record<string, string | number | boolean>;
}

export interface PromptBuilderOptions {
  systemPrompt: string;
  jsonInstructions?: JsonInstructions;
}
