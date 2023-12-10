import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || '';

export default defineConfig({
  projectId,
  dataset,
  title: 'Portfolio',
  apiVersion: '2023-12-08',
  basePath: '/admin',
  plugins: [deskTool()],
});
