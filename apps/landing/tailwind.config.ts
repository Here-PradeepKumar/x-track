import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0e0e0e",
        surface: "#131313",
        "surface-high": "#1a1919",
        "surface-highest": "#262626",
        lime: "#cafd00",
        "lime-dim": "#beee00",
        cyan: "#00eefc",
        "cyan-dim": "#00deec",
        "on-surface": "#ffffff",
        "on-surface-variant": "#adaaaa",
        outline: "#494847",
      },
      fontFamily: {
        display: ["var(--font-barlow)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "ticker-left": "ticker-left 30s linear infinite",
        "fade-up": "fade-up 0.7s ease-out forwards",
        "pulse-lime": "pulse-lime 3s ease-in-out infinite",
        "spin-slow": "spin 12s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "ticker-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-lime": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
