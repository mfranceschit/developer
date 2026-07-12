import { describe, expect, it } from 'vitest';
import { calculateInvoiceTotals } from './invoiceTotals';

describe('calculateInvoiceTotals', () => {
  it('computes subtotal, vat, and total for multiple line items', () => {
    const result = calculateInvoiceTotals(
      [
        { quantity: 2, description: 'Consulting', unitPrice: 100 },
        { quantity: 1, description: 'Design', unitPrice: 50 },
      ],
      21,
    );
    expect(result).toEqual({ subtotal: 250, vat: 52.5, total: 302.5 });
  });

  it('returns zeroes for an empty line item list', () => {
    expect(calculateInvoiceTotals([], 21)).toEqual({ subtotal: 0, vat: 0, total: 0 });
  });

  it('handles a zero tax rate', () => {
    const result = calculateInvoiceTotals(
      [{ quantity: 1, description: 'Consulting', unitPrice: 100 }],
      0,
    );
    expect(result).toEqual({ subtotal: 100, vat: 0, total: 100 });
  });

  it('rounds to two decimal places', () => {
    const result = calculateInvoiceTotals(
      [{ quantity: 3, description: 'Item', unitPrice: 33.33 }],
      15,
    );
    expect(result).toEqual({ subtotal: 99.99, vat: 15, total: 114.99 });
  });
});
