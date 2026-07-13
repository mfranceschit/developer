import { describe, expect, it } from 'vitest';
import { formatDate, formatInvoiceNumber, formatMoney } from './format';

describe('formatMoney', () => {
  it('formats USD with two decimals', () => {
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50');
  });

  it('formats EUR with the euro symbol', () => {
    expect(formatMoney(99, 'EUR')).toBe('€99.00');
  });
});

describe('formatDate', () => {
  it('formats an ISO date as YYYY-MM-DD unchanged', () => {
    expect(formatDate('2026-07-12')).toBe('2026-07-12');
  });
});

describe('formatInvoiceNumber', () => {
  it('formats the year and zero-padded sequence', () => {
    expect(formatInvoiceNumber({ issueDate: '2026-07-12', seq: 7 })).toBe('INV-2026-007');
  });
});
