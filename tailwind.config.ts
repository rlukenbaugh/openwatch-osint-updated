import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1536px"
      }
    },
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        panel: "hsl(var(--panel))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        danger: "hsl(var(--danger))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))"
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"]
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 10% 20%, rgba(8,145,178,0.2), transparent 35%), radial-gradient(circle at 90% 0%, rgba(251,146,60,0.18), transparent 35%)"
      },
      boxShadow: {
        panel: "0 10px 30px -14px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
