import type { EmbeddingService } from '../embeddings/embedding.service.js';
import type { KnowledgeIndexer } from '../knowledge/knowledge.indexer.js';
import type { RetrievalOptions, VectorDocument, VectorSearchResult, VectorStore } from '../types/rag.types.js';

const PLATFORM_KEYS = new Set(['chatgpt', 'claude', 'gemini', 'gmail', 'linkedin']);

interface RankedResult {
  document: VectorDocument;
  score: number;
}

export class RetrievalService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStore,
    private readonly indexer: KnowledgeIndexer
  ) {}

  public async retrieve(options: RetrievalOptions): Promise<VectorDocument[]> {
    const { prompt, platform, intent, topK = 3, clarificationAnswers } = options;
    const platformKey = platform.toLowerCase();

    // Ensure knowledge is indexed
    await this.indexer.indexKnowledge();

    // Construct augmented search query text combining prompt, intent, platform, and clarification answers
    const searchContextParts = [`Platform: ${platform}`];
    if (intent) {
      searchContextParts.push(`Intent: ${intent}`);
    }
    searchContextParts.push(`User Prompt: ${prompt}`);

    if (clarificationAnswers && clarificationAnswers.length > 0) {
      const answersText = clarificationAnswers.map((a) => a.answer).join(' ');
      searchContextParts.push(`Clarification Context: ${answersText}`);
    }

    const searchQuery = searchContextParts.join('\n');
    const queryEmbedding = await this.embeddingService.embedText(searchQuery);

    // Search for documents specific to active platform, general documents, and top global matches
    const platformResults = await this.vectorStore.search(queryEmbedding, topK, { platform: platformKey });
    const generalResults = await this.vectorStore.search(queryEmbedding, topK, { platform: 'general' });
    const globalResults = await this.vectorStore.search(queryEmbedding, topK * 3);

    // Combine and sort by weighted similarity. Platform and general docs get priority so
    // provider-specific knowledge from another platform does not hijack the prompt contract.
    const combinedResults = [
      ...this.weightResults(platformResults, 0.25),
      ...this.weightResults(generalResults, 0.15),
      ...this.weightResults(
        globalResults.filter((result) => this.isCompatibleDocument(result.document, platformKey)),
        0
      ),
    ];
    combinedResults.sort((a, b) => b.score - a.score);

    // Deduplicate by document id
    const seenIds = new Set<string>();
    const uniqueDocs: VectorDocument[] = [];

    for (const result of combinedResults) {
      if (!seenIds.has(result.document.id)) {
        seenIds.add(result.document.id);
        uniqueDocs.push(result.document);
      }
      if (uniqueDocs.length >= topK) break;
    }

    console.info('[RetrievalService] Retrieved relevant documents', {
      platform,
      queryLength: searchQuery.length,
      retrievedCount: uniqueDocs.length,
      titles: uniqueDocs.map((d) => d.metadata.title),
    });

    return uniqueDocs;
  }

  private weightResults(results: VectorSearchResult[], scoreBonus: number): RankedResult[] {
    return results.map((result) => ({
      document: result.document,
      score: result.score + scoreBonus,
    }));
  }

  private isCompatibleDocument(document: VectorDocument, platformKey: string): boolean {
    const docPlatform = String(document.metadata.platform ?? 'general').toLowerCase();
    return docPlatform === platformKey || docPlatform === 'general' || !PLATFORM_KEYS.has(docPlatform);
  }
}
