import { supportedLanguages } from '@/sanity/config/languages';

export const localeContent = {
  title: 'Localized string',
  name: 'localeContent',
  type: 'object',
  fieldsets: [
    {
      title: 'Translations',
      name: 'translations',
      options: { collapsible: true },
    },
  ],
  // Dynamically define one field per language
  fields: supportedLanguages.map(lang => ({
    title: lang.title,
    name: lang.id,
    type: 'array',
    of: [{ type: 'block' }],
    fieldset: lang.isDefault ? null : 'translations',
  })),
};

export default localeContent;
