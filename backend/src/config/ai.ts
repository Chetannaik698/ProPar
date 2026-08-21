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
    if (trimmed.includes('gemini') || trimmed.includes('3.1') || trimmed.includes('llama') || trimmed.includes('mistral') || trimmed.includes('qwen')) return 'openrouter/auto';
  }
  if (provider === 'gemini') {
    if (trimmed.includes('gemini-3.')) return 'gemini-2.5-flash';
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
    modelCandidates: Array.from(
      new Set([
        sanitizeModelName('gemini', env.GEMINI_MODEL),
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.5-pro',
      ])
    ),
    timeoutMs: env.AI_REQUEST_TIMEOUT_MS,
    maxCompletionTokens: env.AI_MAX_COMPLETION_TOKENS,
  },
  groq: {
    providerName: 'groq',
    apiKey: env.GROQ_API_KEY,
    model: sanitizeModelName('groq', env.GROQ_MODEL),
    modelCandidates: Array.from(
      new Set([
        sanitizeModelName('groq', env.GROQ_MODEL),
        'llama-3.3-70b-specdec',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'mixtral-8x7b-32768',
      ])
    ),
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
          'google/gemini-2.0-flash-exp:free',
          'meta-llama/llama-3.3-70b-instruct:free',
          'qwen/qwen-2.5-72b-instruct:free',
          'deepseek/deepseek-r1:free',
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