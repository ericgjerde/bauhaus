/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bauhaus: {
          red: '#E30613',
          blue: '#0057B8',
          yellow: '#FFCC00',
          black: '#1A1A1A',
        },
      },
    },
  },
  plugins: [],
};
