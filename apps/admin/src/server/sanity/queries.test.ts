import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: { fetch: vi.fn() },
}));

import { draftSanityClient } from './client';
import { getDocument, listDocuments } from './queries';

// draftSanityClient.fetch is typed with @sanity/client's overloaded signature,
// which makes `vi.mocked(...).mockResolvedValue()` pick the raw-response overload.
// Narrow the mocked reference once so tests can resolve plain arrays.
const fetchMock = vi.mocked(draftSanityClient.fetch) as unknown as Mock<
  (query: string, params?: Record<string, unknown>) => Promise<unknown>
>;

describe('listDocuments', () => {
  it('marks a doc present only as drafts.<id> as draft', async () => {
    fetchMock.mockResolvedValue([{ _id: 'drafts.a', name: 'A' }]);
    const result = await listDocuments('project');
    expect(result).toEqual([{ _id: 'drafts.a', name: 'A', _status: 'draft' }]);
  });

  it('marks a doc present as both published and drafts.<id> as unpublished-changes', async () => {
    fetchMock.mockResolvedValue([
      { _id: 'a', name: 'A' },
      { _id: 'drafts.a', name: 'A (edited)' },
    ]);
    const result = await listDocuments('project');
    expect(result).toEqual([
      { _id: 'a', name: 'A (edited)', _status: 'unpublished-changes' },
    ]);
  });

  it('marks a doc present only as published id as published', async () => {
    fetchMock.mockResolvedValue([{ _id: 'a', name: 'A' }]);
    const result = await listDocuments('project');
    expect(result).toEqual([{ _id: 'a', name: 'A', _status: 'published' }]);
  });
});

describe('getDocument', () => {
  it('prefers the draft over the published doc', async () => {
    fetchMock.mockResolvedValue([
      { _id: 'a', name: 'A' },
      { _id: 'drafts.a', name: 'A (edited)' },
    ]);
    const result = await getDocument('project', 'a');
    expect(result).toEqual({ _id: 'a', name: 'A (edited)', _status: 'unpublished-changes' });
  });

  it('returns null when no doc matches', async () => {
    fetchMock.mockResolvedValue([]);
    const result = await getDocument('project', 'missing');
    expect(result).toBeNull();
  });
});
