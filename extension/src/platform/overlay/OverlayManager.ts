import { ComposerTracker, type ComposerRect, type ToolbarRect } from './ComposerTracker';
import { ThemeManager, type ThemeState } from './ThemeManager';
import { AnchorPositionManager } from './AnchorPositionManager';
import { getActivePlatformAdapter } from '../adapters/registry';

export interface OverlayConfig {
  iconSize: number;
  iconGap: number;
  popupMaxWidth: number;
  popupGap: number;
  viewportGutter: number;
}

export interface PopupPosition {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
}

export class OverlayManager {
  private readonly tracker: ComposerTracker;
  private readonly theme: ThemeManager;
  private readonly anchorManager: AnchorPositionManager;
  private listeners = new Set<() => void>();
  private composerRect: ComposerRect | null = null;
  private toolbarRect: ToolbarRect | null = null;
  private themeState: ThemeState;
  private cleanupTracker: (() => void) | null = null;
  private cleanupTheme: (() => void) | null = null;
  private cleanupAnchor: (() => void) | null = null;
  private cleanupPlatform: (() => void) | null = null;

  readonly config: OverlayConfig = {
    iconSize: 36,
    iconGap: 24,
    popupMaxWidth: 400,
    popupGap: 10,
    viewportGutter: 12,
  };

  constructor() {
    this.tracker = new ComposerTracker();
    this.theme = new ThemeManager();
    this.themeState = this.theme.getState();
    this.anchorManager = new AnchorPositionManager({
      resolveAnchor: () => {
        const adapter = getActivePlatformAdapter();
        const composer = this.tracker.getComposerElement();
        return adapter.getAnchorElement?.(composer) ?? null;
      },
      resolveContainer: () => {
        const adapter = getActivePlatformAdapter();
        const composer = this.tracker.getComposerElement();
        return adapter.getComposerContainer?.(composer) ?? null;
      },
      onChange: () => {
        this.notify();
      },
    });
  }

  mount(): HTMLElement {
    const activeAdapter = getActivePlatformAdapter();
    this.cleanupPlatform = activeAdapter.bootstrap?.(() => {
      this.tracker.refresh();
      this.anchorManager.refresh('platform-recover');
      this.notify();
    }) ?? null;

    // Start tracking
    this.cleanupTracker = this.tracker.connect();
    this.cleanupTheme = this.theme.connect();
    this.cleanupAnchor = this.anchorManager.connect();

    // Subscribe to updates
    this.tracker.subscribe((composerRect, toolbarRect) => {
      this.composerRect = composerRect;
      this.toolbarRect = toolbarRect;
      this.notify();
    });

    this.theme.subscribe((themeState) => {
      this.themeState = themeState;
      this.notify();
    });

    return document.body;
  }

  unmount(): void {
    this.cleanupTracker?.();
    this.cleanupTheme?.();
    this.cleanupAnchor?.();
    this.cleanupPlatform?.();
    this.cleanupTracker = null;
    this.cleanupTheme = null;
    this.cleanupAnchor = null;
    this.cleanupPlatform = null;
    this.listeners.clear();
  }

  getHostElement(): HTMLElement | null {
    return this.anchorManager.getHostElement();
  }

  getPortalElement(): HTMLElement | null {
    return this.anchorManager.getPortalElement();
  }

  getComposerRect(): ComposerRect | null {
    return this.composerRect;
  }

  getToolbarRect(): ToolbarRect | null {
    return this.toolbarRect;
  }

  getThemeState(): ThemeState {
    return this.themeState;
  }

  getIconPosition(): { top: number; left: number } | null {
    const host = this.anchorManager.getHostElement();
    if (!host || !host.isConnected) {
      return null;
    }

    const rect = host.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
    };
  }

  getPopupPosition(iconTop: number, iconLeft: number, popupHeight = 0): PopupPosition {
    const { popupMaxWidth, popupGap, viewportGutter } = this.config;

    // Calculate width
    const width = Math.min(popupMaxWidth, window.innerWidth - viewportGutter * 2);

    const openAbove = iconTop >= window.innerHeight / 2;
    const fallbackTop = iconTop + this.config.iconSize + popupGap;

    // Align left edge with icon, clamp to viewport
    let left = iconLeft;
    left = Math.max(viewportGutter, Math.min(left, window.innerWidth - width - viewportGutter));

    if (openAbove) {
      const bottom = Math.max(viewportGutter, window.innerHeight - iconTop + popupGap);
      const availableHeight = window.innerHeight - bottom - viewportGutter;
      if (popupHeight <= availableHeight) {
        return { bottom, left, width };
      }

      return { top: viewportGutter, left, width };
    }

    // Clamp below-icon placement to the viewport when the popup is tall.
    const maxTop = window.innerHeight - popupHeight - viewportGutter;
    const minTop = viewportGutter;
    const top = Math.max(minTop, Math.min(fallbackTop, maxTop));

    return { top, left, width };
  }

  subscribeToUpdates(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
