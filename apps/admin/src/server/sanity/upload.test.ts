import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    assets: {
      upload: vi.fn(async () => ({ _id: 'image-abc-100x100-png' })),
    },
  },
}));

import { draftSanityClient } from './client';
import { uploadFileAsset, uploadImageAsset } from './upload';

describe('uploadImageAsset', () => {
  it('uploads the buffer and returns an asset reference', async () => {
    const buffer = Buffer.from('fake-image-bytes');
    const result = await uploadImageAsset(buffer, 'photo.png');
    expect(draftSanityClient.assets.upload).toHaveBeenCalledWith('image', buffer, {
      filename: 'photo.png',
    });
    expect(result).toEqual({ _ref: 'image-abc-100x100-png', _type: 'reference' });
  });
});

describe('uploadFileAsset', () => {
  it('uploads a file buffer and returns an asset reference', async () => {
    vi.mocked(draftSanityClient.assets.upload).mockResolvedValueOnce({ _id: 'file-abc-pdf' } as never);
    const buffer = Buffer.from('%PDF-fake');
    const result = await uploadFileAsset(buffer, 'INV-2026-007.pdf');
    expect(draftSanityClient.assets.upload).toHaveBeenCalledWith('file', buffer, {
      filename: 'INV-2026-007.pdf',
    });
    expect(result).toEqual({ _ref: 'file-abc-pdf', _type: 'reference' });
  });
});
