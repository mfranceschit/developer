import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Click me',
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Accent: Story = {
  args: { variant: 'accent' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
};

export const Small: Story = {
  args: { variant: 'primary', size: 'sm' },
};

export const Large: Story = {
  args: { variant: 'accent', size: 'lg' },
};

export const WithIcons: Story = {
  args: { variant: 'outline', iconLeft: '↓', iconRight: '→' },
};

export const FullWidth: Story = {
  args: { variant: 'primary', fullWidth: true },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
};
