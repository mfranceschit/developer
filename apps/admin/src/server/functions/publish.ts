import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { discardDraft, publishDocument } from '../sanity/publish';

export const publishDocumentFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => publishDocument(data.id));

export const discardDraftFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => discardDraft(data.id));
