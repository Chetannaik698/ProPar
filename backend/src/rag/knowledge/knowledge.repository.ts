import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { VectorDocument } from '../types/rag.types.js';

export interface RawKnowledgeItem {
  id: string;
  title: string;
  platform: string;
  category: string;
  tags: string[];
  content: string;
  filePath: string;
}

export class KnowledgeRepository {
  private readonly knowledgeDir: string;

  constructor(customPath?: string) {
    if (customPath) {
      this.knowledgeDir = resolve(customPath);
    } else {
      // Default to root knowledge/ or backend/knowledge/
      const cwd = process.cwd();
      const relativeBackend = join(cwd, 'knowledge');
      const relativeRoot = join(cwd, '..', 'knowledge');

      if (existsSync(relativeBackend)) {
        this.knowledgeDir = relativeBackend;
      } else if (existsSync(relativeRoot)) {
        this.knowledgeDir = relativeRoot;
      } else {
        this.knowledgeDir = relativeBackend;
      }
    }
  }

  public loadAllDocuments(): VectorDocument[] {
    if (!existsSync(this.knowledgeDir)) {
      console.warn(`[KnowledgeRepository] Knowledge directory does not exist: ${this.knowledgeDir}`);
      return [];
    }

    const items = this.scanDirectory(this.knowledgeDir);
    return items.map((item) => ({
      id: item.id,
      content: item.content,
      metadata: {
        title: item.title,
        platform: item.platform,
        category: item.category,
        tags: item.tags,
        source: item.filePath,
      },
    }));
  }

  private scanDirectory(dirPath: string): RawKnowledgeItem[] {
    const results: RawKnowledgeItem[] = [];
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        results.push(...this.scanDirectory(fullPath));
      } else if (stat.isFile() && (entry.endsWith('.md') || entry.endsWith('.json'))) {
        const item = this.parseFile(fullPath);
        if (item) {
          results.push(item);
        }
      }
    }

    return results;
  }

  private parseFile(filePath: string): RawKnowledgeItem | null {
    try {
      const text = readFileSync(filePath, 'utf-8');
      if (filePath.endsWith('.json')) {
        const json = JSON.parse(text) as Record<string, unknown>;
        return {
          id: String(json['id'] ?? filePath),
          title: String(json['title'] ?? 'Untitled Knowledge'),
          platform: String(json['platform'] ?? 'general'),
          category: String(json['category'] ?? 'general'),
          tags: Array.isArray(json['tags']) ? (json['tags'] as unknown[]).map(String) : [],
          content: String(json['content'] ?? text),
          filePath,
        };
      }

      // Parse Markdown Frontmatter
      const { metadata, content } = this.parseMarkdownFrontmatter(text);
      const platformFromPath = this.inferPlatformFromPath(filePath);

      return {
        id: filePath,
        title: String(metadata['title'] ?? 'Untitled Knowledge'),
        platform: String(metadata['platform'] ?? platformFromPath),
        category: String(metadata['category'] ?? 'general'),
        tags: Array.isArray(metadata['tags']) ? (metadata['tags'] as unknown[]).map(String) : [],
        content: content.trim(),
        filePath,
      };
    } catch (err) {
      console.error(`[KnowledgeRepository] Error parsing knowledge file ${filePath}:`, err);
      return null;
    }
  }

  private parseMarkdownFrontmatter(rawText: string): { metadata: Record<string, unknown>; content: string } {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = rawText.match(frontmatterRegex);

    if (!match) {
      return { metadata: {}, content: rawText };
    }

    const yamlBlock = match[1] ?? '';
    const content = match[2] ?? rawText;
    const metadata: Record<string, unknown> = {};

    for (const line of yamlBlock.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.slice(0, colonIndex).trim();
      let value = trimmed.slice(colonIndex + 1).trim();

      // Handle arrays like [a, b, c]
      if (value.startsWith('[') && value.endsWith(']')) {
        const items = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter(Boolean);
        metadata[key] = items;
      } else {
        value = value.replace(/^['"]|['"]$/g, '');
        metadata[key] = value;
      }
    }

    return { metadata, content };
  }

  private inferPlatformFromPath(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/').toLowerCase();
    if (normalized.includes('/chatgpt/')) return 'chatgpt';
    if (normalized.includes('/gemini/')) return 'gemini';
    if (normalized.includes('/claude/')) return 'claude';
    if (normalized.includes('/gmail/')) return 'gmail';
    if (normalized.includes('/linkedin/')) return 'linkedin';
    return 'general';
  }
}
