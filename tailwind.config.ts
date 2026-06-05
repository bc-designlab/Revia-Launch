import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        social: {
          blue: "#0078F4",
        },
        revia: {
          purple: "#3A0CA3",
          lavender: "#B8B5FF",
          sky: "#E8F1FF",
          mist: "#F4F2FF",
          ink: "#0F1330",
          slate: "#5B6184",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      backgroundImage: {
        "ethereal":
          "radial-gradient(at 20% 20%, rgba(0,120,244,0.18) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(184,181,255,0.35) 0px, transparent 50%), radial-gradient(at 60% 90%, rgba(58,12,163,0.18) 0px, transparent 50%)",
        "glass":
          "linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.45) 100%)",
      },
      boxShadow: {
        glass:
          "0 1px 0 0 rgba(255,255,255,0.9) inset, 0 20px 60px -20px rgba(58,12,163,0.25), 0 8px 24px -12px rgba(0,120,244,0.18)",
        soft: "0 2px 12px rgba(15,19,48,0.06)",
        lift: "0 30px 80px -30px rgba(58,12,163,0.35)",
      },
      animation: {
        "float-slow": "float 12s ease-in-out infinite",
        "float-med": "float 9s ease-in-out infinite",
        "float-fast": "float 6s ease-in-out infinite",
        "drift": "drift 18s ease-in-out infinite",
        "pulse-ring": "pulseRing 3s ease-out infinite",
        "shimmer": "shimmer 2.4s linear infinite",
        "spin-slow": "spin 14s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "33%": { transform: "translate3d(20px,-12px,0)" },
          "66%": { transform: "translate3d(-16px,10px,0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.85)", opacity: "0.65" },
          "70%": { transform: "scale(1.25)", opacity: "0" },
          "100%": { transform: "scale(1.25)", opacity: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
