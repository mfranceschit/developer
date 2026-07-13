import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    createOrReplace: vi.fn(),
  },
}));

import { draftSanityClient } from './client';
import { upsertAboutDraft } from './about';

describe('upsertAboutDraft', () => {
  it('createOrReplaces onto the fixed draft id', async () => {
    vi.mocked(draftSanityClient.createOrReplace).mockImplementation(async (doc) => doc as never);
    const result = await upsertAboutDraft({
      eyebrow: { en: 'Build', es: '', pt: '' },
      title: { en: 'Me', es: 'Yo', pt: 'Eu' },
      body: { en: [], es: [], pt: [] },
      stack: ['TypeScript'],
    });
    expect(draftSanityClient.createOrReplace).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'drafts.about', _type: 'about' }),
    );
    expect(result.title.en).toBe('Me');
  });
});
