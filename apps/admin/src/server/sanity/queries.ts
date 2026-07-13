import type { DocumentStatus } from '@/shared/types';
import { draftSanityClient } from './client';
import { toDraftId, toPublishedId } from './ids';

interface RawDoc {
  _id: string;
  [key: string]: unknown;
}

function resolveStatuses<T extends RawDoc>(docs: T[]): Array<T & { _status: DocumentStatus }> {
  const byPublishedId = new Map<string, { published?: T; draft?: T }>();

  for (const doc of docs) {
    const publishedId = toPublishedId(doc._id);
    const entry = byPublishedId.get(publishedId) ?? {};
    if (doc._id.startsWith('drafts.')) {
      entry.draft = doc;
    } else {
      entry.published = doc;
    }
    byPublishedId.set(publishedId, entry);
  }

  const result: Array<T & { _status: DocumentStatus }> = [];
  for (const [publishedId, { published, draft }] of byPublishedId.entries()) {
    if (draft && published) {
      result.push({ ...draft, _id: publishedId, _status: 'unpublished-changes' });
    } else if (draft) {
      result.push({ ...draft, _status: 'draft' });
    } else if (published) {
      result.push({ ...published, _status: 'published' });
    }
  }
  return result;
}

export async function listDocuments<T extends RawDoc>(
  type: string,
): Promise<Array<T & { _status: DocumentStatus }>> {
  const docs = await draftSanityClient.fetch<T[]>(`*[_type == $type]`, { type });
  return resolveStatuses(docs);
}

export async function getDocument<T extends RawDoc>(
  type: string,
  id: string,
): Promise<(T & { _status: DocumentStatus }) | null> {
  const publishedId = toPublishedId(id);
  const draftId = toDraftId(id);
  const docs = await draftSanityClient.fetch<T[]>(
    `*[_type == $type && (_id == $publishedId || _id == $draftId)]`,
    { type, publishedId, draftId },
  );
  const [resolved] = resolveStatuses(docs);
  return resolved ?? null;
}
