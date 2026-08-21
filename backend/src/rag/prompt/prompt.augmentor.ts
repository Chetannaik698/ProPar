import type { VectorDocument } from '../types/rag.types.js';

export class PromptAugmentor {
  public static augmentSystemPrompt(originalSystemPrompt: string, documents: VectorDocument[]): string {
    if (!documents || documents.length === 0) {
      return originalSystemPrompt;
    }

    const knowledgeBlock = this.formatKnowledgeBlock(documents);

    return [
      'Relevant Knowledge:',
      'Use this knowledge only as background reference. If it recommends XML tags, prompt-pattern labels, or other internal formatting, apply the underlying principle but keep the user-facing improvedPrompt in clean professional Markdown/plain text unless the user explicitly asks for XML or HTML.',
      knowledgeBlock,
      '',
      originalSystemPrompt,
    ].join('\n');
  }

  public static formatKnowledgeBlock(documents: VectorDocument[]): string {
    return documents
      .map((doc, index) => {
        const title = doc.metadata.title ? `[${doc.metadata.title}]` : `[Knowledge Source ${index + 1}]`;
        return `${title}\n${doc.content.trim()}`;
      })
      .join('\n\n');
  }
}
