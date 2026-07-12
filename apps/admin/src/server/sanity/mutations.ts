import { randomUUID } from 'node:crypto';
import { draftSanityClient } from './client';
import { toDraftId } from './ids';

export async function createDraft<T extends Record<string, unknown>>(
  type: string,
  doc: Omit<T, '_id' | '_type'>,
): Promise<T> {
  const _id = `drafts.${randomUUID()}`;
  const created = await draftSanityClient.create({ ...doc, _id, _type: type });
  return created as unknown as T;
}

export async function patchDraft<T>(id: string, patch: Partial<T>): Promise<T> {
  const draftId = toDraftId(id);
  const result = await draftSanityClient
    .patch(draftId)
    .set(patch as Record<string, unknown>)
    .commit();
  return result as T;
}

export async function deleteDraft(id: string): Promise<void> {
  const draftId = toDraftId(id);
  await draftSanityClient.delete(draftId);
}
