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
        /* rgb + alpha so text-cream/80 etc. work on dark backgrounds */
        cream: "rgb(247 243 237 / <alpha-value>)",
        "cream-2": "rgb(239 233 223 / <alpha-value>)",
        white: "rgb(255 254 249 / <alpha-value>)",
        green: {
          DEFAULT: "var(--green)",
          2: "var(--green-2)",
          3: "var(--green-3)",
        },
        terra: {
          DEFAULT: "var(--terra)",
          2: "var(--terra-2)",
        },
        gold: "rgb(201 169 110 / <alpha-value>)",
        text: "var(--text)",
        muted: "var(--muted)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      transitionDuration: {
        "250": "250ms",
        "400": "400ms",
      },
      borderRadius: {
        sharp: "0",
        slight: "2px",
      },
      animation: {
        marquee: "marquee 45s linear infinite",
        "draw-stroke": "drawStroke 2s ease forwards",
        floatUp: "floatUp 0.8s ease-out forwards",
        "float-gentle": "floatGentle 5s ease-in-out infinite",
        "orb-drift": "orbDrift 18s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        drawStroke: {
          to: { strokeDashoffset: "0" },
        },
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        orbDrift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(12px, -16px) scale(1.05)" },
          "66%": { transform: "translate(-8px, 10px) scale(0.98)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-8px)" },
          "75%": { transform: "translateX(8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
