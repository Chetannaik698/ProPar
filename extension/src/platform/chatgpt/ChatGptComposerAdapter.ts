export interface ComposerSnapshot {
  hasText: boolean;
  mounted: boolean;
}

type SnapshotListener = (snapshot: ComposerSnapshot) => void;

const COMPOSER_SELECTORS = [
  '#prompt-textarea',
  '[data-testid="composer-text-input"]',
  'textarea[placeholder*="Message"]',
  'div[contenteditable="true"][data-virtualkeyboard="true"]',
] as const;

const SEND_BUTTON_SELECTORS = [
  'button[data-testid="send-button"]',
  'button[aria-label="Send prompt"]',
  'button[aria-label="Send message"]',
] as const;

export class ChatGptComposerAdapter {
  private composer: HTMLElement | null = null;
  private readonly listeners = new Set<SnapshotListener>();
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private frameId: number | null = null;

  constructor(private readonly host: HTMLElement) {}

  connect(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.start();
    else listener(this.readSnapshot());

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stop();
    };
  }

  private start(): void {
    this.resolveComposer();
    this.mountInToolbar();
    this.mutationObserver = new MutationObserver(this.scheduleSync);
    this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', this.scheduleSync, { passive: true });
    document.addEventListener('input', this.handleInput, true);
    this.emit();
  }

  private stop(): void {
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.scheduleSync);
    document.removeEventListener('input', this.handleInput, true);
    if (this.frameId !== null) window.cancelAnimationFrame(this.frameId);
    this.composer = null;
  }

  private readonly handleInput = (event: Event): void => {
    if (event.target === this.composer || this.composer?.contains(event.target as Node)) {
      this.scheduleSync();
    }
  };

  private readonly scheduleSync = (): void => {
    if (this.frameId !== null) return;
    this.frameId = window.requestAnimationFrame(() => {
      this.frameId = null;
      if (!this.composer?.isConnected) this.resolveComposer();
      this.mountInToolbar();
      this.emit();
    });
  };

  private resolveComposer(): void {
    const nextComposer = COMPOSER_SELECTORS.reduce<HTMLElement | null>(
      (match, selector) => match ?? document.querySelector<HTMLElement>(selector),
      null,
    );
    if (nextComposer === this.composer) return;

    this.resizeObserver?.disconnect();
    this.composer = nextComposer;
    if (this.composer) {
      this.resizeObserver = new ResizeObserver(this.scheduleSync);
      this.resizeObserver.observe(this.composer);
    }
  }

  findSendButton(): HTMLButtonElement | null {
    const form = this.composer?.closest('form');
    return SEND_BUTTON_SELECTORS.reduce<HTMLButtonElement | null>(
      (match, selector) => match ?? form?.querySelector<HTMLButtonElement>(selector)
        ?? document.querySelector<HTMLButtonElement>(selector),
      null,
    );
  }

  getAnchorElement(): HTMLElement | null {
    return this.findSendButton();
  }

  getComposerContainer(composer: HTMLElement | null): HTMLElement | null {
    if (!composer) return null;
    return composer.closest('form') ?? composer.parentElement;
  }

  private mountInToolbar(): void {
    const sendButton = this.findSendButton();
    const toolbar = sendButton?.parentElement;
    if (!sendButton || !toolbar) return;
    if (this.host.parentElement !== toolbar || this.host.nextElementSibling !== sendButton) {
      toolbar.insertBefore(this.host, sendButton);
    }
  }

  private readSnapshot(): ComposerSnapshot {
    if (!this.composer?.isConnected) return { hasText: false, mounted: false };
    const rawValue =
      this.composer instanceof HTMLTextAreaElement || this.composer instanceof HTMLInputElement
        ? this.composer.value
        : this.composer.innerText || this.composer.textContent || '';

    return {
      hasText: rawValue.trim().length > 0,
      mounted: this.host.isConnected && this.host.parentElement !== document.documentElement,
    };
  }

  private emit(): void {
    const snapshot = this.readSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
