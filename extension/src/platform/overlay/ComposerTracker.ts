import { getActivePlatformAdapter } from '../adapters/registry';
import type { ActivePlatformAdapter } from '../adapters/types';

export interface ComposerRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export interface ToolbarRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export class ComposerTracker {
  private adapter: ActivePlatformAdapter = getActivePlatformAdapter();
  private composer: HTMLElement | null = null;
  private toolbar: HTMLElement | null = null;
  private composerElement: HTMLElement | null = null;
  private sendButton: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private listeners = new Set<(rect: ComposerRect | null, toolbar: ToolbarRect | null) => void>();
  private frameId: number | null = null;

  connect(): () => void {
    this.resolveElements();
    this.startObserving();
    this.emit();

    return () => {
      this.stopObserving();
      this.listeners.clear();
    };
  }

  subscribe(listener: (rect: ComposerRect | null, toolbar: ToolbarRect | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.getComposerRect(), this.getToolbarRect());
    return () => this.listeners.delete(listener);
  }

  getComposerElement(): HTMLElement | null {
    return this.composerElement;
  }

  getComposerRect(): ComposerRect | null {
    if (!this.composer) return null;
    const rect = this.composer.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
  }

  getToolbarRect(): ToolbarRect | null {
    if (!this.toolbar) return null;
    const rect = this.toolbar.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    };
  }

  getSendButton(): HTMLElement | null {
    return this.sendButton;
  }

  getMicrophoneButton(): HTMLElement | null {
    return this.adapter.getSecondaryActionButton?.(this.composer) ?? null;
  }

  refresh(): void {
    this.scheduleSync();
  }

  private resolveElements(): void {
    this.adapter = getActivePlatformAdapter();
    const nextComposer = this.adapter.getComposerCandidates()[0] ?? null;

    if (nextComposer !== this.composer) {
      this.composer = nextComposer;
      this.composerElement = nextComposer;
      if (this.composer) {
        this.resizeObserver?.disconnect();
        this.resizeObserver = new ResizeObserver(() => this.scheduleSync());
        this.resizeObserver.observe(this.composer);
      }
    }

    if (this.composer) {
      this.sendButton = this.adapter.getPrimaryActionButton(this.composer);
      this.toolbar = this.sendButton?.parentElement ?? null;
    } else {
      this.sendButton = null;
      this.toolbar = null;
    }
  }

  private startObserving(): void {
    this.mutationObserver = new MutationObserver(() => {
      console.debug('[ProPar][Anchor] Mutation detected');
      this.scheduleSync();
    });
    this.mutationObserver.observe(document.body, { attributes: true, characterData: true, childList: true, subtree: true });
    window.addEventListener('resize', this.scheduleSync, { passive: true });
    document.addEventListener('scroll', this.scheduleSync, { capture: true, passive: true });
    window.addEventListener('propar:platform-recover', this.scheduleSync);
  }

  private stopObserving(): void {
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.scheduleSync);
    document.removeEventListener('scroll', this.scheduleSync, { capture: true });
    window.removeEventListener('propar:platform-recover', this.scheduleSync);
    if (this.frameId !== null) {
      window.cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private readonly scheduleSync = (): void => {
    if (this.frameId !== null) return;
    this.frameId = window.requestAnimationFrame(() => {
      this.frameId = null;
      this.resolveElements();
      this.emit();
    });
  };

  private emit(): void {
    const composerRect = this.getComposerRect();
    const toolbarRect = this.getToolbarRect();
    this.listeners.forEach((listener) => listener(composerRect, toolbarRect));
  }
}

