import { isVisibleElement, readElementText, replaceElementText, uniqueVisibleElements } from '../adapters/dom';
import type { ActivePlatformAdapter } from '../adapters/types';

const CLAUDE_COMPOSER_SELECTORS = [
  'div[contenteditable="true"]',
  'textarea',
] as const;

const SEND_BUTTON_SELECTORS = [
  '[aria-label*="Send message" i]',
  '[aria-label*="Send prompt" i]',
  '[aria-label*="Send" i]',
  '[data-testid*="send" i]',
  'button[aria-label*="send" i]',
] as const;

function queryComposerCandidates(): HTMLElement[] {
  return uniqueVisibleElements(
    CLAUDE_COMPOSER_SELECTORS.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector))),
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

export const claudeAdapter: ActivePlatformAdapter = {
  id: 'claude',
  platformName: 'Claude',
  backendPlatform: 'claude',
  communicationStyle: 'Conversational assistant prompt with review-before-send composer behavior.',
  labels: {
    emptyTitle: 'Start typing in Claude.',
    emptyDescription: 'ProPaar will analyze your thinking before you send.',
    analyzeAction: 'Analyze prompt',
    analysisCompleteTitle: 'Your improved prompt is ready.',
    goalCaption: 'The real objective behind the prompt.',
    thinkingCaption: 'These assumptions may affect the quality of the response.',
    recommendationsCaption: 'The most useful next changes for this prompt.',
    whatChangedCaption: 'The most important upgrades added to the final prompt.',
    finalCardLabel: 'Final Prompt',
    finalCardCaption: 'A clearer version, ready to use.',
    replaceAction: 'Replace Prompt',
    replacedAction: 'Replaced',
    successToast: 'Prompt Improved Successfully',
  },
  matches: (location) => location.hostname === 'claude.ai' || location.hostname.endsWith('.claude.ai'),
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
