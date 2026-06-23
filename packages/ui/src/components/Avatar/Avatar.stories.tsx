import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Sand: Story = {
  args: { skin: 'sand' },
};

export const Navy: Story = {
  args: { skin: 'navy' },
};

export const Berry: Story = {
  args: { skin: 'berry' },
};

export const Initials: Story = {
  args: { skin: 'navy', initials: 'MF' },
};

export const Small: Story = {
  args: { size: 'sm', skin: 'navy' },
};

export const Large: Story = {
  args: { size: 'lg', skin: 'navy' },
};

export const ExtraLarge: Story = {
  args: { size: 'xl', skin: 'navy' },
};

export const CustomSize: Story = {
  args: { size: 120, skin: 'berry' },
};
