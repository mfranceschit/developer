import path from 'node:path';
import { existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';

if (existsSync('.env')) {
  process.loadEnvFile();
}

export default defineConfig({
  output: 'static',
  integrations: [
    react(),
    svelte(),
    sanity({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET,
      apiVersion: process.env.SANITY_API_VERSION ?? '2023-12-08',
      useCdn: false,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});
