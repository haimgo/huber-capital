import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
// NOTE: @astrojs/sitemap is re-added in Phase 3 (Task 3.1) after resolving a build:done hook issue.

// https://astro.build/config
export default defineConfig({
  // TODO (Phase 5): set to the GitHub Pages URL or custom domain (e.g. https://huber-capital.co.il)
  site: 'https://huber-capital.co.il',
  output: 'static',
  integrations: [tailwind()],
});
