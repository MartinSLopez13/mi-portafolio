/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        santomate: {
          dark: '#1e4620',
          primary: '#2e7d32',
          light: '#4caf50',
          bg: '#f4f8f4',
          accent: '#8d6e63',
        },
      },
    },
  },
  plugins: [],
}