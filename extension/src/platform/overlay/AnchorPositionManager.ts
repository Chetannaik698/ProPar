import { getActivePlatformAdapter } from '../adapters/registry';

export interface AnchorPoint {
  top: number;
  left: number;
}

export interface AnchorPositionManagerOptions {
  resolveAnchor?: () => HTMLElement | null;
  resolveContainer?: () => HTMLElement | null;
  onChange?: (snapshot: { anchorRect: DOMRect | null; containerRect: DOMRect | null; position: AnchorPoint | null }) => void;
}

export class AnchorPositionManager {
  private anchor: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private hostElement: HTMLElement | null = null;
  private portalElement: HTMLElement | null = null;
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private listeners = new Set<() => void>();
  private scheduledFrame: number | null = null;
  private lastPosition: AnchorPoint | null = null;

  constructor(private readonly options: AnchorPositionManagerOptions = {}) {}

  connect(): () => void {
    this.resolveElements();
    this.startObserving();
    this.sync('connect');

    return () => {
      this.destroy();
      this.listeners.clear();
    };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    listener();
    return () => this.listeners.delete(listener);
  }

  getHostElement(): HTMLElement | null {
    return this.hostElement;
  }

  getPortalElement(): HTMLElement | null {
    return this.portalElement;
  }

  getAnchorElement(): HTMLElement | null {
    return this.anchor;
  }

  getContainerElement(): HTMLElement | null {
    return this.container;
  }

  refresh(reason = 'refresh'): void {
    this.scheduleSync(reason);
  }

  getAnchorRect(): DOMRect | null {
    return this.anchor?.getBoundingClientRect() ?? null;
  }

  getContainerRect(): DOMRect | null {
    return this.container?.getBoundingClientRect() ?? null;
  }

  getRelativePosition(): AnchorPoint | null {
    const anchorRect = this.getAnchorRect();
    const containerRect = this.getContainerRect();

    if (!anchorRect || !containerRect) return null;

    return {
      top: anchorRect.top - containerRect.top,
      left: anchorRect.left - containerRect.left,
    };
  }

  private resolveElements(): void {
    try {
      const adapter = getActivePlatformAdapter();
      console.debug('[ProPaar][Anchor] resolveElements for platform:', adapter.id);

      let nextAnchor = this.options.resolveAnchor?.() ?? null;
      let nextContainer = this.options.resolveContainer?.() ?? null;
      console.debug('[ProPaar][Anchor] Options resolution - nextAnchor:', nextAnchor, 'nextContainer:', nextContainer);

      // Fallback to platform adapter detection if constructor options did not resolve
      if (!nextAnchor) {
        const nextComposer = adapter.getComposerCandidates()[0] ?? null;
        console.debug('[ProPaar][Anchor] Fallback check - nextComposer:', nextComposer);
        if (nextComposer) {
          nextAnchor = adapter.getAnchorElement?.(nextComposer) ?? null;
          console.debug('[ProPaar][Anchor] Fallback check - nextAnchor:', nextAnchor);
          if (!nextContainer) {
            nextContainer = nextAnchor?.parentElement ?? adapter.getComposerContainer?.(nextComposer) ?? null;
            console.debug('[ProPaar][Anchor] Fallback check - nextContainer:', nextContainer);
          }
        }
      }


      // Resolve the direct subelement wrapper of the horizontal actions toolbar
      // Skip for LinkedIn and Gmail — their structures differ and walk-up can cause layout thrashing or misidentification
      if (nextAnchor && adapter.id !== 'linkedin' && adapter.id !== 'gmail') {
        nextAnchor = this.findToolbarSubelement(nextAnchor);
      }

      // Ensure that container is the immediate parent of the anchor for inline sibling insertion
      if (nextAnchor && nextAnchor.parentElement) {
        nextContainer = nextAnchor.parentElement;
      }

      console.debug('[ProPaar][Anchor] Final resolved - nextAnchor:', nextAnchor, 'nextContainer:', nextContainer);

      let changed = false;
      if (nextAnchor !== this.anchor) {
        this.anchor = nextAnchor;
        changed = true;
      }
      if (nextContainer !== this.container) {
        this.container = nextContainer;
        changed = true;
      }

      if (changed) {
        this.updateObservers();
      }

      if (this.anchor && this.container) {
        this.ensureHost();
      } else {
        console.debug('[ProPaar][Anchor] Missing anchor or container. Removing host if attached.');
        if (this.hostElement && this.hostElement.parentElement) {
          this.hostElement.parentElement.removeChild(this.hostElement);
        }
      }
    } catch (err) {
      console.error('[ProPaar][Anchor] Errors:', err);
    }
  }

  private ensureHost(): void {
    if (!this.container || !this.anchor) {
      console.debug('[ProPaar][Anchor] ensureHost skipped due to missing anchor/container');
      return;
    }

    const adapter = getActivePlatformAdapter();

    if (!this.hostElement) {
      console.debug('[ProPaar][Anchor] Creating hostElement element');
      this.hostElement = document.createElement('div');
      this.hostElement.setAttribute('data-propaar-anchor-host', '');
      this.hostElement.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        flex: 0 0 auto;
        vertical-align: middle;
        position: relative;
        pointer-events: auto;
        z-index: 2147483647;
      `;

      const shadowRoot = this.hostElement.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = `
        :host {
          all: initial;
          display: inline-flex;
          width: 36px;
          height: 36px;
        }
        #propaar-anchor-portal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          pointer-events: auto;
          position: relative;
        }
        .propaar-icon {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 36px !important;
          height: 36px !important;
          border: none !important;
          border-radius: 50% !important;
          background: transparent !important;
          color: inherit !important;
          cursor: pointer !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          outline: none !important;
          pointer-events: auto !important;
        }
        .propaar-icon:hover {
          background: rgba(0, 0, 0, 0.06) !important;
        }
        .propaar-icon:focus-visible {
          outline: 2px solid #0b57d0 !important;
          outline-offset: 2px !important;
        }
        .propaar-icon img,
        .propaar-icon svg {
          display: block !important;
          width: 18px !important;
          height: 18px !important;
          max-width: 18px !important;
          max-height: 18px !important;
        }
      `;
      this.portalElement = document.createElement('div');
      this.portalElement.id = 'propaar-anchor-portal';
      shadowRoot.append(style, this.portalElement);
    }

    this.hostElement.style.position = 'relative';

    this.hostElement.style.marginLeft = '';
    this.hostElement.style.marginRight = '';
    this.hostElement.style.alignSelf = '';

    // Insert as inline sibling directly before the anchor button
    if (this.hostElement.parentElement !== this.container || this.hostElement.nextElementSibling !== this.anchor) {
      console.debug('[ProPaar][Anchor] Inserting hostElement before anchor into container');
      this.container.insertBefore(this.hostElement, this.anchor);
    }
  }

  private startObserving(): void {
    this.stopObserving();

    // 1. Observe general body changes to dynamically mount when composer/anchor is created or swapped
    this.mutationObserver = new MutationObserver((mutations) => {
      const hasExternalMutation = mutations.some((m) => {
        const target = m.target as HTMLElement;
        if (this.hostElement && (target === this.hostElement || this.hostElement.contains(target))) {
          return false;
        }
        const rootEl = document.getElementById('propaar-extension-root');
        if (rootEl && (target === rootEl || rootEl.contains(target))) {
          return false;
        }
        return true;
      });
      if (hasExternalMutation) {
        this.scheduleSync('mutation');
      }
    });
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'disabled', 'hidden'],
    });

    // 2. Element specific observers
    this.resizeObserver = new ResizeObserver(() => this.scheduleSync('resize'));
    this.updateObservers();

    window.addEventListener('resize', this.handleWindowChange, { passive: true });
    window.addEventListener('scroll', this.handleWindowChange, { capture: true, passive: true });
    window.addEventListener('propaar:platform-recover', this.handleWindowChange);
  }

  private updateObservers(): void {
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

    if (this.resizeObserver) {
      if (this.container) this.resizeObserver.observe(this.container);
      if (this.anchor) this.resizeObserver.observe(this.anchor);
    }

    if (this.anchor) {
      this.intersectionObserver = new IntersectionObserver(() => this.scheduleSync('intersection'), {
        root: null,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      this.intersectionObserver.observe(this.anchor);
    }
  }

  private stopObserving(): void {
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;

    window.removeEventListener('resize', this.handleWindowChange);
    window.removeEventListener('scroll', this.handleWindowChange, { capture: true });
    window.removeEventListener('propar:platform-recover', this.handleWindowChange);

    if (this.scheduledFrame !== null) {
      window.cancelAnimationFrame(this.scheduledFrame);
      this.scheduledFrame = null;
    }
  }

  private destroy(): void {
    this.stopObserving();
    if (this.hostElement && this.hostElement.parentElement) {
      this.hostElement.parentElement.removeChild(this.hostElement);
    }
    this.hostElement = null;
    this.portalElement = null;
    this.anchor = null;
    this.container = null;
  }

  private readonly handleWindowChange = (): void => {
    this.scheduleSync('window');
  };

  private scheduleSync(reason: string): void {
    if (this.scheduledFrame !== null) return;

    this.scheduledFrame = window.requestAnimationFrame(() => {
      this.scheduledFrame = null;
      this.sync(reason);
    });
  }

  private sync(reason = 'sync'): void {
    void reason;
    this.resolveElements();

    if (this.anchor && this.container && this.hostElement) {
      const adapter = getActivePlatformAdapter();
      if (adapter.id === 'chatgpt' || adapter.id === 'gemini' || adapter.id === 'claude' || adapter.id === 'linkedin') {
        // Relative inline-flex layout for ChatGPT, Gemini, Claude, and LinkedIn to sit naturally in flow
        if (this.hostElement.style.position !== 'relative') {
          this.hostElement.style.position = 'relative';
        }
        if (this.hostElement.style.top !== '') {
          this.hostElement.style.top = '';
        }
        if (this.hostElement.style.left !== '') {
          this.hostElement.style.left = '';
        }

        const marginX = adapter.id === 'gemini' || adapter.id === 'claude' ? '6px' : '8px';
        if (this.hostElement.style.marginLeft !== marginX) {
          this.hostElement.style.marginLeft = marginX;
        }
        if (this.hostElement.style.marginRight !== marginX) {
          this.hostElement.style.marginRight = marginX;
        }
        return;
      }
    }

    const position = this.getRelativePosition();
    if (position && (this.lastPosition?.top !== position.top || this.lastPosition?.left !== position.left)) {
      this.lastPosition = position;
    }

    const payload = {
      anchorRect: this.getAnchorRect(),
      containerRect: this.getContainerRect(),
      position,
    };

    this.options.onChange?.(payload);
    this.listeners.forEach((listener) => listener());
  }

  private isElementVisible(el: HTMLElement): boolean {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  private findToolbarSubelement(element: HTMLElement): HTMLElement {
    let current = element;
    while (current.parentElement) {
      const parent = current.parentElement;
      
      // Stop traversing up if we reach the form or body
      if (parent.tagName === 'FORM' || parent.tagName === 'BODY' || parent.getAttribute('role') === 'presentation') {
        break;
      }
      
      const buttons = parent.querySelectorAll('button, [role="button"], g-icon-button, [aria-haspopup="true"]');
      const visibleButtons = Array.from(buttons).filter((el) => {
        if (!(el instanceof HTMLElement)) return false;
        return this.isElementVisible(el);
      });
      
      if (visibleButtons.length > 1) {
        return current;
      }
      current = parent;
    }
    return element;
  }
}


