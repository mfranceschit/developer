import { draftSanityClient } from './client';
import { toDraftId, toPublishedId } from './ids';

export async function publishDocument(id: string): Promise<void> {
  const draftId = toDraftId(id);
  const publishedId = toPublishedId(id);
  const draft = await draftSanityClient.getDocument(draftId);
  if (!draft) {
    throw new Error(`No draft found for ${draftId}`);
  }
  await draftSanityClient
    .transaction()
    .createOrReplace({ ...draft, _id: publishedId })
    .delete(draftId)
    .commit();
}

export async function discardDraft(id: string): Promise<void> {
  const draftId = toDraftId(id);
  await draftSanityClient.transaction().delete(draftId).commit();
}
