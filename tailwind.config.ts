import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cs: {
          bg: "#080C12", deep: "#050810", card: "#0E1319", "card-hover": "#131A22",
          panel: "#1A2030", line: "#1A1F2B",
          gold: "#C49767", "gold-light": "#D4A87A", "gold-dim": "#90714F", "gold-muted": "#6B5A42",
          bronze: "#AC865C",
          text: "#D8D0C6", muted: "#706860", dim: "#403830", white: "#F0EBE5",
          red: "#8B3030", green: "#3B6B3B",
        },
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
        mono: ["Space Mono", "monospace"],
        body: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
