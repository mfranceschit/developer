import { LanguageContext } from '@/context';

import { useRouter } from 'next/router';
import { useContext } from 'react';

enum LOCALES {
  en = 'en',
  es = 'es',
  pt = 'pt',
}



export const useLanguage = () => {
  const { locale } = useRouter()
  const context = useContext(LanguageContext)

  if (context === undefined) {
    throw new Error('`useLanguage` must be used within `LanguageProvider`')
  }

  return context[locale as LOCALES];
};

