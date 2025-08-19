/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0ea5e9',
          foreground: '#0f172a',
        },
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
}