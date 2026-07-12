import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    getDocument: vi.fn(),
    createOrReplace: vi.fn(),
  },
}));

import { draftSanityClient } from './client';
import { getBusinessProfile, upsertBusinessProfile } from './businessProfile';

describe('getBusinessProfile', () => {
  it('returns the singleton document', async () => {
    vi.mocked(draftSanityClient.getDocument).mockResolvedValue({
      _id: 'businessProfile',
      name: 'Me',
    } as never);
    const result = await getBusinessProfile();
    expect(draftSanityClient.getDocument).toHaveBeenCalledWith('businessProfile');
    expect(result).toEqual({ _id: 'businessProfile', name: 'Me' });
  });

  it('returns null when the singleton does not exist yet', async () => {
    vi.mocked(draftSanityClient.getDocument).mockResolvedValue(undefined as never);
    expect(await getBusinessProfile()).toBeNull();
  });
});

describe('upsertBusinessProfile', () => {
  it('createOrReplaces with the fixed id', async () => {
    vi.mocked(draftSanityClient.createOrReplace).mockImplementation(async (doc) => doc as never);
    const result = await upsertBusinessProfile({
      name: 'Me',
      taxId: '123',
      address: 'A',
      phone: 'P',
      email: 'e@x.com',
    });
    expect(draftSanityClient.createOrReplace).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'businessProfile', _type: 'businessProfile', name: 'Me' }),
    );
    expect(result.name).toBe('Me');
  });
});
