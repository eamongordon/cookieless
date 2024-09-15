/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'dough': {
          '50': '#fcf9f0',
          '100': '#f8f1dc',
          '200': '#f0e0b8',
          '300': '#e3c47f',
          '400': '#dbac5c',
          '500': '#d2953d',
          '600': '#c47e32',
          '700': '#a3632b',
          '800': '#835029',
          '900': '#6a4324',
          '950': '#392111',
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}

