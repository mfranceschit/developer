import { Field } from '@ark-ui/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  decorators: [
    (Story, ctx) => (
      <Field.Root invalid={Boolean(ctx.parameters.invalid)} style={{ maxWidth: 320 }}>
        <Story />
      </Field.Root>
    ),
  ],
  args: {
    placeholder: 'you@example.com',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: 'developer@mfranceschit.com' },
};

export const Invalid: Story = {
  args: { defaultValue: 'not-an-email' },
  parameters: { invalid: true },
};

export const Disabled: Story = {
  args: { defaultValue: 'developer@mfranceschit.com', disabled: true },
};

export const Textarea: Story = {
  args: { as: 'textarea', placeholder: 'Tell me about your project…' },
};
