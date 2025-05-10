/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // THIS IS CRITICAL
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Add Inter as the default sans-serif font
      },
    },
  },
  plugins: [],
};
