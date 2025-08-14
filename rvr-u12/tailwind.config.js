import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{css,scss}"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Raleway", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#005C99",   // Deep blue
        secondary: "#0099CC", // Light blue
        accent: "#F5B700",    // Yellow accent
      },
      backgroundImage: {
        "blue-gradient": "linear-gradient(135deg, #005C99 0%, #0099CC 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
