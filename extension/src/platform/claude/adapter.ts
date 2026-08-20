import { isVisibleElement, readElementText, replaceElementText, uniqueVisibleElements } from '../adapters/dom';
import type { ActivePlatformAdapter } from '../adapters/types';

const CLAUDE_COMPOSER_SELECTORS = [
  'div[contenteditable="true"]',
  '.ProseMirror',
  '[contenteditable="true"][role="textbox"]',
  '[contenteditable="true"]',
  'textarea',
] as const;

const SEND_BUTTON_SELECTORS = [
  'button[aria-label*="Send" i]',
  'button[aria-label*="send" i]',
  'button[aria-label*="Submit" i]',
  'button[aria-label*="prompt" i]',
  'button[aria-label*="Message" i]',
  'button[data-testid*="send" i]',
  'button[data-testid*="submit" i]',
  'button[type="submit"]',
  '[aria-label*="Send message" i]',
  '[aria-label*="Send prompt" i]',
  '[aria-label*="Send" i]',
  '[aria-label*="send" i]',
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

function isMicOrVoiceButton(button: HTMLElement): boolean {
  const label = (
    button.getAttribute('aria-label') ||
    button.getAttribute('title') ||
    button.getAttribute('data-testid') ||
    ''
  ).toLowerCase();
  const text = (button.textContent || '').toLowerCase();
  const html = button.innerHTML.toLowerCase();
  const nestedLabels = Array.from(button.querySelectorAll('[aria-label], title'))
    .map((el) => el.getAttribute('aria-label') || el.textContent || '')
    .join(' ')
    .toLowerCase();

  const combined = `${label} ${text} ${html} ${nestedLabels}`;

  return (
    combined.includes('mic') ||
    combined.includes('voice') ||
    combined.includes('audio') ||
    combined.includes('speech') ||
    combined.includes('dictat') ||
    combined.includes('record') ||
    combined.includes('transcrib') ||
    combined.includes('lucide-mic') ||
    combined.includes('m12 14') ||
    combined.includes('m12 2a3')
  );
}

function isModelOrAttachmentButton(button: HTMLElement): boolean {
  const label = (
    button.getAttribute('aria-label') ||
    button.getAttribute('title') ||
    button.getAttribute('data-testid') ||
    ''
  ).toLowerCase();
  const text = (button.textContent || '').toLowerCase();

  return (
    label.includes('model') ||
    label.includes('attach') ||
    text.includes('sonnet') ||
    text.includes('haiku') ||
    text.includes('opus') ||
    text.includes('claude')
  );
}

function pickBottomRightButton(buttons: HTMLElement[]): HTMLElement | null {
  const validButtons = buttons
    .filter(isVisibleElement)
    .filter((button) => !isMicOrVoiceButton(button) && !isModelOrAttachmentButton(button));

  if (validButtons.length === 0) return null;

  return (
    validButtons
      .map((button) => ({ button, rect: button.getBoundingClientRect() }))
      .sort((a, b) => b.rect.top - a.rect.top || b.rect.left - a.rect.left)[0]?.button ?? null
  );
}

function findComposerScope(composer: HTMLElement | null): HTMLElement | null {
  if (!composer?.isConnected) return null;

  const container = composer.closest<HTMLElement>('form, fieldset, [role="region"], main');
  if (container) {
    const buttons = collectButtons(container, SEND_BUTTON_SELECTORS);
    if (buttons.length > 0) return container;
  }

  let current = composer.parentElement;
  for (let depth = 0; current && depth < 10; depth += 1) {
    const buttons = collectButtons(current, SEND_BUTTON_SELECTORS);
    if (buttons.length > 0) return current;
    current = current.parentElement;
  }

  return composer.parentElement;
}

function findActionButton(composer: HTMLElement | null, selectors: readonly string[]): HTMLElement | null {
  if (!composer?.isConnected) return null;

  const scope = findComposerScope(composer);
  const scopedMatches = scope ? collectButtons(scope, selectors) : [];
  const documentMatches = scopedMatches.length > 0 ? [] : collectButtons(document.body, selectors);

  const matchedButton = pickBottomRightButton([...scopedMatches, ...documentMatches]);
  if (matchedButton) return matchedButton;

  if (scope) {
    const allScopeButtons = Array.from(scope.querySelectorAll<HTMLElement>('button, [role="button"]'));
    return pickBottomRightButton(allScopeButtons);
  }

  return null;
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
  getPrimaryActionButton(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    return findActionButton(composer, SEND_BUTTON_SELECTORS);
  },
  getSecondaryActionButton(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    const scope = findComposerScope(composer);
    if (!scope) return null;
    const allScopeButtons = Array.from(scope.querySelectorAll<HTMLElement>('button, [role="button"]'));
    return allScopeButtons.find(isMicOrVoiceButton) ?? null;
  },
  getAnchorElement(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    const secondary = this.getSecondaryActionButton(composer);
    if (secondary && secondary.isConnected && isVisibleElement(secondary)) {
      return secondary;
    }
    return this.getPrimaryActionButton(composer);
  },
  getComposerContainer(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    const anchor = this.getAnchorElement?.(composer);
    return anchor?.parentElement ?? composer.closest('form') ?? composer.parentElement;
  },
};
