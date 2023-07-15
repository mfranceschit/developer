import { createContext, ReactNode } from 'react';

import english from '@/i18n/en';
import spanish from '@/i18n/es';
import portuguese from '@/i18n/pt';

const LANGUAGES = {
  en: english,
  es: spanish,
  pt: portuguese,
};

export type LanguageValue = {
  en: any;
  es: any;
  pt: any;
};

export const LanguageContext = createContext<LanguageValue>(
  {} as LanguageValue,
);

interface Props {
  children: ReactNode;
}

const LanguageProvider = ({ children }: Props) => {
  return (
    <LanguageContext.Provider value={LANGUAGES}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
