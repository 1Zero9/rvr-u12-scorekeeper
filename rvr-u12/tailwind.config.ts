/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Scan all src files for class names
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Raleway", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
