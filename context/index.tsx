import { createContext, ReactNode, useState } from 'react';

import english from '@/i18n/en';
import spanish from '@/i18n/es';
import portuguese from '@/i18n/pt';
import { LOCALES } from '@/types';
import { useRouter } from 'next/router';

const LANGUAGES = {
  en: english,
  es: spanish,
  pt: portuguese,
};

export type LanguageValue = {
  content: any;
  selectedLanguage: LOCALES;
  changeLanguage: (direction: string) => void;
};

export const LanguageContext = createContext<LanguageValue>(
  {} as LanguageValue,
);

interface Props {
  children: ReactNode;
}

const LanguageProvider = ({ children }: Props) => {
  const { locale, locales = [] } = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(0);

  const changeLanguage = (direction: string) => {
    if (direction === 'back' && selectedLanguage > 0) {
      setSelectedLanguage(selectedLanguage - 1);
    }

    if (direction === 'next' && selectedLanguage < locales.length - 1) {
      setSelectedLanguage(selectedLanguage + 1);
    }
  };

  const LanguageContextValue = {
    content: LANGUAGES[locale as LOCALES],
    selectedLanguage: locale,
    changeLanguage,
  } as LanguageValue;

  return (
    <LanguageContext.Provider value={LanguageContextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
