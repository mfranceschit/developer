import { createContext, ReactNode, useState } from 'react';

import english from '@/i18n/en';
import spanish from '@/i18n/es';
import portuguese from '@/i18n/pt';
import { LOCALES } from '@/types';

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
  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const availableLanguages = [LOCALES.en, LOCALES.es, LOCALES.pt];

  const changeLanguage = (direction: string) => {
    if (direction === 'back' && selectedLanguage > 0) {
      setSelectedLanguage(selectedLanguage - 1);
    }

    if (
      direction === 'next' &&
      selectedLanguage < availableLanguages.length - 1
    ) {
      setSelectedLanguage(selectedLanguage + 1);
    }
  };

  const LanguageContextValue = {
    content: LANGUAGES[availableLanguages[selectedLanguage]],
    selectedLanguage: availableLanguages[selectedLanguage],
    changeLanguage,
  } as LanguageValue;

  return (
    <LanguageContext.Provider value={LanguageContextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
