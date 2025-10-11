/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { light: '#B8B8B8', DEFAULT: '#141414', dark: '#0E0A0A', contrastText: '#fff' },
        netflixRed: '#E50914',
        // ... các màu khác
      },
      spacing: { 18: '4.5rem', 22: '5.5rem' },
      borderRadius: { xl: '1rem' },
      boxShadow: { 'netflix-md': '0 4px 12px rgba(0,0,0,0.6)' },
      fontSize: { '2xl-md': ['1.5rem','2rem'], '4xl-md': ['2.5rem','3rem'] },
    },
  },
  plugins: [],
};
