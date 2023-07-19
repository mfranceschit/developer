import { LanguageContext } from '@/context';
import { LOCALES } from '@/types';

import { useContext } from 'react';

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('`useLanguage` must be used within `LanguageProvider`');
  }

  return context[LOCALES.en as LOCALES];
};
