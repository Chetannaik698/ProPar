import { aiConfig } from '../config/ai.js';
import {
  AiProviderError,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
  type AiUsage,
} from './ai-provider.types.js';

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

export class GeminiProvider implements AiProvider {
  public readonly name = 'gemini';
  public readonly model = aiConfig.gemini.model;

  public async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const apiKey = aiConfig.gemini.apiKey;
    if (!apiKey) {
      throw new AiProviderError(
        'Gemini API key is missing. Add GEMINI_API_KEY to backend .env file.',
        'INVALID_API_KEY',
        500
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), aiConfig.gemini.timeoutMs);
    const promptLength = request.messages.reduce((total, msg) => total + msg.content.length, 0);

    try {
      console.info('Gemini AI request started', {
        provider: this.name,
        model: this.model,
        promptLength,
        timeoutMs: aiConfig.gemini.timeoutMs,
      });

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: request.messages,
          max_tokens: aiConfig.gemini.maxCompletionTokens,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = (await response.text()).slice(0, 2000);
        console.error('Gemini HTTP error', {
          statusCode: response.status,
          errorText,
        });

        if (response.status === 401 || response.status === 403) {
          throw new AiProviderError('Invalid Gemini API key. Please check your credentials.', 'INVALID_API_KEY', 401);
        }
        if (response.status === 404 || response.status === 410 || errorText.includes('NOT_FOUND')) {
          throw new AiProviderError(`Google Gemini model unavailable (${response.status}): ${errorText}`, 'MODEL_UNAVAILABLE', 503);
        }
        if (response.status === 429) {
          throw new AiProviderError('Rate limited by Google Gemini API. Falling back...', 'RATE_LIMIT', 429);
        }
        if (response.status >= 500) {
          throw new AiProviderError('Google Gemini API service unavailable.', 'PROVIDER_UNAVAILABLE', 503);
        }

        throw new AiProviderError(`Gemini error (${response.status}): ${errorText}`, 'PROVIDER_ERROR', response.status);
      }

      const payload = (await response.json()) as OpenAICompatibleResponse;
      const content = payload.choices?.[0]?.message?.content ?? '';

      if (!content || content.trim().length === 0) {
        throw new AiProviderError('Gemini returned an empty response.', 'MALFORMED_RESPONSE');
      }

      const usage: AiUsage | undefined = payload.usage
        ? {
            ...(payload.usage.prompt_tokens !== undefined ? { promptTokens: payload.usage.prompt_tokens } : {}),
            ...(payload.usage.completion_tokens !== undefined ? { completionTokens: payload.usage.completion_tokens } : {}),
            totalTokens: payload.usage.total_tokens ?? (payload.usage.prompt_tokens ?? 0) + (payload.usage.completion_tokens ?? 0),
          }
        : undefined;

      console.info('Gemini AI response received', {
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
        console.error('Gemini request timed out', { timeoutMs: aiConfig.gemini.timeoutMs });
        throw new AiProviderError('Gemini API request timed out.', 'TIMEOUT', 504);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini error';
      console.error('Gemini request failed', { error: errorMessage });
      throw new AiProviderError(`Gemini connection failed: ${errorMessage}`, 'NETWORK_FAILURE', 503);
    } finally {
      clearTimeout(timeout);
    }
  }
}
