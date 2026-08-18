import type { ActivePlatformAdapter } from '../adapters/types';
import { isVisibleElement, readElementText, replaceElementText, uniqueVisibleElements } from '../adapters/dom';

const GMAIL_COMPOSER_SELECTORS = [
  'div[aria-label="Message Body"][contenteditable="true"]',
  'div[role="textbox"][contenteditable="true"][aria-label*="Message Body"]',
  'div[role="textbox"][contenteditable="true"]',
] as const;

const SEND_BUTTON_SELECTORS = [
  'div[role="button"][data-tooltip*="Send"]',
  'div[role="button"][aria-label*="Send"]',
  'div.aoO',
  '.aoO',
] as const;

function isEditableComposer(element: HTMLElement): boolean {
  const contentEditable = element.getAttribute('contenteditable');
  return (
    element.isContentEditable ||
    (contentEditable !== null && contentEditable !== 'false') ||
    element.getAttribute('role') === 'textbox'
  );
}

function queryComposerCandidates(): HTMLElement[] {
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const matches = GMAIL_COMPOSER_SELECTORS.flatMap((selector) => {
    try {
      return Array.from(document.querySelectorAll<HTMLElement>(selector));
    } catch {
      return [];
    }
  });

  const candidates = uniqueVisibleElements(activeElement ? [activeElement, ...matches] : matches).filter(isEditableComposer);
  return candidates;
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

  const container = composer.closest('div.M9') || composer.closest('div.gU') || composer.closest('tr.btC') || composer.parentElement;
  const scopedMatches = container ? collectButtons(container, selectors) : [];
  const documentMatches = scopedMatches.length > 0 ? [] : collectButtons(document.body, selectors);

  return pickBottomRightButton([...scopedMatches, ...documentMatches]);
}

export const gmailAdapter: ActivePlatformAdapter = {
  id: 'gmail',
  platformName: 'Gmail',
  backendPlatform: 'gmail',
  communicationStyle: 'Professional communication review with actionable growth suggestions.',
  labels: {
    emptyTitle: 'Compose with ProPaar',
    emptyDescription: 'ProPaar will guide your thinking before you write your email.',
    analyzeAction: 'Compose email',
    analysisCompleteTitle: 'Your draft is ready.',
    goalCaption: 'The purpose of your email.',
    thinkingCaption: 'Key assumptions for this audience.',
    recommendationsCaption: 'Recommended details to include or change.',
    whatChangedCaption: 'Adjustments made to improve this email.',
    finalCardLabel: 'Polished Email',
    finalCardCaption: 'A high-quality version, ready to send.',
    replaceAction: 'Insert into Gmail',
    replacedAction: 'Inserted',
    successToast: 'Email Inserted Successfully',
  },
  matches: (location) => location.hostname === 'mail.google.com' || location.hostname.endsWith('.mail.google.com'),
  getComposerCandidates: queryComposerCandidates,
  readComposer(): string {
    for (const candidate of queryComposerCandidates()) {
      const text = readElementText(candidate).replace(/\u200B/g, '').trim();
      if (text) return text;
    }
    return '';
  },
  replaceComposer(text: string): boolean {
    const candidates = queryComposerCandidates();
    const composer = candidates.find((candidate) => readElementText(candidate).trim().length > 0) ?? candidates[0];
    if (!composer) return false;

    // Parse out subject if present in delimiters: [SUBJECT] ... [GREETING] ... [BODY] ... [CLOSING] ... [SIGNATURE] ...
    let subject = '';
    let greeting = '';
    let body = '';
    let closing = '';
    let signature = '';

    const subjectMatch = text.match(/\[SUBJECT\]\s*([\s\S]*?)(?=\[(?:GREETING|BODY|CLOSING|SIGNATURE)\]|$)/i);
    const greetingMatch = text.match(/\[GREETING\]\s*([\s\S]*?)(?=\[(?:SUBJECT|BODY|CLOSING|SIGNATURE)\]|$)/i);
    const bodyMatch = text.match(/\[BODY\]\s*([\s\S]*?)(?=\[(?:SUBJECT|GREETING|CLOSING|SIGNATURE)\]|$)/i);
    const closingMatch = text.match(/\[CLOSING\]\s*([\s\S]*?)(?=\[(?:SUBJECT|GREETING|BODY|SIGNATURE)\]|$)/i);
    const signatureMatch = text.match(/\[SIGNATURE\]\s*([\s\S]*?)(?=\[(?:SUBJECT|GREETING|BODY|CLOSING)\]|$)/i);

    if (subjectMatch) subject = subjectMatch[1].trim();
    if (greetingMatch) greeting = greetingMatch[1].trim();
    if (bodyMatch) body = bodyMatch[1].trim();
    if (closingMatch) closing = closingMatch[1].trim();
    if (signatureMatch) signature = signatureMatch[1].trim();

    // If we have parsed parts, let's set the subject input box if we can find it
    if (subject) {
      const form = composer.closest('form') || composer.closest('div.M9') || document;
      const subjectInput = form.querySelector('input[name="subjectbox"]') || form.querySelector('input[placeholder="Subject"]');
      if (subjectInput instanceof HTMLInputElement) {
        subjectInput.value = subject;
        subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
        subjectInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Build the final content block
    let finalBodyText = '';
    if (greeting || body || closing || signature) {
      const parts = [];
      if (greeting) parts.push(greeting);
      if (body) parts.push(body);
      if (closing) parts.push(closing);
      if (signature) parts.push(signature);
      finalBodyText = parts.join('\n\n');
    } else {
      finalBodyText = text;
    }

    return replaceElementText(composer, finalBodyText);
  },
  getPrimaryActionButton(composer: HTMLElement | null): HTMLElement | null {
    return findActionButton(composer, SEND_BUTTON_SELECTORS);
  },
  getSecondaryActionButton(): HTMLElement | null {
    return null;
  },
  getAnchorElement(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    const sendButton = findActionButton(composer, SEND_BUTTON_SELECTORS);
    if (!sendButton) return null;
    // Anchor to the Send button group container (e.g. parent of the Send button)
    // so that the ProPaar icon is mounted outside the blue button pill.
    return sendButton.parentElement ?? sendButton;
  },
  getComposerContainer(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    const anchor = this.getAnchorElement?.(composer) ?? null;
    return anchor?.parentElement ?? composer.closest('form') ?? composer.parentElement;
  },
};
