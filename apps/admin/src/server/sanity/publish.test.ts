import { describe, expect, it, vi } from 'vitest';

const transactionMock = {
  createOrReplace: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  commit: vi.fn(async () => ({})),
};

vi.mock('./client', () => ({
  draftSanityClient: {
    getDocument: vi.fn(async (id: string) => ({ _id: id, name: 'Draft content' })),
    transaction: vi.fn(() => transactionMock),
  },
}));

import { draftSanityClient } from './client';
import { discardDraft, publishDocument } from './publish';

describe('publishDocument', () => {
  it('createOrReplaces the published doc from the draft and deletes the draft', async () => {
    await publishDocument('a');
    expect(draftSanityClient.getDocument).toHaveBeenCalledWith('drafts.a');
    expect(transactionMock.createOrReplace).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'a', name: 'Draft content' }),
    );
    expect(transactionMock.delete).toHaveBeenCalledWith('drafts.a');
    expect(transactionMock.commit).toHaveBeenCalled();
  });
});

describe('discardDraft', () => {
  it('deletes drafts.<id>', async () => {
    await discardDraft('a');
    expect(transactionMock.delete).toHaveBeenCalledWith('drafts.a');
    expect(transactionMock.commit).toHaveBeenCalled();
  });
});
