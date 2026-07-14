import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    fetch: vi.fn(),
    create: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('./upload', () => ({
  uploadFileAsset: vi.fn(async () => ({ _ref: 'file-abc-pdf', _type: 'reference' })),
}));

vi.mock('../pdf/renderInvoicePdf', () => ({
  renderInvoicePdf: vi.fn(async () => Buffer.from('%PDF-fake')),
}));

import { draftSanityClient } from './client';
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  listInvoices,
  markInvoiceStatus,
  nextInvoiceSeq,
  patchInvoice,
} from './invoices';
import { renderInvoicePdf } from '../pdf/renderInvoicePdf';
import { uploadFileAsset } from './upload';

const fetchMock = vi.mocked(draftSanityClient.fetch) as unknown as ReturnType<
  typeof vi.fn<(query: string, params?: Record<string, unknown>) => Promise<unknown>>
>;

beforeEach(() => vi.clearAllMocks());

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

describe('markInvoiceStatus', () => {
  function mockPatch() {
    const commitMock = vi.fn(async () => ({ _id: 'inv-1', status: 'sent' }));
    const setMock = vi.fn(() => ({ commit: commitMock }));
    vi.mocked(draftSanityClient.patch).mockReturnValue({ set: setMock } as never);
    return { setMock };
  }

  const draftInvoice = {
    _id: 'inv-1',
    _type: 'invoice',
    seq: 7,
    issueDate: '2026-06-30',
    status: 'draft',
    issuerSnapshot: { name: 'Me', address: 'A', phone: 'P', email: 'e@x.com' },
    clientSnapshot: { name: 'Acme', email: 'a@x.com', phone: 'P', address: 'A', currency: 'USD' },
    client: { _ref: 'client-1', _type: 'reference' },
    currency: 'USD',
    lineItems: [],
    taxRate: 0,
    totals: { subtotal: 0, vat: 0, total: 0 },
  };

  it('renders + uploads a PDF and patches status when leaving draft', async () => {
    fetchMock.mockResolvedValueOnce([draftInvoice]);
    const { setMock } = mockPatch();

    await markInvoiceStatus('inv-1', 'sent');

    expect(renderInvoicePdf).toHaveBeenCalledOnce();
    expect(uploadFileAsset).toHaveBeenCalledWith(expect.any(Buffer), 'INV-2026-007.pdf');
    expect(setMock).toHaveBeenCalledWith({
      status: 'sent',
      pdf: { _type: 'file', asset: { _ref: 'file-abc-pdf', _type: 'reference' } },
    });
  });

  it('patches status only (no PDF) when already out of draft', async () => {
    fetchMock.mockResolvedValueOnce([{ ...draftInvoice, status: 'sent' }]);
    const { setMock } = mockPatch();

    await markInvoiceStatus('inv-1', 'paid');

    expect(renderInvoicePdf).not.toHaveBeenCalled();
    expect(uploadFileAsset).not.toHaveBeenCalled();
    expect(setMock).toHaveBeenCalledWith({ status: 'paid' });
  });

  it('does not patch when PDF generation fails', async () => {
    fetchMock.mockResolvedValueOnce([draftInvoice]);
    vi.mocked(renderInvoicePdf).mockRejectedValueOnce(new Error('render boom'));

    await expect(markInvoiceStatus('inv-1', 'sent')).rejects.toThrow('render boom');
    expect(draftSanityClient.patch).not.toHaveBeenCalled();
  });
});
