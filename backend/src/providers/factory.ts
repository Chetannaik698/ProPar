import { aiConfig } from '../config/ai.js';
import type { AiProvider } from './ai-provider.types.js';
import { GeminiProvider } from './gemini.provider.js';
import { GroqProvider } from './groq.provider.js';
import { OpenRouterProvider } from './openrouter.provider.js';
import { FallbackAiProvider } from './fallback.provider.js';

export function createAiProvider(): AiProvider {
  const providers: AiProvider[] = [];

  // Helper to instantiate provider by name
  const instantiate = (name: string): AiProvider | null => {
    switch (name) {
      case 'gemini':
        return new GeminiProvider();
      case 'groq':
        return new GroqProvider();
      case 'openrouter':
        return new OpenRouterProvider();
      default:
        return null;
    }
  };

  const primary = instantiate(aiConfig.primaryProvider);
  if (primary) providers.push(primary);

  const fallback = instantiate(aiConfig.fallbackProvider);
  if (fallback && fallback.name !== primary?.name) {
    providers.push(fallback);
  }

  // Include OpenRouter as tertiary fallback if configured and not already included
  if (aiConfig.openRouter.apiKey && !providers.some((p) => p.name === 'openrouter')) {
    providers.push(new OpenRouterProvider());
  }

  if (providers.length === 0) {
    // Default to Gemini if no providers are selected
    providers.push(new GeminiProvider());
  }

  const firstProvider = providers[0];
  if (providers.length === 1 && firstProvider) {
    return firstProvider;
  }

  return new FallbackAiProvider(providers);
}
