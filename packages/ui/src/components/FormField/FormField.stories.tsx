import type { Meta, StoryObj } from '@storybook/react-vite';
import { darkPanel } from '../../storybook/decorators';
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

/* Dark "Marea" surface — label, required mark and control follow the theme tokens. */
export const Dark: Story = {
  args: { label: 'Email', required: true },
  decorators: [darkPanel],
  render: (args) => (
    <FormField {...args}>
      <Input type="email" placeholder="you@example.com" />
    </FormField>
  ),
};

export const DarkContactForm: Story = {
  decorators: [darkPanel],
  render: () => (
    <div className="flex flex-col gap-[18px]" style={{ maxWidth: 480 }}>
      <FormField label="Nombre" required>
        <Input placeholder="Your name" />
      </FormField>
      <FormField label="Email" required>
        <Input type="email" placeholder="you@example.com" />
      </FormField>
      <FormField label="Mensaje" required>
        <Input as="textarea" placeholder="Tell me about your project…" className="min-h-[110px]" />
      </FormField>
    </div>
  ),
};
