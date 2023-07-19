import { LOCALES } from './types';

export const getPathSlugs = () => {
  // We fetched locales from our API once at build time
  return [LOCALES.en, LOCALES.es, LOCALES.pt].map(locale => ({
    params: {
      locale,
    },
  }));
};
