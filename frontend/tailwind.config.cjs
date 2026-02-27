/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0A0F1C",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          dim: "#22D3EE20",
          mid: "#22D3EE30",
        },
        slate: {
          deep: "#0F172A",
        },
        paper: {
          warm: "rgba(255,248,240,0.03)",
          edge: "rgba(255,248,240,0.06)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        paper: "0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
        "paper-lg": "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        ink: "0 0 0 1px rgba(255,255,255,0.04)",
        glow: "0 0 20px rgba(34,211,238,0.08)",
      },
    },
  },
  plugins: [],
};
