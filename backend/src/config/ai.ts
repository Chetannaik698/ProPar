import { env } from './env.js';

const GEMINI_FREE_TIER_MODEL = 'gemini-3.1-flash-lite';
const LEGACY_GEMINI_MODEL_ALIASES: Record<string, string> = {
  'gemini-2.5-flash': GEMINI_FREE_TIER_MODEL,
  'google/gemini-2.5-flash': GEMINI_FREE_TIER_MODEL,
};

function normalizeGeminiModel(model: string): string {
  const trimmed = model.trim();
  return LEGACY_GEMINI_MODEL_ALIASES[trimmed] ?? (trimmed.length ? trimmed : GEMINI_FREE_TIER_MODEL);
}

const geminiModel = normalizeGeminiModel(env.GEMINI_MODEL);

export const aiConfig = {
  openRouter: {
    providerName: 'openrouter',
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
    modelCandidates: [
      env.OPENROUTER_MODEL,
      ...env.OPENROUTER_FALLBACK_MODELS.split(',')
        .map((model) => model.trim())
        .filter((model) => model.length > 0),
    ],
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    maxCompletionTokens: env.AI_MAX_COMPLETION_TOKENS,
  },
  gemini: {
    providerName: 'gemini',
    apiKey: env.GEMINI_API_KEY,
    model: geminiModel,
    modelCandidates: Array.from(new Set([geminiModel, GEMINI_FREE_TIER_MODEL])),
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    maxCompletionTokens: env.AI_MAX_COMPLETION_TOKENS,
  },
  groq: {
    providerName: 'groq',
    apiKey: env.GROQ_API_KEY,
    model: env.GROQ_MODEL,
    modelCandidates: [env.GROQ_MODEL],
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    maxCompletionTokens: env.AI_MAX_COMPLETION_TOKENS,
  },
} as const;
