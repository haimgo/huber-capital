/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        space: '#05060f',
        space2: '#0a0b1a',
        fg: '#e7ecff',
        mute: '#8893b5',
        cyan: '#2ee6ff',
        magenta: '#e23bff',
        violet: '#a855f7',
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
