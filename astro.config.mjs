// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// The demo is published to https://digbycampbell.github.io/harrys-hunts/, so every
// internal link has to go through `base`. Use the `href()` helper in src/lib/paths.ts
// rather than hand-writing the prefix.
export default defineConfig({
  site: 'https://digbycampbell.github.io',
  base: '/harrys-hunts/',
  trailingSlash: 'always',
  integrations: [preact()],
  build: {
    // GitHub Pages serves static directories, so `/journeys/` must resolve to a file.
    format: 'directory',
  },
  vite: {
    build: {
      assetsInlineLimit: 1024,
    },
  },
});
