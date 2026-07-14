import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sanityFileUrl } from './sanityFile';

describe('sanityFileUrl', () => {
  const originalProjectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const originalDataset = import.meta.env.VITE_SANITY_DATASET;

  beforeEach(() => {
    import.meta.env.VITE_SANITY_PROJECT_ID = 'abc123';
    import.meta.env.VITE_SANITY_DATASET = 'production';
  });

  afterEach(() => {
    import.meta.env.VITE_SANITY_PROJECT_ID = originalProjectId;
    import.meta.env.VITE_SANITY_DATASET = originalDataset;
  });

  it('builds a real Sanity file CDN URL from a valid asset ref', () => {
    expect(sanityFileUrl('file-abc-pdf')).toBe(
      'https://cdn.sanity.io/files/abc123/production/abc.pdf',
    );
  });

  it('returns an empty string for an empty ref', () => {
    expect(sanityFileUrl('')).toBe('');
  });

  it('returns an empty string for a malformed ref', () => {
    expect(sanityFileUrl('not-a-real-ref')).toBe('');
  });

  it('returns an empty string when project id is missing', () => {
    import.meta.env.VITE_SANITY_PROJECT_ID = '';
    expect(sanityFileUrl('file-abc-pdf')).toBe('');
  });
});
