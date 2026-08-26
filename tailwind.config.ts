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
        background: "#0A0E17",
        surface: {
          DEFAULT: "#111827",
          subtle: "#0D131F",
          elevated: "#182234",
          card: "#131C2C",
          hover: "#1D2A40",
          border: "#202E44",
          borderLight: "#2E3E5B",
        },
        gpay: {
          blue: "#4285F4",
          blueDark: "#1A73E8",
          blueLight: "#8AB4F8",
          blueBg: "rgba(66, 133, 244, 0.12)",
          green: "#34A853",
          greenDark: "#1E8E3E",
          greenLight: "#81C995",
          greenBg: "rgba(52, 168, 83, 0.12)",
          yellow: "#FBBC04",
          yellowDark: "#F9AB00",
          yellowLight: "#FDD663",
          yellowBg: "rgba(251, 188, 4, 0.12)",
          red: "#EA4335",
          redDark: "#D93025",
          redLight: "#F28B82",
          redBg: "rgba(234, 67, 53, 0.12)",
        },
        panel: "#131C2C",
        panelHover: "#1D2A40",
        panelBorder: "#202E44",
        panelBorderSubtle: "#2E3E5B",
      },
      fontFamily: {
        sans: [
          "Google Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "gpay-card": "0 2px 12px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.2)",
        "gpay-elevated": "0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 4px 8px -2px rgba(0, 0, 0, 0.3)",
        "gpay-glow-blue": "0 0 24px -4px rgba(66, 133, 244, 0.35)",
        "gpay-glow-green": "0 0 24px -4px rgba(52, 168, 83, 0.35)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
