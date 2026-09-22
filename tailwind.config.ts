import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#0B0F1A",
          surface: "#121826",
          border: "#1E2739",
          primary: "#5B6CFF",
          primaryLight: "#8B96FF",
          accent: "#00D9C0",
          text: "#E7EAF3",
          textMuted: "#8B93A7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
