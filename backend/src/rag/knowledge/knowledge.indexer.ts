import type { EmbeddingService } from '../embeddings/embedding.service.js';
import type { KnowledgeRepository } from './knowledge.repository.js';
import type { VectorStore } from '../types/rag.types.js';

export class KnowledgeIndexer {
  private isIndexed = false;

  constructor(
    private readonly repository: KnowledgeRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStore
  ) {}

  public async indexKnowledge(force = false): Promise<number> {
    if (this.isIndexed && !force) {
      return 0;
    }

    console.info('[KnowledgeIndexer] Indexing knowledge repository documents...');
    const documents = this.repository.loadAllDocuments();
    if (documents.length === 0) {
      console.info('[KnowledgeIndexer] No knowledge documents found to index.');
      this.isIndexed = true;
      return 0;
    }

    const embeddedDocs = [];
    for (const doc of documents) {
      const textToEmbed = `${doc.metadata.title || ''} ${doc.metadata.category || ''} ${doc.content}`;
      const embedding = await this.embeddingService.embedText(textToEmbed);
      embeddedDocs.push({
        ...doc,
        embedding,
      });
    }

    await this.vectorStore.addDocuments(embeddedDocs);
    this.isIndexed = true;

    console.info(`[KnowledgeIndexer] Successfully indexed ${embeddedDocs.length} knowledge documents into ${this.vectorStore.name}.`);
    return embeddedDocs.length;
  }
}
