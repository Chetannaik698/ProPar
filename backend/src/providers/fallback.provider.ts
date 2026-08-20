import {
  AiProviderError,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
} from './ai-provider.types.js';

export class FallbackAiProvider implements AiProvider {
  public readonly name: string;
  public readonly model: string;
  private readonly providers: AiProvider[];

  constructor(providers: AiProvider[]) {
    const first = providers[0];
    if (!first) {
      throw new Error('FallbackAiProvider requires at least one provider.');
    }
    this.providers = providers;
    this.name = first.name;
    this.model = first.model;
  }

  public async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    let lastError: Error | null = null;

    for (let index = 0; index < this.providers.length; index += 1) {
      const provider = this.providers[index];
      if (!provider) continue;

      try {
        console.info('Attempting completion with provider', {
          providerName: provider.name,
          model: provider.model,
          isFallbackAttempt: index > 0,
        });

        const result = await provider.complete(request);
        if (index > 0) {
          console.info('Fallback provider succeeded!', {
            successfulProvider: provider.name,
            model: provider.model,
          });
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown provider failure');
        const hasMoreFallbacks = index < this.providers.length - 1;

        console.warn('Provider completion attempt failed', {
          failedProvider: provider.name,
          model: provider.model,
          errorMessage: lastError.message,
          hasMoreFallbacks,
        });

        if (!hasMoreFallbacks) {
          break;
        }

        if (lastError instanceof AiProviderError) {
          // If error is invalid key, rate limit, timeout, provider error, or network error, fall back to next provider
          const isFallbackable = [
            'INVALID_API_KEY',
            'RATE_LIMIT',
            'TIMEOUT',
            'PROVIDER_UNAVAILABLE',
            'NETWORK_FAILURE',
            'MODEL_UNAVAILABLE',
            'PROVIDER_ERROR',
            'PAYMENT_REQUIRED',
          ].includes(lastError.code);

          if (!isFallbackable) {
            throw lastError;
          }
        }
      }
    }

    throw lastError ?? new AiProviderError('All AI providers failed.', 'PROVIDER_ERROR');
  }
}
