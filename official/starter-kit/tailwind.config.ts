import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-blue": "#0f3460",
        "brand-red":  "#e94560",
      },
    },
  },
  plugins: [],
};

export default config;
