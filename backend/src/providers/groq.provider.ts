import { aiConfig } from '../config/ai.js';
import {
  AiProviderError,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
  type AiUsage,
} from './ai-provider.types.js';
import {
  isInvalidApiKeyMessage,
  isQuotaOrLimitMessage,
  quotaOrLimitErrorCode,
} from './provider-error.utils.js';

interface OpenAICompatibleResponse {
  id?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export class GroqProvider implements AiProvider {
  public readonly name = 'groq';
  public readonly model = aiConfig.groq.model;

  public async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const apiKey = aiConfig.groq.apiKey;
    if (!apiKey) {
      throw new AiProviderError(
        'Groq API key is missing. Add GROQ_API_KEY to backend .env file.',
        'INVALID_API_KEY',
        500
      );
    }

    let lastError: AiProviderError | null = null;

    for (const model of aiConfig.groq.modelCandidates) {
      try {
        return await this.completeWithModel(request, model, apiKey);
      } catch (error) {
        if (!(error instanceof AiProviderError)) throw error;
        lastError = error;

        if (error.code === 'RATE_LIMIT' || error.code === 'MODEL_UNAVAILABLE' || error.code === 'PROVIDER_UNAVAILABLE') {
          console.warn('Groq model attempt rate-limited or unavailable; trying next model candidate', {
            failedModel: model,
            errorCode: error.code,
            message: error.message,
          });
          continue;
        }
        throw error;
      }
    }

    throw lastError ?? new AiProviderError('Groq completion failed across all model candidates.', 'PROVIDER_ERROR');
  }

  private async completeWithModel(
    request: AiCompletionRequest,
    model: string,
    apiKey: string
  ): Promise<AiCompletionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), aiConfig.groq.timeoutMs);
    const promptLength = request.messages.reduce((total, msg) => total + msg.content.length, 0);

    try {
      console.info('Groq AI request started', {
        provider: this.name,
        model,
        promptLength,
        timeoutMs: aiConfig.groq.timeoutMs,
      });

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          max_tokens: aiConfig.groq.maxCompletionTokens,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = (await response.text()).slice(0, 2000);
        console.error('Groq HTTP error', {
          model,
          statusCode: response.status,
          errorText,
        });

        if (response.status === 401 || (response.status === 403 && isInvalidApiKeyMessage(errorText))) {
          throw new AiProviderError('Invalid Groq API key. Please check your credentials.', 'INVALID_API_KEY', 401);
        }
        if (response.status === 403 && isQuotaOrLimitMessage(errorText)) {
          throw new AiProviderError(
            `Groq quota or limit reached (${response.status}): ${errorText}`,
            quotaOrLimitErrorCode(errorText),
            response.status
          );
        }
        if (response.status === 404 || response.status === 410 || errorText.includes('model_not_found')) {
          throw new AiProviderError(`Groq model unavailable (${response.status}): ${errorText}`, 'MODEL_UNAVAILABLE', 503);
        }
        if (response.status === 429) {
          throw new AiProviderError(`Rate limited by Groq API (${response.status}): ${errorText}`, 'RATE_LIMIT', 429);
        }
        if (response.status >= 500) {
          throw new AiProviderError('Groq API service unavailable.', 'PROVIDER_UNAVAILABLE', 503);
        }

        throw new AiProviderError(`Groq error (${response.status}): ${errorText}`, 'PROVIDER_ERROR', response.status);
      }

      const payload = (await response.json()) as OpenAICompatibleResponse;
      const content = payload.choices?.[0]?.message?.content ?? '';

      if (!content || content.trim().length === 0) {
        throw new AiProviderError('Groq returned an empty response.', 'MALFORMED_RESPONSE');
      }

      const usage: AiUsage | undefined = payload.usage
        ? {
            ...(payload.usage.prompt_tokens !== undefined ? { promptTokens: payload.usage.prompt_tokens } : {}),
            ...(payload.usage.completion_tokens !== undefined ? { completionTokens: payload.usage.completion_tokens } : {}),
            totalTokens: payload.usage.total_tokens ?? (payload.usage.prompt_tokens ?? 0) + (payload.usage.completion_tokens ?? 0),
          }
        : undefined;

      console.info('Groq AI response received', {
        provider: this.name,
        model: this.model,
        contentLength: content.length,
        usage: usage ?? null,
      });

      return {
        content,
        model: this.model,
        ...(usage ? { usage } : {}),
      };
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Groq request timed out', { timeoutMs: aiConfig.groq.timeoutMs });
        throw new AiProviderError('Groq API request timed out.', 'TIMEOUT', 504);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown Groq error';
      console.error('Groq request failed', { error: errorMessage });
      throw new AiProviderError(`Groq connection failed: ${errorMessage}`, 'NETWORK_FAILURE', 503);
    } finally {
      clearTimeout(timeout);
    }
  }
}
