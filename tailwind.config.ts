import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: { marquee: "marquee 35s linear infinite" },
      keyframes: { 
        marquee: { 
          "0%": { transform: "translateX(0%)" }, 
          "100%": { transform: "translateX(-100%)" } 
        } 
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
