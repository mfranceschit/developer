import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { documentInternationalization } from '@sanity/document-internationalization';

import schemas from './sanity/schemas';
import { dataset, projectId } from './constants/environment';
import documentInternationalizationConfig from './sanity/config/document-i18n-config';

export default defineConfig({
  projectId,
  dataset,
  title: 'Portfolio',
  apiVersion: '2023-12-08',
  basePath: '/admin',
  plugins: [
    deskTool(),
    visionTool(),
    documentInternationalization(documentInternationalizationConfig),
  ],
  schema: { types: schemas },
});
