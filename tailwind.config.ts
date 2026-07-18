import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    {
      pattern: /^(m|p|mt|mb|ml|mr|pt|pb|pl|pr|w|h|max-w|min-h)-/,
    },
    {
      pattern: /^(text|bg|border)-(slate|blue|purple|green|red|yellow|orange|pink|cyan|white|black)/,
    },
    {
      pattern: /^(flex|grid|gap|items|justify|hidden|block|inline-block|rounded|shadow)/,
    },
    'prose',
    'prose-invert',
    'max-w-none',
    'dark:prose-invert'
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
