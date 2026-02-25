/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c2d4ff',
          300: '#93b4fe',
          400: '#6090fc',
          500: '#3b6ef8',
          600: '#2451ed',
          700: '#1c3ed9',
          800: '#1c33af',
          900: '#1c2f8a',
          950: '#141e5c',
        },
      },
    },
  },
  plugins: [],
}
