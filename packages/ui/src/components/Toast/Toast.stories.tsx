import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { createToaster, Toaster } from './Toast';

const toaster = createToaster({ placement: 'bottom-end' });

const meta: Meta<typeof Toaster> = {
  title: 'Components/Toast',
  component: Toaster,
  args: { toaster },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: (args) => (
    <div>
      <Button onClick={() => toaster.create({ title: 'Saved', type: 'success' })}>
        Show success toast
      </Button>
      <Toaster {...args} />
    </div>
  ),
};
