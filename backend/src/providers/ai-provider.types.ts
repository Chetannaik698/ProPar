export interface AiMessage {
  role: 'system' | 'user';
  content: string;
}

export interface AiUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AiCompletionRequest {
  messages: AiMessage[];
}

export interface AiCompletionResult {
  content: string;
  model: string;
  usage?: AiUsage;
}

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}

export type AiProviderErrorCode =
  | 'RATE_LIMIT'
  | 'INVALID_API_KEY'
  | 'PAYMENT_REQUIRED'
  | 'NETWORK_FAILURE'
  | 'TIMEOUT'
  | 'MODEL_UNAVAILABLE'
  | 'MALFORMED_RESPONSE'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_ERROR';

export class AiProviderError extends Error {
  public readonly statusCode: number;
  public readonly code: AiProviderErrorCode;

  constructor(message: string, code: AiProviderErrorCode, statusCode = 502) {
    super(message);
    this.name = 'AiProviderError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
