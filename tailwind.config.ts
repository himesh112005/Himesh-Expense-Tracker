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
        background: "#09090b",
        surface: {
          DEFAULT: "#121215",
          subtle: "#18181b",
          border: "#27272a",
        },
        accent: {
          DEFAULT: "#10b981", // Single solid emerald accent
          hover: "#059669",
          muted: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.3)",
          light: "#34d399",
        },
      },
      fontFamily: {
        heading: ["'Plus Jakarta Sans'", "sans-serif"],
        sans: ["'DM Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.02em",
      },
      lineHeight: {
        heading: "1.15",
        body: "1.65",
      },
    },
  },
  plugins: [],
};
export default config;
