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
        typora: {
          bg: '#ffffff',
          fg: '#333333',
          sidebar: '#f7f7f7',
          border: '#e0e0e0',
          accent: '#4880bd',
        }
      }
    },
  },
  plugins: [],
}
