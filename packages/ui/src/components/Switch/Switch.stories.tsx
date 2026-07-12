import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    label: 'Show unpublished',
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Off: Story = {
  args: { defaultChecked: false },
};

export const On: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { defaultChecked: false, disabled: true },
};
