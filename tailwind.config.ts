import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F17",
        panel: "#111827",
        panelHover: "#161F30",
        panelBorder: "#1F2937",
        panelBorderSubtle: "#374151",
        accent: {
          emerald: "#10B981",
          rose: "#F43F5E",
          indigo: "#6366F1",
          amber: "#F59E0B",
          cyan: "#06B6D4",
          violet: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "fintech-subtle": "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        "fintech-card": "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)",
        "fintech-glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.15)",
        "fintech-glow-indigo": "0 0 25px -5px rgba(99, 102, 241, 0.15)",
        "fintech-glow-rose": "0 0 25px -5px rgba(244, 63, 94, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
