import { describe, expect, it } from 'vitest';
import { buildDashboard } from './dashboard';
import type { Invoice } from '@/shared/types';

function invoice(over: Partial<Invoice>): Invoice {
  return {
    _id: 'i1',
    _type: 'invoice',
    seq: 1,
    issuerSnapshot: { name: 'Me', email: 'me@x.com' },
    client: { _ref: 'c1', _type: 'reference' },
    clientSnapshot: { name: 'Acme', email: 'a@acme.com', currency: 'USD' },
    issueDate: '2026-01-01',
    currency: 'USD',
    lineItems: [],
    taxRate: 0,
    status: 'draft',
    totals: { subtotal: 0, vat: 0, total: 0 },
    ...over,
  } as Invoice;
}

describe('buildDashboard', () => {
  it('collects non-published docs across types with normalized names', () => {
    const data = buildDashboard({
      projects: [
        { _id: 'p1', _status: 'draft', name: 'Marea' },
        { _id: 'p2', _status: 'published', name: 'Live' },
      ],
      certifications: [{ _id: 'c1', _status: 'unpublished-changes', name: 'AWS' }],
      degrees: [{ _id: 'd1', _status: 'draft', name: { en: 'BSc CS' } }],
      clients: [{ _id: 'cl1', _status: 'published', name: 'Acme' }],
      invoices: [],
    });
    expect(data.attention).toEqual([
      { id: 'p1', type: 'project', typeLabel: 'Project', name: 'Marea', status: 'draft' },
      { id: 'c1', type: 'certification', typeLabel: 'Certificate', name: 'AWS', status: 'unpublished-changes' },
      { id: 'd1', type: 'degree', typeLabel: 'Degree', name: 'BSc CS', status: 'draft' },
    ]);
    expect(data.counts).toEqual({ projects: 2, certifications: 1, degrees: 1, clients: 1, invoices: 0 });
  });

  it('sums only sent invoices into the outstanding total', () => {
    const data = buildDashboard({
      projects: [], certifications: [], degrees: [], clients: [],
      invoices: [
        invoice({ _id: 'a', status: 'sent', currency: 'USD', totals: { subtotal: 100, vat: 0, total: 100 } }),
        invoice({ _id: 'b', status: 'paid', currency: 'USD', totals: { subtotal: 50, vat: 0, total: 50 } }),
        invoice({ _id: 'c', status: 'sent', currency: 'USD', totals: { subtotal: 25, vat: 0, total: 25 } }),
      ],
    });
    expect(data.outstandingTotal).toEqual({ amount: 125, currency: 'USD' });
  });

  it('flags mixed currencies and defaults empty to USD', () => {
    const mixed = buildDashboard({
      projects: [], certifications: [], degrees: [], clients: [],
      invoices: [
        invoice({ _id: 'a', status: 'sent', currency: 'USD', totals: { subtotal: 10, vat: 0, total: 10 } }),
        invoice({ _id: 'b', status: 'sent', currency: 'EUR', totals: { subtotal: 20, vat: 0, total: 20 } }),
      ],
    });
    expect(mixed.outstandingTotal).toEqual({ amount: 30, currency: 'mixed' });

    const empty = buildDashboard({
      projects: [], certifications: [], degrees: [], clients: [], invoices: [],
    });
    expect(empty.outstandingTotal).toEqual({ amount: 0, currency: 'USD' });
  });

  it('returns recent invoices newest-first, capped at 3, with formatted number', () => {
    const data = buildDashboard({
      projects: [], certifications: [], degrees: [], clients: [],
      invoices: [
        invoice({ _id: 'a', seq: 1, issueDate: '2026-01-01' }),
        invoice({ _id: 'b', seq: 2, issueDate: '2026-03-01' }),
        invoice({ _id: 'c', seq: 3, issueDate: '2026-02-01' }),
        invoice({ _id: 'd', seq: 4, issueDate: '2026-04-01' }),
      ],
    });
    expect(data.recentInvoices.map((r) => r.id)).toEqual(['d', 'b', 'c']);
    expect(data.recentInvoices[0].number).toBe('INV-2026-004');
    expect(data.recentInvoices[0].clientName).toBe('Acme');
  });
});
