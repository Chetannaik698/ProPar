import { EmbeddingService } from './embeddings/embedding.service.js';
import { KnowledgeRepository } from './knowledge/knowledge.repository.js';
import { KnowledgeIndexer } from './knowledge/knowledge.indexer.js';
import { LocalVectorStore } from './vectorstore/local.vector.store.js';
import { RetrievalService } from './retrieval/retrieval.service.js';
import type { VectorStore } from './types/rag.types.js';

export * from './types/rag.types.js';
export * from './embeddings/embedding.service.js';
export * from './vectorstore/vector.store.interface.js';
export * from './vectorstore/local.vector.store.js';
export * from './vectorstore/chroma.vector.store.js';
export * from './knowledge/knowledge.repository.js';
export * from './knowledge/knowledge.indexer.js';
export * from './retrieval/retrieval.service.js';
export * from './prompt/prompt.augmentor.js';

export class RAGPipeline {
  public readonly embeddingService: EmbeddingService;
  public readonly repository: KnowledgeRepository;
  public readonly vectorStore: VectorStore;
  public readonly indexer: KnowledgeIndexer;
  public readonly retrievalService: RetrievalService;

  constructor(customVectorStore?: VectorStore) {
    this.embeddingService = new EmbeddingService();
    this.repository = new KnowledgeRepository();
    this.vectorStore = customVectorStore ?? new LocalVectorStore();
    this.indexer = new KnowledgeIndexer(this.repository, this.embeddingService, this.vectorStore);
    this.retrievalService = new RetrievalService(this.embeddingService, this.vectorStore, this.indexer);
  }
}

export const ragPipeline = new RAGPipeline();
