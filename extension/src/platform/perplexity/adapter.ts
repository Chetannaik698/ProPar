import { isVisibleElement, readElementText, replaceElementText, uniqueVisibleElements } from '../adapters/dom';
import type { ActivePlatformAdapter } from '../adapters/types';

const PERPLEXITY_COMPOSER_SELECTORS = [
  'textarea[placeholder*="Ask anything" i]',
  'textarea[placeholder*="Ask" i]',
  'textarea',
  'div[contenteditable="true"]',
] as const;

const SEND_BUTTON_SELECTORS = [
  'button[aria-label*="Submit" i]',
  'button[aria-label*="Send" i]',
  'button[aria-label*="Ask" i]',
  'button[type="submit"]',
  'button[class*="super" i]',
] as const;

function queryComposerCandidates(): HTMLElement[] {
  return uniqueVisibleElements(
    PERPLEXITY_COMPOSER_SELECTORS.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector))),
  );
}

function collectButtons(scope: ParentNode, selectors: readonly string[]): HTMLElement[] {
  return uniqueVisibleElements(
    selectors.flatMap((selector) => Array.from(scope.querySelectorAll<HTMLElement>(selector))),
  );
}

function pickBottomRightButton(buttons: HTMLElement[]): HTMLElement | null {
  return buttons
    .filter(isVisibleElement)
    .map((button) => ({ button, rect: button.getBoundingClientRect() }))
    .sort((a, b) => b.rect.top - a.rect.top || b.rect.left - a.rect.left)[0]?.button ?? null;
}

function findActionButton(composer: HTMLElement | null, selectors: readonly string[]): HTMLElement | null {
  if (!composer?.isConnected) return null;

  const form = composer.closest('form') || composer.parentElement;
  const scopedMatches = form ? collectButtons(form, selectors) : [];
  const documentMatches = scopedMatches.length > 0 ? [] : collectButtons(document.body, selectors);

  return pickBottomRightButton([...scopedMatches, ...documentMatches]);
}

export const perplexityAdapter: ActivePlatformAdapter = {
  id: 'perplexity',
  platformName: 'Perplexity',
  backendPlatform: 'chatgpt',
  communicationStyle: 'Deep search & reasoning prompt review before sending.',
  labels: {
    emptyTitle: 'Start typing in Perplexity.',
    emptyDescription: 'ProPar will analyze your query and context before you submit.',
    analyzeAction: 'Analyze search',
    analysisCompleteTitle: 'Your refined search prompt is ready.',
    goalCaption: 'The core information need behind your query.',
    thinkingCaption: 'These assumptions may impact search depth and accuracy.',
    recommendationsCaption: 'Recommended details to improve search results.',
    whatChangedCaption: 'Key improvements added to your search prompt.',
    finalCardLabel: 'Final Query',
    finalCardCaption: 'A precise, high-yield search prompt ready to submit.',
    replaceAction: 'Replace Search',
    replacedAction: 'Replaced',
    successToast: 'Search Query Improved Successfully',
  },
  matches: (location) => location.hostname === 'perplexity.ai' || location.hostname.endsWith('.perplexity.ai'),
  getComposerCandidates: queryComposerCandidates,
  readComposer(): string {
    for (const candidate of queryComposerCandidates()) {
      const prompt = readElementText(candidate).replace(/\u200B/g, '').trim();
      if (prompt) return prompt;
    }

    return '';
  },
  replaceComposer(text: string): boolean {
    const candidates = queryComposerCandidates();
    const composer = candidates.find((candidate) => readElementText(candidate).trim().length > 0) ?? candidates[0];
    if (!composer) return false;

    return replaceElementText(composer, text);
  },
  getPrimaryActionButton: (composer) => findActionButton(composer, SEND_BUTTON_SELECTORS),
  getAnchorElement(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    return findActionButton(composer, SEND_BUTTON_SELECTORS);
  },
  getComposerContainer(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    const anchor = this.getAnchorElement?.(composer);
    return anchor?.parentElement ?? composer.closest('form') ?? composer.parentElement;
  },
};
