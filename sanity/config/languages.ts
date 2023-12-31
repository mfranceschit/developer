export const supportedLanguages = [
  { id: 'en', title: 'English', isDefault: true },
  { id: 'es', title: 'Spanish' },
  { id: 'pt', title: 'Portuguese' },
];

export const baseLanguage = supportedLanguages.find(l => l.isDefault);
