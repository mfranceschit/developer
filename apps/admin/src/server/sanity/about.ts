import type { About } from '@/shared/types';
import { draftSanityClient } from './client';

export async function upsertAboutDraft(doc: Omit<About, '_id' | '_type'>): Promise<About> {
  const result = await draftSanityClient.createOrReplace({
    ...doc,
    _id: 'drafts.about',
    _type: 'about',
  });
  return result as unknown as About;
}
