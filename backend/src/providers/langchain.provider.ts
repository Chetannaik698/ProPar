import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { aiConfig } from '../config/ai.js';
import {
  AiProviderError,
  type AiCompletionRequest,
  type AiCompletionResult,
  type AiProvider,
  type AiUsage,
} from './ai-provider.types.js';

export class LangChainProvider implements AiProvider {
  public readonly name = 'openrouter';
  public readonly model = aiConfig.openRouter.model;

  public async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const apiKey = aiConfig.openRouter.apiKey;
    if (!apiKey) {
      throw new AiProviderError(
        'OpenRouter API key is missing. Add OPENROUTER_API_KEY to the backend .env file.',
        'INVALID_API_KEY',
        500
      );
    }

    const messages: BaseMessage[] = request.messages.map((msg) => {
      if (msg.role === 'system') {
        return new SystemMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    });

    const candidates = aiConfig.openRouter.modelCandidates;
    if (candidates.length === 0) {
      throw new AiProviderError('No model candidates configured.', 'PROVIDER_ERROR');
    }

    const createChatModel = (modelName: string) =>
      new ChatOpenAI({
        modelName,
        openAIApiKey: apiKey,
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            'HTTP-Referer': 'https://propaar.netlify.app',
            'X-Title': 'ProPaar',
          },
        },
        temperature: 0.2,
        maxTokens: aiConfig.openRouter.maxCompletionTokens,
        timeout: aiConfig.openRouter.timeoutMs,
        modelKwargs: {
          response_format: { type: 'json_object' },
        },
      });

    const primaryModel = createChatModel(candidates[0]);
    const fallbackModels = candidates.slice(1).map((m) => createChatModel(m));

    const runner = fallbackModels.length > 0
      ? primaryModel.withFallbacks(fallbackModels)
      : primaryModel;

    try {
      console.info('LangChain AI request started', {
        provider: this.name,
        primaryModel: candidates[0],
        fallbackCandidates: candidates.slice(1),
        messageCount: messages.length,
      });

      const response = await runner.invoke(messages);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      if (!content || content.trim().length === 0) {
        throw new AiProviderError(
          'The AI provider returned an empty response. Please try again.',
          'MALFORMED_RESPONSE'
        );
      }

      // Extract usage metadata if available from LangChain
      const usageMetadata = response.usage_metadata;
      const usage: AiUsage | undefined = usageMetadata
        ? {
            promptTokens: usageMetadata.input_tokens,
            completionTokens: usageMetadata.output_tokens,
            totalTokens: usageMetadata.total_tokens,
          }
        : undefined;

      // Extract used model name from response metadata or default to primary
      const responseMetadata = response.response_metadata;
      const usedModel =
        (responseMetadata?.['model_name'] as string | undefined) ||
        (responseMetadata?.['model'] as string | undefined) ||
        this.model;

      console.info('LangChain AI response received', {
        provider: this.name,
        model: usedModel,
        contentLength: content.length,
        usage: usage ?? null,
      });

      return {
        content,
        model: usedModel,
        ...(usage ? { usage } : {}),
      };
    } catch (error) {
      if (error instanceof AiProviderError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown LangChain error';
      console.error('LangChain completion failed', {
        provider: this.name,
        error: errorMessage,
      });

      if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('aborted')) {
        throw new AiProviderError('AI provider request timed out.', 'TIMEOUT', 504);
      }

      if (errorMessage.toLowerCase().includes('401') || errorMessage.toLowerCase().includes('api key')) {
        throw new AiProviderError('Invalid OpenRouter API key.', 'INVALID_API_KEY', 500);
      }

      if (errorMessage.toLowerCase().includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
        throw new AiProviderError('Rate limited by AI provider. Please try again later.', 'RATE_LIMIT', 429);
      }

      throw new AiProviderError(
        `LangChain provider execution failed: ${errorMessage}`,
        'PROVIDER_ERROR'
      );
    }
  }
}
