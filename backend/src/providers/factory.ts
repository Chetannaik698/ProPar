import type { AiProvider } from './ai-provider.types.js';
import { OpenRouterProvider } from './openrouter.provider.js';

export function createAiProvider(): AiProvider {
  return new OpenRouterProvider();
}