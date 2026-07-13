import type { SanityImage } from '@/shared/types';
import { draftSanityClient } from './client';

export async function uploadImageAsset(
  file: Buffer,
  filename: string,
): Promise<SanityImage['asset']> {
  const asset = await draftSanityClient.assets.upload('image', file, { filename });
  return { _ref: asset._id, _type: 'reference' };
}
