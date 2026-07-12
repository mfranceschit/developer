import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    fetch: vi.fn(),
    create: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { draftSanityClient } from './client';
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  listInvoices,
  nextInvoiceSeq,
  patchInvoice,
} from './invoices';

const fetchMock = vi.mocked(draftSanityClient.fetch) as unknown as ReturnType<
  typeof vi.fn<(query: string, params?: Record<string, unknown>) => Promise<unknown>>
>;

describe('nextInvoiceSeq', () => {
  it('returns 1 when no invoices exist for the year', async () => {
    fetchMock.mockResolvedValue([]);
    expect(await nextInvoiceSeq(2026)).toBe(1);
  });

  it('returns max seq + 1 for matching-year invoices, ignoring other years', async () => {
    fetchMock.mockResolvedValue([
      { seq: 3, issueDate: '2026-01-01' },
      { seq: 7, issueDate: '2026-06-01' },
      { seq: 99, issueDate: '2025-01-01' },
    ]);
    expect(await nextInvoiceSeq(2026)).toBe(8);
  });
});

describe('createInvoice', () => {
  it('assigns an id and the next seq, then creates the document', async () => {
    fetchMock.mockResolvedValue([{ seq: 2, issueDate: '2026-01-01' }]);
    vi.mocked(draftSanityClient.create).mockImplementation(async (doc) => doc as never);

    const result = await createInvoice({
      issuerSnapshot: { name: 'Me', address: 'A', phone: 'P', email: 'e@x.com' },
      client: { _ref: 'client-1', _type: 'reference' },
      clientSnapshot: { name: 'Acme', email: 'a@x.com', phone: 'P', address: 'A', currency: 'USD' },
      issueDate: '2026-07-12',
      currency: 'USD',
      lineItems: [],
      taxRate: 0,
      status: 'draft',
      totals: { subtotal: 0, vat: 0, total: 0 },
    });

    expect(result.seq).toBe(3);
    expect(draftSanityClient.create).toHaveBeenCalledWith(
      expect.objectContaining({ _type: 'invoice', seq: 3 }),
    );
  });
});

describe('patchInvoice', () => {
  it('patches the plain (non-drafts.) id', async () => {
    const commitMock = vi.fn(async () => ({ _id: 'inv-1', status: 'sent' }));
    const setMock = vi.fn(() => ({ commit: commitMock }));
    vi.mocked(draftSanityClient.patch).mockReturnValue({ set: setMock } as never);

    await patchInvoice('inv-1', { status: 'sent' });

    expect(draftSanityClient.patch).toHaveBeenCalledWith('inv-1');
    expect(setMock).toHaveBeenCalledWith({ status: 'sent' });
  });
});

describe('deleteInvoice', () => {
  it('deletes the plain (non-drafts.) id', async () => {
    await deleteInvoice('inv-1');
    expect(draftSanityClient.delete).toHaveBeenCalledWith('inv-1');
  });
});

describe('listInvoices / getInvoice', () => {
  it('lists all invoices', async () => {
    fetchMock.mockResolvedValue([{ _id: 'inv-1' }]);
    const result = await listInvoices();
    expect(result).toEqual([{ _id: 'inv-1' }]);
  });

  it('gets a single invoice by id or returns null', async () => {
    fetchMock.mockResolvedValueOnce([{ _id: 'inv-1' }]);
    expect(await getInvoice('inv-1')).toEqual({ _id: 'inv-1' });

    fetchMock.mockResolvedValueOnce([]);
    expect(await getInvoice('missing')).toBeNull();
  });
});
