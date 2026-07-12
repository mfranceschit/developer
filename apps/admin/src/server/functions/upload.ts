import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { uploadImageAsset } from '../sanity/upload';

export const uploadImageAssetFn = createServerFn({ method: 'POST' })
  .validator(z.instanceof(FormData))
  .handler(async ({ data }) => {
    const file = data.get('file');
    if (!(file instanceof File)) {
      throw new Error('Missing file in form data');
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    return uploadImageAsset(buffer, file.name);
  });
