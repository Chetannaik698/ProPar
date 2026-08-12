import { createHash } from 'node:crypto';
import type { EmbeddingProvider } from '../types/rag.types.js';

export class LocalEmbeddingProvider implements EmbeddingProvider {
  public readonly name = 'LocalTFIDFEmbeddingProvider';
  private readonly dimension = 128;

  public async embedText(text: string): Promise<number[]> {
    const tokens = this.tokenize(text);
    const vector = new Array<number>(this.dimension).fill(0);

    if (tokens.length === 0) {
      return vector;
    }

    for (const token of tokens) {
      const hash = this.hashToken(token);
      const index = Math.abs(hash) % this.dimension;
      const sign = hash >= 0 ? 1 : -1;
      vector[index] = (vector[index] ?? 0) + sign;
    }

    // Also extract word 2-grams for semantic context matching
    for (let i = 0; i < tokens.length - 1; i += 1) {
      const bigram = `${tokens[i]!}_${tokens[i + 1]!}`;
      const hash = this.hashToken(bigram);
      const index = Math.abs(hash) % this.dimension;
      const sign = hash >= 0 ? 1 : -1;
      vector[index] = (vector[index] ?? 0) + sign * 1.5;
    }

    // Normalize vector (L2 norm)
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i += 1) {
        vector[i] = (vector[i] ?? 0) / norm;
      }
    }

    return vector;
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embedText(t)));
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 1);
  }

  private hashToken(token: string): number {
    let hash = 0;
    for (let i = 0; i < token.length; i += 1) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

export class EmbeddingService {
  private provider: EmbeddingProvider;
  private cache = new Map<string, number[]>();

  constructor(provider?: EmbeddingProvider) {
    this.provider = provider ?? new LocalEmbeddingProvider();
  }

  public setProvider(provider: EmbeddingProvider): void {
    this.provider = provider;
    this.cache.clear();
  }

  public async embedText(text: string): Promise<number[]> {
    const key = this.hashKey(text);
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const embedding = await this.provider.embedText(text);
    this.cache.set(key, embedding);
    return embedding;
  }

  public async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embedText(t)));
  }

  private hashKey(text: string): string {
    return createHash('md5').update(text.trim()).digest('hex');
  }
}
