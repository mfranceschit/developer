import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Banner } from './Banner';

const meta: Meta<typeof Banner> = {
  title: 'Components/Banner',
  component: Banner,
  args: {
    title: 'Heads up',
    children: 'Something needs your attention before you can continue.',
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Info: Story = {
  args: { tone: 'info' },
};

export const Success: Story = {
  args: { tone: 'success' },
};

export const Warning: Story = {
  args: { tone: 'warning' },
};

export const Danger: Story = {
  args: { tone: 'danger' },
};

export const WithAction: Story = {
  args: {
    tone: 'warning',
    title: 'Set up your business profile first',
    children: 'Every invoice needs issuer details. Add your business profile before creating one.',
    action: <Button size="sm">Go to Business Profile</Button>,
  },
};
