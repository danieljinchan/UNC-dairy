import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // UNC Dairy brand palette
        navy: "#1b2f66", // primary — sidebar, headers
        "mid-blue": "#2f4a9e", // secondary
        sky: "#8fd4ef", // accent / highlight
        "pale-blue": "#dff0fa", // secondary accent surface
        bone: "#f6f4ee", // page background
        // Risk colors (kept, tuned to brand)
        risk: {
          red: "#e23b3b",
          amber: "#f0a500",
          green: "#3aa86b",
        },
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(27, 47, 102, 0.08), 0 1px 2px 0 rgba(27, 47, 102, 0.04)",
        "card-hover":
          "0 8px 24px -4px rgba(27, 47, 102, 0.16), 0 2px 6px 0 rgba(27, 47, 102, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
