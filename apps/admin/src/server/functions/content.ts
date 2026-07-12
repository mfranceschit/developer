import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createDraft, deleteDraft, patchDraft } from '../sanity/mutations';
import { getDocument, listDocuments } from '../sanity/queries';

export const listDocumentsFn = createServerFn({ method: 'GET', strict: { output: false } })
  .validator(z.object({ type: z.string() }))
  .handler(async ({ data }) => listDocuments(data.type));

export const getDocumentFn = createServerFn({ method: 'GET', strict: { output: false } })
  .validator(z.object({ type: z.string(), id: z.string() }))
  .handler(async ({ data }) => getDocument(data.type, data.id));

export const createDraftFn = createServerFn({ method: 'POST', strict: { output: false } })
  .validator(z.object({ type: z.string(), doc: z.record(z.string(), z.unknown()) }))
  .handler(async ({ data }) => createDraft(data.type, data.doc));

export const patchDraftFn = createServerFn({ method: 'POST', strict: { output: false } })
  .validator(z.object({ id: z.string(), patch: z.record(z.string(), z.unknown()) }))
  .handler(async ({ data }) => patchDraft(data.id, data.patch));

export const deleteDraftFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => deleteDraft(data.id));
