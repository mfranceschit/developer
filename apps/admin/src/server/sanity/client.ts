import { createClient } from '@sanity/client';

// import.meta.env is replaced with void 0 by Vite for non-PUBLIC server vars in SSR chunks;
// process.env is the correct runtime source for server-only secrets (see apps/portfolio).
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION ?? '2023-12-08';
const token = process.env.SANITY_TOKEN;

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

export const draftSanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'raw',
});
