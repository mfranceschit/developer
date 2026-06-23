import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../Input/Input';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  args: {
    label: 'Email',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const WithHint: Story = {
  args: { hint: "I'll never share your address." },
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const Required: Story = {
  args: { required: true },
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const WithError: Story = {
  args: { error: 'Enter a valid email address.' },
  render: (args) => (
    <FormField {...args}>
      <Input type="email" defaultValue="not-an-email" />
    </FormField>
  ),
};

export const Message: Story = {
  args: { label: 'Message' },
  render: (args) => (
    <FormField {...args}>
      <Input as="textarea" placeholder="Tell me about your project…" />
    </FormField>
  ),
};
