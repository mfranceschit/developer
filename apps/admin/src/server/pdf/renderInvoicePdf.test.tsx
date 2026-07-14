import { describe, expect, it } from 'vitest';
import type { Invoice } from '@/shared/types';
import { renderInvoicePdf } from './renderInvoicePdf';

const invoice: Invoice = {
  _id: 'inv-1',
  _type: 'invoice',
  seq: 7,
  issuerSnapshot: { name: 'Me', taxId: 'X1', address: 'Street 1', phone: '+1', email: 'me@x.com' },
  client: { _ref: 'client-1', _type: 'reference' },
  clientSnapshot: { name: 'Acme', email: 'a@x.com', phone: '+2', address: 'Ave 2', currency: 'USD' },
  issueDate: '2026-06-30',
  currency: 'USD',
  lineItems: [{ quantity: 1, description: 'Software Development', unitPrice: 5750 }],
  taxRate: 0,
  status: 'draft',
  totals: { subtotal: 5750, vat: 0, total: 5750 },
};

describe('renderInvoicePdf', () => {
  it('renders an invoice to a PDF buffer', async () => {
    const buffer = await renderInvoicePdf(invoice);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});
