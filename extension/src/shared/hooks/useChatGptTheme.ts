import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
}

export function useChatGptTheme(): ThemeState {
  const [theme, setTheme] = useState<Theme>(() => detectTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newTheme = detectTheme();
      setTheme(newTheme);
    });

    const htmlElement = document.documentElement;
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => observer.disconnect();
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}

function detectTheme(): Theme {
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