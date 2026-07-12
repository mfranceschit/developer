import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const CURRENCIES = ['USD', 'EUR', 'GBP'];

const meta: Meta<typeof Select<string>> = {
  title: 'Components/Select',
  component: Select<string>,
  args: {
    items: CURRENCIES,
    itemToString: (item: string) => item,
    itemToValue: (item: string) => item,
    placeholder: 'Select currency',
  },
};

export default meta;
type Story = StoryObj<typeof Select<string>>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: ['USD'] },
};

export const Disabled: Story = {
  args: { disabled: true },
};
