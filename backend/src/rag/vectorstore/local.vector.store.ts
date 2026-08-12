import type { VectorDocument, VectorSearchResult, VectorStore } from '../types/rag.types.js';

export class LocalVectorStore implements VectorStore {
  public readonly name = 'LocalVectorStore';
  private documents: VectorDocument[] = [];

  public async addDocuments(docs: VectorDocument[]): Promise<void> {
    for (const doc of docs) {
      const existingIndex = this.documents.findIndex((d) => d.id === doc.id);
      if (existingIndex >= 0) {
        this.documents[existingIndex] = doc;
      } else {
        this.documents.push(doc);
      }
    }
  }

  public async search(
    queryEmbedding: number[],
    topK: number,
    filter?: Record<string, unknown>
  ): Promise<VectorSearchResult[]> {
    const matches: VectorSearchResult[] = [];

    for (const doc of this.documents) {
      if (!doc.embedding) continue;

      if (filter && !this.matchesFilter(doc.metadata, filter)) {
        continue;
      }

      const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
      matches.push({ document: doc, score });
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, topK);
  }

  public async clear(): Promise<void> {
    this.documents = [];
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i += 1) {
      const a = vecA[i] ?? 0;
      const b = vecB[i] ?? 0;
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private matchesFilter(metadata: Record<string, unknown>, filter: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined || value === null) continue;

      const metaValue = metadata[key];
      if (Array.isArray(value)) {
        if (!value.includes(metaValue)) return false;
      } else if (metaValue !== value) {
        return false;
      }
    }
    return true;
  }
}
