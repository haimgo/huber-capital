/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        space: '#0b0a07',
        space2: '#100d09',
        fg: '#f1ebdf',
        mute: '#a59b86',
        cyan: '#ffd24a',
        magenta: '#ff9d2f',
        violet: '#d4a017',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Heebo', 'sans-serif'],
        mono: ['Orbitron', 'sans-serif'],
      },
      maxWidth: {
        container: '1200px',
      },
    },
  },
  plugins: [],
};
