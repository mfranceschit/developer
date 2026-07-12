import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Dialog } from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    title: 'Discard draft?',
    description: 'This will permanently delete your unpublished changes.',
    trigger: <Button variant="outline">Discard</Button>,
    children: <Button variant="accent">Confirm discard</Button>,
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
};
