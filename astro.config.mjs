import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
// SSR on Vercel. Public content is fetched from Supabase at request time;
// /admin is auth-guarded. (Base path removed — served at the domain root.)
export default defineConfig({
  site: 'https://huber-capital.co.il',
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind(), preact()],
});
