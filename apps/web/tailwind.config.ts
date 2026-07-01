import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#080809",
          900: "#0d0d10",
          800: "#131318",
          700: "#1a1a20",
          600: "#242430",
        },
        stone: {
          50: "#f0ede8",
          100: "#e4e0da",
          200: "#ccc8c1",
          300: "#b4afa7",
          400: "#9b968d",
          500: "#837d74",
          600: "#6b655d",
          700: "#534e47",
          800: "#3b3731",
          900: "#23201c",
        },
        gold: {
          DEFAULT: "#c4a35a",
          light: "#d4b570",
          dim: "#8a7040",
          faint: "#2a2215",
        },
        terracotta: {
          DEFAULT: "#b85c38",
          dim: "#7a3d25",
          faint: "#2a1710",
        },
        jade: {
          DEFAULT: "#4a8c6e",
          faint: "#111e18",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      keyframes: {
        "slide-in": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "panel-in": {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.35s cubic-bezier(0.19, 1, 0.22, 1) both",
        "fade-in": "fade-in 0.2s ease both",
        "panel-in": "panel-in 0.3s cubic-bezier(0.19, 1, 0.22, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
