import { Input } from '../Input/Input';
import { Tabs } from '../Tabs/Tabs';

export type SupportedLocale = 'en' | 'es' | 'pt';

const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

export type LocaleFieldProps = {
  value: Record<SupportedLocale, string>;
  onValueChange: (locale: SupportedLocale, value: string) => void;
  label?: string;
  multiline?: boolean;
  className?: string;
};

export function LocaleField({
  value,
  onValueChange,
  multiline = false,
  className = '',
}: LocaleFieldProps) {
  const locales: SupportedLocale[] = ['en', 'es', 'pt'];

  return (
    <Tabs
      className={className}
      items={locales.map((locale) => ({
        value: locale,
        label: LOCALE_LABELS[locale],
        content: multiline ? (
          <Input
            as="textarea"
            value={value[locale]}
            onChange={(event) => onValueChange(locale, event.target.value)}
          />
        ) : (
          <Input
            value={value[locale]}
            onChange={(event) => onValueChange(locale, event.target.value)}
          />
        ),
      }))}
    />
  );
}
