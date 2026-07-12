import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from './Combobox';

const TECHNOLOGIES = ['TypeScript', 'React', 'Astro', 'Svelte', 'Tailwind'];

const meta: Meta<typeof Combobox<string>> = {
  title: 'Components/Combobox',
  component: Combobox<string>,
  args: {
    items: TECHNOLOGIES,
    itemToString: (item: string) => item,
    itemToValue: (item: string) => item,
    placeholder: 'Search technologies',
  },
};

export default meta;
type Story = StoryObj<typeof Combobox<string>>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
