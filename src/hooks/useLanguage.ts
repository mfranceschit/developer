import english from '@/i18n/en';
import spanish from '@/i18n/es';
import portuguese from '@/i18n/pt';
import { useRouter } from 'next/router';

enum LOCALES {
  en = 'en',
  es = 'es',
  pt = 'pt',
}

const LANGUAGES = {
  en: english,
  es: spanish,
  pt: portuguese
}

export const useLanguage = () => {
  const { locale = LOCALES.en} = useRouter()
  return LANGUAGES[locale as LOCALES];
};
