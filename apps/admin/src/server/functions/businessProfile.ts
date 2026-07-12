import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getBusinessProfile, upsertBusinessProfile } from '../sanity/businessProfile';

export const getBusinessProfileFn = createServerFn({
  method: 'GET',
  strict: { output: false },
}).handler(async () => getBusinessProfile());

export const upsertBusinessProfileFn = createServerFn({
  method: 'POST',
  strict: { output: false },
})
  .validator(z.record(z.string(), z.unknown()))
  .handler(async ({ data }) => upsertBusinessProfile(data as never));
