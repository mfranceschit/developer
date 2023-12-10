import { useContext } from 'react';

import { LanguageContext } from '@/context';

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('`useLanguage` must be used within `LanguageProvider`');
  }

  return context;
};
