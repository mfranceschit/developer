import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: { fetch: vi.fn() },
}));

import { draftSanityClient } from './client';
import { getDocument, listDocuments } from './queries';

describe('listDocuments', () => {
  it('marks a doc present only as drafts.<id> as draft', async () => {
    vi.mocked(draftSanityClient.fetch).mockResolvedValue([
      { _id: 'drafts.a', name: 'A' },
    ]);
    const result = await listDocuments('project');
    expect(result).toEqual([{ _id: 'drafts.a', name: 'A', _status: 'draft' }]);
  });

  it('marks a doc present as both published and drafts.<id> as unpublished-changes', async () => {
    vi.mocked(draftSanityClient.fetch).mockResolvedValue([
      { _id: 'a', name: 'A' },
      { _id: 'drafts.a', name: 'A (edited)' },
    ]);
    const result = await listDocuments('project');
    expect(result).toEqual([
      { _id: 'a', name: 'A (edited)', _status: 'unpublished-changes' },
    ]);
  });

  it('marks a doc present only as published id as published', async () => {
    vi.mocked(draftSanityClient.fetch).mockResolvedValue([{ _id: 'a', name: 'A' }]);
    const result = await listDocuments('project');
    expect(result).toEqual([{ _id: 'a', name: 'A', _status: 'published' }]);
  });
});

describe('getDocument', () => {
  it('prefers the draft over the published doc', async () => {
    vi.mocked(draftSanityClient.fetch).mockResolvedValue([
      { _id: 'a', name: 'A' },
      { _id: 'drafts.a', name: 'A (edited)' },
    ]);
    const result = await getDocument('project', 'a');
    expect(result).toEqual({ _id: 'a', name: 'A (edited)', _status: 'unpublished-changes' });
  });

  it('returns null when no doc matches', async () => {
    vi.mocked(draftSanityClient.fetch).mockResolvedValue([]);
    const result = await getDocument('project', 'missing');
    expect(result).toBeNull();
  });
});
