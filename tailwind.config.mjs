/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx,vue,svelte}'],
  theme: {
    extend: {
      colors: {
        emer: '#0e241d',
        panel: '#123026',
        deep: '#0a1b13',
        ivory: '#ece6da',
        mute: '#93a89d',
        gold: '#c8aa6e',
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        head: ['"Frank Ruhl Libre"', 'serif'],
        body: ['Assistant', 'sans-serif'],
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
};
