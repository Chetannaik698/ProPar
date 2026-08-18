import type { ActivePlatformAdapter } from '../adapters/types';
import { isVisibleElement, readElementText, replaceElementText, uniqueVisibleElements } from '../adapters/dom';

const GEMINI_COMPOSER_SELECTORS = [
  'rich-textarea [contenteditable="true"]',
  'rich-textarea [contenteditable]',
  'rich-textarea [role="textbox"]',
  '[contenteditable="true"][aria-label*="prompt" i]',
  '[contenteditable="true"][aria-label*="message" i]',
  '[contenteditable="true"][role="textbox"]',
  '.ql-editor[contenteditable="true"]',
  '.ql-editor[contenteditable]',
  'textarea[aria-label*="prompt" i]',
  'textarea[placeholder*="prompt" i]',
] as const;

const SEND_BUTTON_SELECTORS = [
  '[aria-label="Send message"]',
  '[aria-label*="send" i]',
  '[aria-label*="submit" i]',
  '[data-testid*="send" i]',
  '[title*="send" i]',
  'button.send-button',
] as const;

const MICROPHONE_BUTTON_SELECTORS = [
  '[aria-label*="microphone" i]',
  '[aria-label*="voice" i]',
  '[aria-label*="mic" i]',
  '[title*="microphone" i]',
  '[title*="voice" i]',
  '[title*="mic" i]',
] as const;

function isEditableComposer(element: HTMLElement): boolean {
  const contentEditable = element.getAttribute('contenteditable');
  const editable =
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLInputElement ||
    element.isContentEditable ||
    (contentEditable !== null && contentEditable !== 'false') ||
    element.getAttribute('role') === 'textbox';

  return editable && isVisibleElement(element);
}

function queryComposerCandidates(): HTMLElement[] {
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const matches = GEMINI_COMPOSER_SELECTORS.flatMap((selector) =>
    Array.from(document.querySelectorAll<HTMLElement>(selector)),
  );

  return uniqueVisibleElements(activeElement ? [activeElement, ...matches] : matches).filter(isEditableComposer);
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

function findComposerScope(composer: HTMLElement | null): HTMLElement | null {
  if (!composer?.isConnected) return null;

  const form = composer.closest<HTMLElement>('form');
  if (form) return form;

  let current = composer.parentElement;
  for (let depth = 0; current && depth < 8; depth += 1) {
    const hasActionButton =
      collectButtons(current, SEND_BUTTON_SELECTORS).length > 0 ||
      collectButtons(current, MICROPHONE_BUTTON_SELECTORS).length > 0;
    if (hasActionButton) return current;
    current = current.parentElement;
  }

  return composer.parentElement;
}

function findActionButton(composer: HTMLElement | null, selectors: readonly string[]): HTMLElement | null {
  const scope = findComposerScope(composer);
  const scopedMatches = scope ? collectButtons(scope, selectors) : [];
  const documentMatches = scopedMatches.length > 0 ? [] : collectButtons(document.body, selectors);

  return pickBottomRightButton([...scopedMatches, ...documentMatches]);
}

function findMicrophoneButton(composer: HTMLElement | null): HTMLElement | null {
  const scope = findComposerScope(composer);
  const scopedMatches = scope ? collectButtons(scope, MICROPHONE_BUTTON_SELECTORS) : [];
  const documentMatches = scopedMatches.length > 0 ? [] : collectButtons(document.body, MICROPHONE_BUTTON_SELECTORS);

  const buttons = [...scopedMatches, ...documentMatches].filter(isVisibleElement);
  if (buttons.length === 0) return null;

  // Sort by left coordinate ascending to pick the leftmost microphone icon
  return buttons
    .map((button) => ({ button, rect: button.getBoundingClientRect() }))
    .sort((a, b) => a.rect.left - b.rect.left)[0]?.button ?? null;
}

function readGeminiComposerText(element: HTMLElement): string {
  return readElementText(element).replace(/\u200B/g, '').trim();
}

export const geminiAdapter: ActivePlatformAdapter = {
  id: 'gemini',
  platformName: 'Gemini',
  backendPlatform: 'chatgpt',
  communicationStyle: 'Conversational assistant prompt with review-before-send composer behavior.',
  labels: {
    emptyTitle: 'Start typing in Gemini.',
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
  matches: (location) =>
    location.hostname === 'gemini.google.com' || location.hostname === 'gemini.googleusercontent.com',
  getComposerCandidates: queryComposerCandidates,
  readComposer(): string {
    for (const candidate of queryComposerCandidates()) {
      const prompt = readGeminiComposerText(candidate);
      if (prompt) return prompt;
    }

    return '';
  },
  replaceComposer(text: string): boolean {
    const candidates = queryComposerCandidates();
    const composer = candidates.find((candidate) => readGeminiComposerText(candidate).length > 0) ?? candidates[0];
    if (!composer) return false;

    return replaceElementText(composer, text);
  },
  getPrimaryActionButton: (composer) => findActionButton(composer, SEND_BUTTON_SELECTORS),
  getSecondaryActionButton: (composer) => findActionButton(composer, MICROPHONE_BUTTON_SELECTORS),
  getAnchorElement(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    const sendButton = findActionButton(composer, SEND_BUTTON_SELECTORS);
    if (sendButton && isVisibleElement(sendButton)) {
      return sendButton;
    }
    const voiceButton = findMicrophoneButton(composer);
    if (voiceButton && isVisibleElement(voiceButton)) {
      return voiceButton;
    }
    return null;
  },
  getComposerContainer(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    const anchor = this.getAnchorElement?.(composer);
    return anchor?.parentElement ?? findComposerScope(composer) ?? composer.parentElement;
  },
};
