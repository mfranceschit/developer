import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

import schemas from './sanity/schemas';
import { dataset, projectId } from './constants/environment';

export default defineConfig({
  projectId,
  dataset,
  title: 'Portfolio',
  apiVersion: '2023-12-08',
  basePath: '/admin',
  plugins: [deskTool()],
  schema: { types: schemas },
});
