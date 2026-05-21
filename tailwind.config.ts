import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        risk: {
          red: "#dc2626",
          yellow: "#d97706",
          green: "#16a34a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
