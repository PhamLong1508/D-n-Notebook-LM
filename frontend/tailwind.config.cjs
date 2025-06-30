/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Google Sans',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 32px 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

