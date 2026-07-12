import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    create: vi.fn(async (doc: Record<string, unknown>) => doc),
    patch: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      commit: vi.fn(async () => ({ _id: 'drafts.a', name: 'Patched' })),
    })),
    delete: vi.fn(async () => ({})),
  },
}));

import { draftSanityClient } from './client';
import { createDraft, deleteDraft, patchDraft } from './mutations';

describe('createDraft', () => {
  it('creates a document under drafts.<generated id>', async () => {
    const result = await createDraft('project', { name: 'New Project' });
    expect(draftSanityClient.create).toHaveBeenCalledWith(
      expect.objectContaining({ _type: 'project', name: 'New Project' }),
    );
    expect((draftSanityClient.create as ReturnType<typeof vi.fn>).mock.calls[0][0]._id).toMatch(
      /^drafts\./,
    );
    expect(result).toMatchObject({ _type: 'project', name: 'New Project' });
  });
});

describe('patchDraft', () => {
  it('patches the drafts.<id> document', async () => {
    const result = await patchDraft('a', { name: 'Patched' });
    expect(draftSanityClient.patch).toHaveBeenCalledWith('drafts.a');
    expect(result).toEqual({ _id: 'drafts.a', name: 'Patched' });
  });

  it('accepts an id already prefixed with drafts.', async () => {
    await patchDraft('drafts.a', { name: 'Patched' });
    expect(draftSanityClient.patch).toHaveBeenCalledWith('drafts.a');
  });
});

describe('deleteDraft', () => {
  it('deletes the drafts.<id> document', async () => {
    await deleteDraft('a');
    expect(draftSanityClient.delete).toHaveBeenCalledWith('drafts.a');
  });
});
