import { aiConfig } from '../config/ai.js';
import {
  AiProviderError,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiMessage,
  type AiProvider,
  type AiUsage,
} from './ai-provider.types.js';
import {
  isInvalidApiKeyMessage,
  isQuotaOrLimitMessage,
  quotaOrLimitErrorCode,
} from './provider-error.utils.js';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: {
    message?: string;
    status?: string;
    code?: number;
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

    let lastError: AiProviderError | null = null;

    for (const model of aiConfig.gemini.modelCandidates) {
      try {
        return await this.completeWithModel(request, model, apiKey);
      } catch (error) {
        if (!(error instanceof AiProviderError)) throw error;
        lastError = error;

        if (error.code === 'RATE_LIMIT' || error.code === 'MODEL_UNAVAILABLE' || error.code === 'PROVIDER_UNAVAILABLE') {
          console.warn('Gemini model attempt rate-limited or unavailable; trying next model candidate', {
            failedModel: model,
            errorCode: error.code,
            message: error.message,
          });
          continue;
        }
        throw error;
      }
    }

    throw lastError ?? new AiProviderError('Gemini completion failed across all model candidates.', 'PROVIDER_ERROR');
  }

  private async completeWithModel(
    request: AiCompletionRequest,
    model: string,
    apiKey: string
  ): Promise<AiCompletionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), aiConfig.gemini.timeoutMs);
    const promptLength = request.messages.reduce((total, msg) => total + msg.content.length, 0);

    try {
      console.info('Gemini AI request started', {
        provider: this.name,
        model,
        promptLength,
        timeoutMs: aiConfig.gemini.timeoutMs,
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(this.buildGenerateContentBody(request.messages)),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorText = (await response.text()).slice(0, 2000);
        console.error('Gemini HTTP error', {
          model,
          statusCode: response.status,
          errorText,
        });

        if (response.status === 400 && (errorText.includes('not found') || errorText.includes('NOT_FOUND'))) {
          throw new AiProviderError(`Google Gemini model unavailable (${response.status}): ${errorText}`, 'MODEL_UNAVAILABLE', 503);
        }
        if (response.status === 401 || (response.status === 403 && isInvalidApiKeyMessage(errorText))) {
          throw new AiProviderError('Invalid Gemini API key. Please check your credentials.', 'INVALID_API_KEY', 401);
        }
        if (response.status === 403 && isQuotaOrLimitMessage(errorText)) {
          throw new AiProviderError(
            `Gemini quota or limit reached (${response.status}): ${errorText}`,
            quotaOrLimitErrorCode(errorText),
            response.status
          );
        }
        if (response.status === 404 || response.status === 410 || errorText.includes('NOT_FOUND')) {
          throw new AiProviderError(`Google Gemini model unavailable (${response.status}): ${errorText}`, 'MODEL_UNAVAILABLE', 503);
        }
        if (response.status === 429) {
          throw new AiProviderError(`Rate limited by Google Gemini API (${response.status}): ${errorText}`, 'RATE_LIMIT', 429);
        }
        if (response.status >= 500) {
          throw new AiProviderError('Google Gemini API service unavailable.', 'PROVIDER_UNAVAILABLE', 503);
        }

        throw new AiProviderError(`Gemini error (${response.status}): ${errorText}`, 'PROVIDER_ERROR', response.status);
      }

      const payload = (await response.json()) as GeminiGenerateContentResponse;
      const content = this.extractText(payload);

      if (!content || content.trim().length === 0) {
        throw new AiProviderError('Gemini returned an empty response.', 'MALFORMED_RESPONSE');
      }

      const usage = this.mapUsage(payload.usageMetadata);

      console.info('Gemini AI response received', {
        provider: this.name,
        model,
        contentLength: content.length,
        usage: usage ?? null,
      });

      return {
        content,
        model,
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

  private buildGenerateContentBody(messages: AiMessage[]): Record<string, unknown> {
    const systemInstruction = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n');

    const userMessages = messages.filter((message) => message.role === 'user');
    const contents = userMessages.map((message) => ({
      role: 'user',
      parts: [{ text: message.content }],
    }));

    return {
      ...(systemInstruction
        ? {
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
          }
        : {}),
      contents,
      generationConfig: {
        maxOutputTokens: aiConfig.gemini.maxCompletionTokens,
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };
  }

  private extractText(payload: GeminiGenerateContentResponse): string {
    return payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() ?? '';
  }

  private mapUsage(usage?: GeminiGenerateContentResponse['usageMetadata']): AiUsage | undefined {
    if (!usage) return undefined;

    const promptTokens = usage.promptTokenCount;
    const completionTokens = usage.candidatesTokenCount;
    const totalTokens = usage.totalTokenCount ?? (promptTokens ?? 0) + (completionTokens ?? 0);

    return {
      ...(promptTokens !== undefined ? { promptTokens } : {}),
      ...(completionTokens !== undefined ? { completionTokens } : {}),
      totalTokens,
    };
  }
}
