import type { ActivePlatformAdapter } from '../adapters/types';
import { isVisibleElement, readElementText, replaceElementText, uniqueVisibleElements } from '../adapters/dom';

const LINKEDIN_COMPOSER_SELECTORS = [
  '[role="dialog"] [contenteditable="true"]',
  '[role="dialog"] [role="textbox"]',
  '[aria-modal="true"] [contenteditable="true"]',
  '.artdeco-modal [contenteditable="true"]',
  '.share-creation-state [contenteditable="true"]',
  '.share-box-v2 [contenteditable="true"]',
  'div[aria-label*="talk about" i]',
  'div[placeholder*="talk about" i]',
  'div[aria-placeholder*="talk about" i]',
  'div[aria-label*="post" i][contenteditable="true"]',
  '.ql-editor',
  '.ProseMirror',
  '[data-lexical-editor="true"]',
  'div[contenteditable="true"]',
] as const;

const POST_BUTTON_SELECTORS = [
  'button.share-actions__primary-action',
  'button[data-control-name="share_post"]',
  'button.artdeco-button--primary',
  'button[aria-label*="Post" i]',
  'button[aria-label*="Publish" i]',
  '.share-creation-state__footer button',
  '.share-actions button',
  '.artdeco-modal__actionbar button',
] as const;

const EXCLUDED_SCOPE_WORDS = ['comment', 'reply', 'message', 'search'] as const;
const POST_ACTION_WORDS = ['post', 'publish', 'share', 'done', 'next'] as const;

function safeQueryAll(root: ParentNode, selector: string): HTMLElement[] {
  try {
    return Array.from(root.querySelectorAll<HTMLElement>(selector));
  } catch {
    return [];
  }
}

function getButtonText(element: HTMLElement): string {
  return [
    element.innerText,
    element.textContent,
    element.getAttribute('aria-label'),
    element.getAttribute('title'),
    element.getAttribute('data-control-name'),
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
    .toLowerCase();
}

function containsAny(text: string, words: readonly string[]): boolean {
  return words.some((word) => text.includes(word));
}

function isExcludedElement(element: HTMLElement): boolean {
  if (element.closest('#propar-extension-root')) return true;

  const isInPostModal = Boolean(
    element.closest('[role="dialog"], [aria-modal="true"], .artdeco-modal, .share-creation-state, .share-box-v2')
  );

  if (isInPostModal) {
    const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
    if (ariaLabel.includes('search')) return true;
    return false;
  }

  const words = [
    element.getAttribute('aria-label'),
    element.getAttribute('placeholder'),
    element.getAttribute('class'),
    element.id,
    element.closest('form')?.getAttribute('aria-label'),
    element.closest('.comments-comment-box')?.className,
    element.closest('.msg-overlay-conversation-bubble')?.className,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return containsAny(words, EXCLUDED_SCOPE_WORDS);
}

function findModalScope(composer: HTMLElement): HTMLElement | null {
  const scope =
    composer.closest<HTMLElement>('[role="dialog"]') ||
    composer.closest<HTMLElement>('[aria-modal="true"]') ||
    composer.closest<HTMLElement>('.artdeco-modal') ||
    composer.closest<HTMLElement>('.share-creation-state') ||
    composer.closest<HTMLElement>('.share-box-v2') ||
    composer.closest<HTMLElement>('.share-box');

  if (scope && scope.isConnected && !isExcludedElement(scope)) {
    return scope;
  }

  let current = composer.parentElement;
  for (let depth = 0; current && depth < 10; depth += 1) {
    if (current === document.body) break;
    if (current.isConnected && !isExcludedElement(current)) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

function findPostButtonInScope(scope: ParentNode): HTMLElement | null {
  for (const selector of POST_BUTTON_SELECTORS) {
    const matches = safeQueryAll(scope, selector).filter((btn) => !isExcludedElement(btn));
    if (matches.length > 0) {
      return matches[matches.length - 1];
    }
  }

  const footerButtons = safeQueryAll(
    scope,
    '.share-creation-state__footer button, .share-actions button, .artdeco-modal__actionbar button, footer button',
  ).filter((btn) => !isExcludedElement(btn));
  if (footerButtons.length > 0) {
    return footerButtons[footerButtons.length - 1];
  }

  const allButtons = safeQueryAll(scope, 'button, [role="button"]').filter((btn) => {
    if (isExcludedElement(btn)) return false;
    const text = getButtonText(btn);
    return containsAny(text, POST_ACTION_WORDS) && !containsAny(text, EXCLUDED_SCOPE_WORDS);
  });

  if (allButtons.length > 0) {
    return allButtons[allButtons.length - 1];
  }

  return null;
}

function queryComposerCandidates(): HTMLElement[] {
  const selectorMatches = LINKEDIN_COMPOSER_SELECTORS.flatMap((selector) => safeQueryAll(document, selector));
  const fallbackMatches = safeQueryAll(
    document,
    '[role="dialog"] [contenteditable="true"], [aria-modal="true"] [contenteditable="true"], .artdeco-modal [contenteditable="true"], .share-creation-state [contenteditable="true"]',
  );

  const candidates = uniqueVisibleElements([...selectorMatches, ...fallbackMatches]).filter((element) => {
    if (!isVisibleElement(element)) return false;
    if (isExcludedElement(element)) return false;

    if (element.closest('.share-box-feed-entry') || element.closest('.feed-shared-update-v2')) {
      if (!element.closest('[role="dialog"], [aria-modal="true"], .artdeco-modal, .share-creation-state')) {
        return false;
      }
    }

    const scope = findModalScope(element);
    if (!scope) return false;

    return true;
  });

  return candidates;
}

export class LinkedInAdapter implements ActivePlatformAdapter {
  readonly id = 'linkedin' as const;
  readonly platformName = 'LinkedIn';
  readonly backendPlatform = 'linkedin' as const;
  readonly communicationStyle = 'Professional communication review with actionable growth suggestions.';
  readonly labels = {
    emptyTitle: 'Craft LinkedIn Post with ProPaar',
    emptyDescription: 'ProPaar will review your hook, storytelling, and audience positioning before you post.',
    analyzeAction: 'Review post',
    analysisCompleteTitle: 'Your communication review is ready.',
    goalCaption: 'The inferred purpose of your post and why.',
    thinkingCaption: 'Whether the content speaks to that audience.',
    recommendationsCaption: 'Review the hook, flow, formatting, structure, and engagement.',
    whatChangedCaption: 'The most important communication adjustments made to the final post.',
    finalCardLabel: 'Final LinkedIn Post',
    finalCardCaption: 'A polished post matching your voice, ready to publish.',
    replaceAction: 'Replace Post',
    replacedAction: 'Replaced',
    successToast: 'Post Replaced Successfully',
    goalDiscoveryTitle: 'Post Purpose',
    thinkingTitle: 'Target Audience',
    expertTitle: 'What an Expert Would Improve',
    expertCaption: 'Feedback from experienced LinkedIn creators.',
    blindSpotsTitle: 'Blind Spots',
    blindSpotsCaption: 'Potential weaknesses before publishing.',
    missingContextTitle: 'Hook & Storytelling Analysis',
    missingContextCaption: 'Scroll-stopping ability, clarity, curiosity, and emotion.',
    recommendationsTitle: 'Structure & Engagement Review',
  };

  matches(location: Location): boolean {
    return location.hostname === 'linkedin.com' || location.hostname.endsWith('.linkedin.com');
  }

  getComposerCandidates(): HTMLElement[] {
    return queryComposerCandidates();
  }

  readComposer(): string {
    for (const candidate of queryComposerCandidates()) {
      const text = readElementText(candidate).replace(/\u200B/g, '').trim();
      if (text) return text;
    }
    return '';
  }

  replaceComposer(text: string): boolean {
    const candidates = queryComposerCandidates();
    const composer = candidates.find((candidate) => readElementText(candidate).trim().length > 0) ?? candidates[0];
    if (!composer) return false;

    const success = replaceElementText(composer, text);

    try {
      composer.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
      composer.dispatchEvent(new Event('change', { bubbles: true }));
      composer.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    } catch {
      // Ignore event dispatch errors
    }

    return success;
  }

  getPrimaryActionButton(composer: HTMLElement | null): HTMLElement | null {
    if (!composer?.isConnected) return null;
    const scope = findModalScope(composer);
    if (!scope) return null;

    const postBtn = findPostButtonInScope(scope);
    if (postBtn) return postBtn;

    const modalButtons = safeQueryAll(scope, 'button').filter(
      (btn) => !isExcludedElement(btn),
    );
    if (modalButtons.length > 0) {
      return modalButtons[modalButtons.length - 1];
    }

    return null;
  }

  getAnchorElement(composer: HTMLElement | null): HTMLElement | null {
    return this.getPrimaryActionButton(composer);
  }

  getComposerContainer(composer: HTMLElement | null): HTMLElement | null {
    if (!composer?.isConnected) return null;
    const anchor = this.getAnchorElement(composer);
    if (anchor?.parentElement) {
      const toolbar =
        anchor.closest('[role="toolbar"]') ||
        anchor.closest('.artdeco-modal__actionbar') ||
        anchor.closest('footer') ||
        anchor.closest('.share-creation-state__footer') ||
        anchor.closest('.share-actions') ||
        anchor.parentElement;
      return toolbar instanceof HTMLElement ? toolbar : anchor.parentElement;
    }
    const scope = findModalScope(composer);
    return scope;
  }

  bootstrap(onRecover: () => void): () => void {
    let observer: MutationObserver | null = null;
    let timer: number | null = null;

    const handleDOMMutation = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        onRecover();
      }, 150);
    };

    try {
      observer = new MutationObserver((mutations) => {
        const hasExternalChange = mutations.some((m) => {
          const target = m.target;
          return target instanceof HTMLElement && !target.closest('#propar-extension-root');
        });
        if (hasExternalChange) {
          handleDOMMutation();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'],
      });
    } catch (err) {
      console.error('[ProPar][LinkedIn] Observer failed to initialize', err);
    }

    handleDOMMutation();

    return () => {
      if (timer !== null) window.clearTimeout(timer);
      observer?.disconnect();
    };
  }
}

export const linkedinAdapter = new LinkedInAdapter();
