import { ui, defaultLang } from './ui';
import type { Locale } from './ui';

export type { Locale };

export const locales: Locale[] = ['en', 'es', 'pt'];

export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as Locale;
  return defaultLang;
}

export function useTranslations(lang: Locale) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: Locale) {
  return function translatePath(path: string): string {
    return `/${lang}${path}`;
  };
}

export function getStaticLocalePaths() {
  return locales.map((locale) => ({ params: { locale } }));
}
