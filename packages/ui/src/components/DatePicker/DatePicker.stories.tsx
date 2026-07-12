import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: '2026-07-12' },
};

export const Disabled: Story = {
  args: { disabled: true },
};
