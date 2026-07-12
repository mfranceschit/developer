import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { SupportedLocale } from './LocaleField';
import { LocaleField } from './LocaleField';

const meta: Meta<typeof LocaleField> = {
  title: 'Components/LocaleField',
  component: LocaleField,
};

export default meta;
type Story = StoryObj<typeof LocaleField>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState({ en: 'Issued', es: 'Emitido', pt: 'Emitido' });
    return (
      <LocaleField
        value={value}
        onValueChange={(locale: SupportedLocale, next: string) =>
          setValue((prev) => ({ ...prev, [locale]: next }))
        }
      />
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState({ en: 'Issued', es: 'Emitido', pt: 'Emitido' });
    return (
      <LocaleField
        label="Status label"
        value={value}
        onValueChange={(locale: SupportedLocale, next: string) =>
          setValue((prev) => ({ ...prev, [locale]: next }))
        }
      />
    );
  },
};

export const Multiline: Story = {
  render: () => {
    const [value, setValue] = useState({ en: '', es: '', pt: '' });
    return (
      <LocaleField
        multiline
        value={value}
        onValueChange={(locale: SupportedLocale, next: string) =>
          setValue((prev) => ({ ...prev, [locale]: next }))
        }
      />
    );
  },
};
