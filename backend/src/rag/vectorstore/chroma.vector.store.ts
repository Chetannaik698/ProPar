import type { VectorDocument, VectorSearchResult, VectorStore } from '../types/rag.types.js';

export class ChromaVectorStore implements VectorStore {
  public readonly name = 'ChromaVectorStore';

  constructor(
    private readonly collectionName: string = 'propar_knowledge',
    private readonly endpoint: string = 'http://localhost:8000'
  ) {}

  public async addDocuments(docs: VectorDocument[]): Promise<void> {
    console.info(`[ChromaVectorStore] Placeholder indexing ${docs.length} docs to ${this.collectionName} at ${this.endpoint}`);
  }

  public async search(
    _queryEmbedding: number[],
    _topK: number,
    _filter?: Record<string, unknown>
  ): Promise<VectorSearchResult[]> {
    console.info(`[ChromaVectorStore] Querying ${this.collectionName}`);
    return [];
  }

  public async clear(): Promise<void> {
    console.info(`[ChromaVectorStore] Cleared ${this.collectionName}`);
  }
}
