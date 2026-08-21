import { env } from './env.js';

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
    model: env.GEMINI_MODEL,
    modelCandidates: [env.GEMINI_MODEL],
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