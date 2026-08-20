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
      attributeFilter: ['data-theme', 'data-mode', 'class', 'style'],
    });

    if (document.body) {
      this.mutationObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-mode', 'class', 'style'],
      });
    }

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
    const html = document.documentElement;
    const body = document.body;

    // Check data-theme or data-mode attributes on html or body
    const dataTheme =
      html.getAttribute('data-theme') ||
      body?.getAttribute('data-theme') ||
      html.getAttribute('data-mode') ||
      body?.getAttribute('data-mode');

    if (dataTheme === 'dark' || dataTheme === 'light') {
      return dataTheme;
    }

    // Check class names on html, body, or active theme roots
    const classListStr = `${html.className} ${body?.className || ''}`.toLowerCase();
    if (classListStr.includes('dark') || classListStr.includes('theme-dark')) {
      return 'dark';
    }
    if (classListStr.includes('light') || classListStr.includes('theme-light')) {
      return 'light';
    }

    if (document.querySelector('.dark, [data-mode="dark"], [data-theme="dark"]')) {
      return 'dark';
    }

    // Computed background color brightness detection (works for Claude, ChatGPT, Gemini, Gmail, Perplexity, LinkedIn)
    const targetElement = body || html;
    if (targetElement) {
      const bg = window.getComputedStyle(targetElement).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          return brightness < 140 ? 'dark' : 'light';
        }
      }
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