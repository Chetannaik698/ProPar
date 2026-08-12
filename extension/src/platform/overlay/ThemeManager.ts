export type Theme = 'light' | 'dark';

export interface ThemeState {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
}

export class ThemeManager {
  private currentTheme: Theme;
  private listeners = new Set<(state: ThemeState) => void>();
  private mutationObserver: MutationObserver | null = null;

  constructor() {
    this.currentTheme = this.detectTheme();
  }

  connect(): () => void {
    this.mutationObserver = new MutationObserver(() => {
      const newTheme = this.detectTheme();
      if (newTheme !== this.currentTheme) {
        this.currentTheme = newTheme;
        this.emit();
      }
    });

    const htmlElement = document.documentElement;
    this.mutationObserver.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => {
      this.mutationObserver?.disconnect();
      this.listeners.clear();
    };
  }

  subscribe(listener: (state: ThemeState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  getState(): ThemeState {
    return {
      theme: this.currentTheme,
      isDark: this.currentTheme === 'dark',
      isLight: this.currentTheme === 'light',
    };
  }

  private detectTheme(): Theme {
    // Gmail-specific background color theme detection
    if (window.location.hostname === 'mail.google.com' || window.location.hostname.endsWith('.mail.google.com')) {
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      if (bodyBg && bodyBg !== 'transparent' && bodyBg !== 'rgba(0, 0, 0, 0)') {
        const match = bodyBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness < 128 ? 'dark' : 'light';
        }
      }
    }

    const html = document.documentElement;

    // Check for data-theme attribute
    const dataTheme = html.getAttribute('data-theme');
    if (dataTheme === 'dark' || dataTheme === 'light') {
      return dataTheme;
    }

    // Check for class-based theme
    const classList = html.classList;
    if (classList.contains('dark')) {
      return 'dark';
    }
    if (classList.contains('light')) {
      return 'light';
    }

    // Check for ChatGPT-specific theme classes
    if (classList.contains('theme-dark')) {
      return 'dark';
    }
    if (classList.contains('theme-light')) {
      return 'light';
    }

    // Fallback to system preference
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  private emit(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}