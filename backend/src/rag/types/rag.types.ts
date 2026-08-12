export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    title?: string;
    platform?: string;
    category?: string;
    tags?: string[];
    source?: string;
    [key: string]: unknown;
  };
  embedding?: number[];
}

export interface VectorSearchResult {
  document: VectorDocument;
  score: number;
}

export interface RetrievalOptions {
  prompt: string;
  platform: string;
  intent?: string;
  topK?: number;
  minScore?: number;
  clarificationAnswers?: Array<{ questionId: string; answer: string }>;
}

export interface EmbeddingProvider {
  name: string;
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface VectorStore {
  name: string;
  addDocuments(docs: VectorDocument[]): Promise<void>;
  search(queryEmbedding: number[], topK: number, filter?: Record<string, unknown>): Promise<VectorSearchResult[]>;
  clear(): Promise<void>;
}
