/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#07090F',
        'brand-surface': '#0D1120',
        'brand-primary': '#7C3AED',
        'brand-cyan': '#22D3EE',
        'brand-card': '#121827',
      },
      fontFamily: {
        'syne': ['"Playfair Display"', '"Times New Roman"', 'serif'],
        'space': ['Space Grotesk', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
