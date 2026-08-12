import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        mist: "#F6F7F8",
        fog: "#EEF0F2",
        ink: {
          DEFAULT: "#0B0D12",
          soft: "#3B3F46",
          faint: "#8A8F98",
        },
        line: "#E7E9EC",
        accent: {
          DEFAULT: "#2F5DE0",
          soft: "#EDF1FE",
          deep: "#1F3FA8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11,13,18,0.04), 0 8px 24px rgba(11,13,18,0.06)",
        card: "0 1px 1px rgba(11,13,18,0.03), 0 12px 32px -8px rgba(11,13,18,0.10)",
        lift: "0 20px 60px -12px rgba(11,13,18,0.18)",
      },
      maxWidth: {
        content: "1180px",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        floatSlow: "floatSlow 6s ease-in-out infinite",
        blink: "blink 1s step-start infinite",
      },
    },
  },
  plugins: [],
};

export default config;
