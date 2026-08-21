import type { AiProvider } from './ai-provider.types.js';
import { GeminiProvider } from './gemini.provider.js';

export function createAiProvider(): AiProvider {
  return new GeminiProvider();
}
