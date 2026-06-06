import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
// Deployed to the GitHub Pages project URL: https://haimgo.github.io/huber-capital
// For a custom domain (huber-capital.co.il) later: set `site` to it, remove `base`, add public/CNAME.
export default defineConfig({
  site: 'https://haimgo.github.io',
  base: '/huber-capital',
  output: 'static',
  integrations: [tailwind()],
});
