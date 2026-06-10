import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// SSR on Vercel. Public content is fetched from Supabase at request time;
// /admin is auth-guarded. (Base path removed — served at the domain root.)
// i18n: Hebrew at the root, Russian under /ru via src/pages/ru/[...slug].astro
// (a real route → correct 200 status on Vercel) which rewrites to the Hebrew
// page; language is exposed through Astro.locals.lang (set in middleware).
export default defineConfig({
  site: 'https://huber-capital.co.il',
  output: 'server',
  adapter: vercel(),
  integrations: [preact()],
  // Tailwind v4 is a Vite plugin (the @astrojs/tailwind integration was removed
  // because it does not support Astro 6). Theme tokens live in src/styles/global.css.
  vite: { plugins: [tailwindcss()] },
});
