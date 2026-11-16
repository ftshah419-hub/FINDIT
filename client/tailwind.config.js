/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#101C36',
          primary: '#2457E8',
          accent: '#4D8DFF',
          bg: '#F4F7FC',
          surface: '#FFFFFF',
          border: '#DCE4F0',
          secondary: '#64748B',
          // Dark mode extensions
          'dark-bg': '#0B1220',
          'dark-surface': '#151F30',
          'dark-surface-2': '#1D2A40',
          'dark-text': '#F8FAFC',
          'dark-secondary': '#A8B5CA',
          'dark-border': '#29364A',
          'dark-primary': '#4D8DFF',
          'dark-accent': '#79A9FF',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
