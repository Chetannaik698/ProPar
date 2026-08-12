import type { ActivePlatformAdapter } from '../adapters/types';
import { isVisibleElement, readElementText, replaceElementText, uniqueVisibleElements } from '../adapters/dom';

export const CHATGPT_COMPOSER_SELECTORS = [
  '#prompt-textarea',
  '[data-testid="composer-text-input"]',
  'textarea[placeholder*="Message"]',
  'div[contenteditable="true"][data-virtualkeyboard="true"]',
  '[contenteditable="true"][role="textbox"]',
  '.ProseMirror[contenteditable="true"]',
] as const;

const SEND_BUTTON_SELECTORS = [
  '[data-testid="send-button"]',
  '[data-testid*="send"]',
  '[aria-label="Send prompt"]',
  '[aria-label="Send message"]',
  '[aria-label*="send"]',
] as const;

const MICROPHONE_BUTTON_SELECTORS = [
  '[data-testid="microphone-button"]',
  '[data-testid*="microphone"]',
  '[data-testid*="voice"]',
  '[aria-label="Voice input"]',
  '[aria-label="Microphone"]',
  '[aria-label="Use your voice"]',
  '[aria-label*="microphone"]',
  '[aria-label*="voice"]',
  '[aria-label*="Voice"]',
] as const;

function queryComposerCandidates(): HTMLElement[] {
  return uniqueVisibleElements(
    CHATGPT_COMPOSER_SELECTORS.flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector))),
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

  const form = composer.closest('form');
  const scopedMatches = collectButtons(form ?? composer, selectors);
  const documentMatches = scopedMatches.length > 0 ? [] : collectButtons(document.body, selectors);

  return pickBottomRightButton([...scopedMatches, ...documentMatches]);
}

export const chatGptAdapter: ActivePlatformAdapter = {
  id: 'chatgpt',
  platformName: 'ChatGPT',
  backendPlatform: 'chatgpt',
  communicationStyle: 'Conversational assistant prompt with review-before-send composer behavior.',
  labels: {
    emptyTitle: 'Start typing in ChatGPT.',
    emptyDescription: 'ProPar will analyze your thinking before you send.',
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
  matches: (location) => location.hostname === 'chatgpt.com' || location.hostname.endsWith('.chatgpt.com'),
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
  getSecondaryActionButton: (composer) => findActionButton(composer, MICROPHONE_BUTTON_SELECTORS),
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


