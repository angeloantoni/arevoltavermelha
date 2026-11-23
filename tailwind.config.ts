import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "rev-white": "#FFFFFF",
        "rev-black": "#111111",
        "rev-red": "#C81E1E",
        "rev-muted": "#525252",
        "rev-border-light": "#E5E5E5",
        "rev-border-hard": "#111111",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      maxWidth: {
        editorial: "1400px",
        reader: "68ch",
      },
      boxShadow: {
        brutalist: "4px 4px 0px #111111",
        "brutalist-sm": "2px 2px 0px #111111",
        "brutalist-red": "4px 4px 0px #C81E1E",
        "brutalist-white": "4px 4px 0px #FFFFFF",
      },
    },
  },
  plugins: [],
} satisfies Config;

