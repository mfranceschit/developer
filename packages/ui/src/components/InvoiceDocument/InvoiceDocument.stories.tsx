import type { Meta, StoryObj } from '@storybook/react-vite';
import { InvoiceDocument } from './InvoiceDocument';

const meta: Meta<typeof InvoiceDocument> = {
  title: 'Components/InvoiceDocument',
  component: InvoiceDocument,
  args: {
    invoiceNumber: 'INV-2026-007',
    issueDate: '2026-07-12',
    issuer: {
      name: 'Marco Franceschi',
      taxId: '123456789',
      address: 'Street 1\nCity, Country',
      phone: '+1 555 0100',
      email: 'me@mfranceschit.com',
    },
    billTo: {
      name: 'Acme Inc',
      address: '123 Main St\nCity, Country',
      phone: '+1 555 0200',
      email: 'billing@acme.test',
    },
    lineItems: [
      { quantity: 10, description: 'Consulting hours', unitPrice: 100 },
      { quantity: 1, description: 'Design review', unitPrice: 250 },
    ],
    currency: 'USD',
    taxRate: 21,
    totals: { subtotal: 1250, vat: 262.5, total: 1512.5 },
  },
};

export default meta;
type Story = StoryObj<typeof InvoiceDocument>;

export const Default: Story = {};

export const WithNotes: Story = {
  args: { notes: 'Payment due within 30 days.' },
};
