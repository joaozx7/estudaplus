import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f8fafc",
        brand: {
          50: "#eefdf5",
          100: "#d7fae6",
          200: "#b2f3d0",
          300: "#7de8b3",
          400: "#42d58e",
          500: "#18b86f",
          600: "#0f9659",
          700: "#0d7849",
          800: "#0f5f3c",
          900: "#0f3f2e"
        }
      },
      boxShadow: {
        soft: "0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
        glow: "0 0 20px rgba(24, 184, 111, 0.15)"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "slide-in-left": "slideInLeft 0.3s ease-out forwards",
        "bar-grow": "barGrow 0.8s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        barGrow: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        },
        shimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" }
        }
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
