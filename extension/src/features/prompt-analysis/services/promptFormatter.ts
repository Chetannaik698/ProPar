export type FormattedPromptBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; title?: string; items: string[] }
  | { type: 'numbered'; title?: string; items: string[] };

export interface FormattedPrompt {
  blocks: FormattedPromptBlock[];
  text: string;
}

const LIST_MARKER_PATTERN = /^\s*(?:[-*]|(?:\d+[.)]))\s+/;
const HEADING_PATTERN = /^(?:#{1,6}\s+)?([A-Z][A-Za-z\s/&-]{2,60}):?$/;

function cleanText(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\u200B/g, '').trim();
}

function normalizeItem(item: string): string {
  return item
    .replace(LIST_MARKER_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function blockToText(block: FormattedPromptBlock): string {
  if (block.type === 'heading') return block.text;
  if (block.type === 'paragraph') return block.text;

  const marker = block.type === 'numbered'
    ? (item: string, index: number) => `${index + 1}. ${item}`
    : (item: string) => `- ${item}`;
  const listText = block.items.map(marker).join('\n');

  return block.title ? `${block.title}\n${listText}` : listText;
}

function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length > 80) return false;
  if (/^#{1,6}\s+/.test(trimmed)) return true;

  const match = trimmed.match(HEADING_PATTERN);
  if (!match) return false;

  const words = match[1].trim().split(/\s+/);
  return words.length <= 5 && !/[.!?]$/.test(trimmed);
}

function headingText(line: string): string {
  return line.replace(/^#{1,6}\s+/, '').replace(/:$/, '').trim();
}

function flushParagraph(lines: string[], blocks: FormattedPromptBlock[]): string[] {
  if (lines.length === 0) return [];
  blocks.push({ type: 'paragraph', text: lines.join(' ').replace(/\s+/g, ' ').trim() });
  return [];
}

function flushList(lines: string[], blocks: FormattedPromptBlock[]): string[] {
  if (lines.length === 0) return [];
  const firstIsNumbered = /^\s*\d+[.)]\s+/.test(lines[0] ?? '');
  blocks.push({
    type: firstIsNumbered ? 'numbered' : 'bullets',
    items: lines.map(normalizeItem).filter(Boolean),
  });
  return [];
}

function createBlocks(text: string): FormattedPromptBlock[] {
  const blocks: FormattedPromptBlock[] = [];
  let paragraphLines: string[] = [];
  let listLines: string[] = [];

  cleanText(text).split('\n').forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphLines = flushParagraph(paragraphLines, blocks);
      listLines = flushList(listLines, blocks);
      return;
    }

    if (isHeadingLine(trimmed)) {
      paragraphLines = flushParagraph(paragraphLines, blocks);
      listLines = flushList(listLines, blocks);
      blocks.push({ type: 'heading', text: headingText(trimmed) });
      return;
    }

    if (LIST_MARKER_PATTERN.test(trimmed)) {
      paragraphLines = flushParagraph(paragraphLines, blocks);
      listLines.push(trimmed);
      return;
    }

    listLines = flushList(listLines, blocks);
    paragraphLines.push(trimmed);
  });

  flushParagraph(paragraphLines, blocks);
  flushList(listLines, blocks);

  return blocks.length ? blocks : [{ type: 'paragraph', text }];
}

export function formatImprovedPrompt(prompt?: string): FormattedPrompt {
  const cleaned = cleanText(prompt ?? '');
  if (!cleaned) return { blocks: [{ type: 'paragraph', text: 'No improved prompt available.' }], text: '' };

  const blocks = createBlocks(cleaned);

  return {
    blocks,
    text: blocks.map(blockToText).join('\n\n'),
  };
}