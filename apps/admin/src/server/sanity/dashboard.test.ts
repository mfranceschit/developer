import { describe, expect, it, vi } from 'vitest';

vi.mock('./queries', () => ({ listDocuments: vi.fn() }));
vi.mock('./invoices', () => ({ listInvoices: vi.fn() }));

import { listDocuments } from './queries';
import { listInvoices } from './invoices';
import { getDashboard } from './dashboard';

describe('getDashboard', () => {
  it('aggregates the four draftable types and invoices', async () => {
    vi.mocked(listDocuments).mockImplementation(async (type: string) => {
      if (type === 'project') return [{ _id: 'p1', _status: 'draft', name: 'Marea' }] as never;
      return [] as never;
    });
    vi.mocked(listInvoices).mockResolvedValue([]);

    const data = await getDashboard();

    expect(vi.mocked(listDocuments).mock.calls.map((c) => c[0])).toEqual([
      'project',
      'certification',
      'degree',
      'client',
    ]);
    expect(listInvoices).toHaveBeenCalledTimes(1);
    expect(data.attention).toHaveLength(1);
    expect(data.attention[0]).toMatchObject({ id: 'p1', type: 'project', name: 'Marea' });
    expect(data.counts.projects).toBe(1);
  });
});
