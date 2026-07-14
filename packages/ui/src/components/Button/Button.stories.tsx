import type { Meta, StoryObj } from '@storybook/react-vite';
import { darkPanel } from '../../storybook/decorators';
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

/* Dark "Marea" variants — rendered over the dark page surface. */

export const Glass: Story = {
  args: { variant: 'glass', children: 'Proyectos' },
  decorators: [darkPanel],
};

export const Gradient: Story = {
  args: { variant: 'gradient', children: '¡Hablemos!' },
  decorators: [darkPanel],
};

export const TintAccent: Story = {
  args: { variant: 'tint-accent', children: '↗ Live site' },
  decorators: [darkPanel],
};

export const TintNeutral: Story = {
  args: { variant: 'tint-neutral', children: '★ Repository' },
  decorators: [darkPanel],
};

export const OnDark: Story = {
  args: { variant: 'on-dark', children: 'New invoice' },
  decorators: [darkPanel],
};

export const HeroActions: Story = {
  decorators: [darkPanel],
  render: () => (
    <div className="flex items-center gap-[14px]">
      <Button variant="glass" size="lg">
        Proyectos
      </Button>
      <Button variant="gradient" size="lg">
        ¡Hablemos!
      </Button>
    </div>
  ),
};

export const DetailActions: Story = {
  decorators: [darkPanel],
  render: () => (
    <div className="flex gap-[14px]">
      <Button variant="tint-accent">↗ Live site</Button>
      <Button variant="tint-neutral">★ Repository</Button>
    </div>
  ),
};
