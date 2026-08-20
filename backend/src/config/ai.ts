import { env } from './env.js';

/**
 * Normalizes and corrects deprecated or non-existent model strings.
 */
export function sanitizeModelName(provider: 'groq' | 'openrouter' | 'gemini', model: string): string {
  const trimmed = model.trim();
  if (provider === 'groq') {
    if (trimmed === 'llama-3.3-70b-versatile') return 'llama-3.3-70b-specdec';
  }
  if (provider === 'openrouter') {
    if (trimmed.includes('gemini-3.1')) return 'google/gemini-2.0-flash-001';
  }
  if (provider === 'gemini') {
    if (trimmed === 'gemini-2.0-flash' || trimmed.includes('gemini-3.1')) return 'gemini-3.6-flash';
  }
  return trimmed;
}

export const aiConfig = {
  primaryProvider: env.PRIMARY_AI_PROVIDER,
  fallbackProvider: env.FALLBACK_AI_PROVIDER,
  gemini: {
    providerName: 'gemini',
    apiKey: env.GEMINI_API_KEY,
    model: sanitizeModelName('gemini', env.GEMINI_MODEL),
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    maxCompletionTokens: env.AI_MAX_COMPLETION_TOKENS,
  },
  groq: {
    providerName: 'groq',
    apiKey: env.GROQ_API_KEY,
    model: sanitizeModelName('groq', env.GROQ_MODEL),
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    maxCompletionTokens: env.AI_MAX_COMPLETION_TOKENS,
  },
  openRouter: {
    providerName: 'openrouter',
    apiKey: env.OPENROUTER_API_KEY,
    model: sanitizeModelName('openrouter', env.OPENROUTER_MODEL),
    modelCandidates: Array.from(
      new Set(
        [
          sanitizeModelName('openrouter', env.OPENROUTER_MODEL),
          ...env.OPENROUTER_FALLBACK_MODELS.split(',')
            .map((model) => sanitizeModelName('openrouter', model))
            .filter((model) => model.length > 0),
        ]
      )
    ),
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    maxCompletionTokens: env.AI_MAX_COMPLETION_TOKENS,
  },
} as const;