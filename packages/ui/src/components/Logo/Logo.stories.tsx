import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const Lockup: Story = {
  args: { variant: 'navy' },
};

export const Beige: Story = {
  args: { variant: 'beige' },
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--mf-bellwether-blue)', padding: 32 }}>
        <Story />
      </div>
    ),
  ],
};

export const Berry: Story = {
  args: { variant: 'berry' },
};

export const NoTagline: Story = {
  args: { variant: 'navy', tagline: false },
};

export const MonogramOnly: Story = {
  args: { variant: 'navy', lockup: false },
};

export const Large: Story = {
  args: { variant: 'navy', height: 120 },
};
