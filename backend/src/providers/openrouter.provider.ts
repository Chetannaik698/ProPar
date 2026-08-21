import { aiConfig } from '../config/ai.js';
import {
  AiProviderError,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
  type AiUsage,
} from './ai-provider.types.js';
import { isQuotaOrLimitMessage, quotaOrLimitErrorCode } from './provider-error.utils.js';

interface OpenRouterUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface OpenRouterResponse {
  id?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: OpenRouterUsage;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

interface OpenRouterErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export class OpenRouterProvider implements AiProvider {
  public readonly name = 'openrouter';
  public readonly model = aiConfig.openRouter.model;

  public async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    if (!aiConfig.openRouter.apiKey) {
      throw new AiProviderError(
        'OpenRouter API key is missing. Add OPENROUTER_API_KEY to the backend .env file.',
        'INVALID_API_KEY',
        500
      );
    }

    let lastError: AiProviderError | null = null;

    for (const model of aiConfig.openRouter.modelCandidates) {
      try {
        console.info('AI request started', {
          provider: this.name,
          model,
          promptLength: request.messages.reduce((total, message) => total + message.content.length, 0),
          timeoutMs: aiConfig.openRouter.timeoutMs,
          maxCompletionTokens: aiConfig.openRouter.maxCompletionTokens,
        });

        return await this.completeWithModel(request, model);
      } catch (error) {
        if (!(error instanceof AiProviderError)) {
          throw new AiProviderError('OpenRouter request failed', 'PROVIDER_ERROR');
        }

        lastError = error;
        if (!this.shouldTryFallback(error, model)) {
          throw error;
        }

        console.warn('OpenRouter model attempt failed; trying fallback model', {
          provider: this.name,
          model,
          code: error.code,
          statusCode: error.statusCode,
          message: error.message,
        });
      }
    }

    throw lastError ?? new AiProviderError('OpenRouter request failed', 'PROVIDER_ERROR');
  }

  private async completeWithModel(
    request: AiCompletionRequest,
    model: string
  ): Promise<AiCompletionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), aiConfig.openRouter.timeoutMs);
    const promptLength = request.messages.reduce((total, message) => total + message.content.length, 0);

    try {
      const requestBody: Record<string, unknown> = {
        model,
        messages: request.messages,
        max_tokens: aiConfig.openRouter.maxCompletionTokens,
        temperature: 0.2,
      };

      // Only pass json_object format for models known to support it, or try with fallback
      if (model.startsWith('openai/') || model.startsWith('google/') || model.startsWith('anthropic/')) {
        requestBody['response_format'] = { type: 'json_object' };
      }

      let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.openRouter.apiKey ?? ''}`,
          'HTTP-Referer': 'https://propaar.netlify.app',
          'X-Title': 'ProPaar',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      // If failed with 400 bad request and response_format was included, retry without response_format
      if (!response.ok && response.status === 400 && requestBody['response_format']) {
        delete requestBody['response_format'];
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiConfig.openRouter.apiKey ?? ''}`,
            'HTTP-Referer': 'https://propaar.netlify.app',
            'X-Title': 'ProPaar',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      }

      // If failed with 402 payment required and max_tokens > 1000, retry once with reduced max_tokens
      if (!response.ok && response.status === 402 && (requestBody['max_tokens'] as number) > 1000) {
        console.warn('OpenRouter returned 402 Payment Required; retrying with lower max_tokens token budget', {
          provider: this.name,
          model,
          originalMaxTokens: requestBody['max_tokens'],
          reducedMaxTokens: 1200,
        });
        requestBody['max_tokens'] = 1200;
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiConfig.openRouter.apiKey ?? ''}`,
            'HTTP-Referer': 'https://propaar.netlify.app',
            'X-Title': 'ProPaar',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
      }

      if (!response.ok) {
        const errorBody = await this.readErrorBody(response);
        throw this.mapHttpError(statusToNumber(response.status), errorBody, model);
      }

      let payload: OpenRouterResponse;
      try {
        payload = (await response.json()) as OpenRouterResponse;
      } catch (error) {
        console.error('OpenRouter response JSON parsing failed', {
          provider: this.name,
          model,
          errorMessage: error instanceof Error ? error.message : 'Unknown JSON parsing error',
        });
        throw new AiProviderError(
          'The AI provider returned invalid JSON. Please try again.',
          'MALFORMED_RESPONSE'
        );
      }

      const usage = this.mapUsage(payload.usage);
      console.info('AI provider response received', {
        provider: this.name,
        model,
        statusCode: response.status,
        promptLength,
        hasChoices: Boolean(payload.choices?.length),
        usage: usage ?? null,
      });

      const content = this.extractText(payload);

      if (content.length === 0) {
        throw new AiProviderError(
          'The AI provider returned an empty response. Please try again.',
          'MALFORMED_RESPONSE'
        );
      }

      return {
        content,
        model,
        ...(usage ? { usage } : {}),
      };
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('AI request timed out', {
          provider: this.name,
          model,
          timeoutMs: aiConfig.openRouter.timeoutMs,
          promptLength,
        });
        throw new AiProviderError(
          'The AI provider took too long to respond. Please try again.',
          'TIMEOUT',
          504
        );
      }

      console.error('AI request failed', {
        provider: this.name,
        model,
        promptLength,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new AiProviderError(
        'Failed to connect to the AI provider. Please try again.',
        'NETWORK_FAILURE',
        503
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractText(payload: OpenRouterResponse): string {
    const message = payload.choices?.[0]?.message;
    const text = message?.content;

    if (typeof text === 'string' && text.length > 0) {
      return text;
    }

    return '';
  }

  private mapUsage(usage?: OpenRouterUsage): AiUsage | undefined {
    if (!usage) return undefined;

    const promptTokens = usage.prompt_tokens;
    const completionTokens = usage.completion_tokens;
    const totalTokens = usage.total_tokens ?? (promptTokens ?? 0) + (completionTokens ?? 0);

    return {
      ...(promptTokens !== undefined ? { promptTokens } : {}),
      ...(completionTokens !== undefined ? { completionTokens } : {}),
      totalTokens,
    };
  }

  private async readErrorBody(response: Response): Promise<OpenRouterErrorResponse> {
    try {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as OpenRouterErrorResponse;
      }

      return {
        error: {
          message: (await response.text()).slice(0, 2000),
        },
      };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unable to read provider error body',
        },
      };
    }
  }

  private mapHttpError(status: number, errorBody: OpenRouterErrorResponse, model: string): AiProviderError {
    const message = errorBody.error?.message ?? 'Unknown error';

    console.error('OpenRouter HTTP error', {
      provider: this.name,
      model,
      statusCode: status,
      providerResponse: errorBody.error ?? null,
    });

    switch (status) {
      case 401:
        return new AiProviderError(
          'Invalid OpenRouter API key. Please check your credentials.',
          'INVALID_API_KEY',
          401
        );
      case 403:
        if (isQuotaOrLimitMessage(message)) {
          return new AiProviderError(
            `OpenRouter quota or limit reached (${status}): ${message}`,
            quotaOrLimitErrorCode(message),
            status
          );
        }
        return new AiProviderError(
          `OpenRouter rejected the request (${status}): ${message}`,
          'PROVIDER_ERROR',
          403
        );
      case 429:
        return new AiProviderError(
          `Rate limited by OpenRouter (${status}): ${message}`,
          'RATE_LIMIT',
          429
        );
      case 402:
        return new AiProviderError(
          'OpenRouter rejected the selected model or token budget for the available credits.',
          'PAYMENT_REQUIRED',
          402
        );
      case 400:
        if (message.toLowerCase().includes('not a valid model') || message.toLowerCase().includes('model_not_found')) {
          return new AiProviderError(
            `OpenRouter model invalid (${status}): ${message}`,
            'MODEL_UNAVAILABLE',
            503
          );
        }
        if (isQuotaOrLimitMessage(message)) {
          return new AiProviderError(
            `OpenRouter quota or limit reached (${status}): ${message}`,
            quotaOrLimitErrorCode(message),
            status
          );
        }
        return new AiProviderError(
          `OpenRouter error (${status}): ${message}`,
          'PROVIDER_ERROR',
          status
        );
      case 404:
      case 410:
        return new AiProviderError(
          `OpenRouter model unavailable (${status}): ${message}`,
          'MODEL_UNAVAILABLE',
          503
        );
      case 503:
        return new AiProviderError(
          'OpenRouter service is temporarily unavailable.',
          'PROVIDER_UNAVAILABLE',
          503
        );
      default:
        return new AiProviderError(
          `OpenRouter error (${status}): ${message}`,
          'PROVIDER_ERROR',
          status
        );
    }
  }

  private shouldTryFallback(error: AiProviderError, failedModel: string): boolean {
    const failedIndex = aiConfig.openRouter.modelCandidates.indexOf(failedModel);
    const hasLaterFallback = failedIndex >= 0 && failedIndex < aiConfig.openRouter.modelCandidates.length - 1;
    if (!hasLaterFallback) return false;

    return (
      error.code === 'TIMEOUT' ||
      error.code === 'RATE_LIMIT' ||
      error.code === 'PAYMENT_REQUIRED' ||
      error.code === 'MODEL_UNAVAILABLE' ||
      error.code === 'PROVIDER_UNAVAILABLE' ||
      error.code === 'NETWORK_FAILURE' ||
      error.code === 'PROVIDER_ERROR'
    );
  }
}

function statusToNumber(status: number): number {
  return Number.isFinite(status) ? status : 502;
}
