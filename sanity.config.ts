import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';

import schemas from './sanity/schemas';
import { dataset, projectId } from './constants/environment';
import { languageFilter } from '@sanity/language-filter';

export default defineConfig({
  projectId,
  dataset,
  title: 'Portfolio',
  apiVersion: '2023-12-08',
  basePath: '/admin',
  plugins: [
    deskTool(),
    visionTool(),
    languageFilter({
      supportedLanguages: [
        { id: 'en', title: 'English' },
        { id: 'es', title: 'Spanish' },
        { id: 'pt', title: 'Portuguese' },
      ],
      defaultLanguages: ['en'],
      documentTypes: ['page'],
      filterField: (enclosingType, member, selectedLanguageIds) =>
        !enclosingType.name.startsWith('locale') ||
        selectedLanguageIds.includes(member.name),
    }),
  ],
  schema: { types: schemas },
});
