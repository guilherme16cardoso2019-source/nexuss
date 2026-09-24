import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#0A0A0A",
          surface: "#161616",
          border: "#2A2A2A",
          primary: "#FF6A00",
          primaryLight: "#FF8C33",
          accent: "#FFA500",
          text: "#F5F5F0",
          textMuted: "#A0A0A0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
