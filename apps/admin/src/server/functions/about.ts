import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { upsertAboutDraft } from '@/server/sanity/about';

export const upsertAboutDraftFn = createServerFn({ method: 'POST', strict: { output: false } })
  .validator(z.record(z.string(), z.unknown()))
  .handler(async ({ data }) => upsertAboutDraft(data as never));
