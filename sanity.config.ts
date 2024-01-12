import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { languageFilter } from '@sanity/language-filter';

import schemas from '@/sanity/schemas';
import logoPlugin from '@/sanity/layout/logo.plugin';
import { structure } from '@/sanity/layout/structure';
import { dataset, projectId } from './constants/environment';

export default defineConfig({
  projectId,
  dataset,
  title: 'Portfolio',
  apiVersion: '2023-12-08',
  basePath: '/admin',
  plugins: [
    deskTool({
      structure,
    }),
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
    logoPlugin(),
  ],
  schema: { types: schemas },
});
