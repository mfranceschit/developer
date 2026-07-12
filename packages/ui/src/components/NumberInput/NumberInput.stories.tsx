import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: { defaultValue: '1', min: 0, step: 1 },
};

export const Currency: Story = {
  args: { defaultValue: '100.00', min: 0, step: 0.01 },
};

export const Disabled: Story = {
  args: { defaultValue: '1', disabled: true },
};
