import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
};
export default meta;

type Locale = 'en' | 'es' | 'pt';

export const Locales: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Locale>('en');
    return (
      <SegmentedControl<Locale>
        aria-label="Locale"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'en', label: 'EN' },
          { value: 'es', label: 'ES' },
          { value: 'pt', label: 'PT' },
        ]}
      />
    );
  },
};

export const Small: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Locale>('en');
    return (
      <SegmentedControl<Locale>
        size="sm"
        aria-label="Locale"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'en', label: 'EN' },
          { value: 'es', label: 'ES' },
          { value: 'pt', label: 'PT' },
        ]}
      />
    );
  },
};
