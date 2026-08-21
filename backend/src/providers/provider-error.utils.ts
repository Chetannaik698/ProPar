import type { AiProviderErrorCode } from './ai-provider.types.js';

const QUOTA_OR_LIMIT_PATTERNS = [
  'quota',
  'rate limit',
  'ratelimit',
  'too many requests',
  'limit exceeded',
  'usage limit',
  'daily limit',
  'monthly limit',
  'insufficient credits',
  'insufficient balance',
  'out of credits',
  'credit',
  'billing',
  'payment',
  'resource_exhausted',
  'free-models-per-day',
  'free model',
];

const PAYMENT_PATTERNS = [
  'credit',
  'balance',
  'billing',
  'payment',
  'paid',
  'subscription',
  'requires more credits',
];

const INVALID_KEY_PATTERNS = [
  'invalid api key',
  'incorrect api key',
  'api key not valid',
  'api key is invalid',
  'unauthorized',
  'authentication',
  'permission denied',
];

export function isQuotaOrLimitMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return QUOTA_OR_LIMIT_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function isInvalidApiKeyMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return INVALID_KEY_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function quotaOrLimitErrorCode(message: string): AiProviderErrorCode {
  const normalized = message.toLowerCase();
  return PAYMENT_PATTERNS.some((pattern) => normalized.includes(pattern)) ? 'PAYMENT_REQUIRED' : 'RATE_LIMIT';
}
