import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';

export default defineConfig({
  integrations: [
    react(),
    svelte(),
    tailwind(),
    sanity({
      projectId: import.meta.env.SANITY_PROJECT_ID,
      dataset: import.meta.env.SANITY_DATASET,
      apiVersion: import.meta.env.SANITY_API_VERSION ?? '2023-12-08',
      useCdn: false,
    }),
  ],
});
