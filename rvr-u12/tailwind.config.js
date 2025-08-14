/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Raleway", "sans-serif"], // Main font
        body: ["Open Sans", "sans-serif"], // For body text
      },
      colors: {
        primary: "#005C99", // Deep blue from your template
        secondary: "#0099CC", // Accent light blue
        accent: "#F5B700", // Optional yellow accent
      },
    },
  },
  plugins: [],
};
