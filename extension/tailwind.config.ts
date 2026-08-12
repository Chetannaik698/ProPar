import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}', './dev/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18181b',
        muted: '#71717a',
        line: '#e4e4e7',
        canvas: '#fafafa',
        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          soft: '#eff6ff',
        },
      },
      boxShadow: {
        card: '0 18px 48px rgba(24, 24, 27, 0.14), 0 2px 8px rgba(24, 24, 27, 0.06)',
        launcher: '0 4px 14px rgba(24, 24, 27, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

