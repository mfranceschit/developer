import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sanityImageUrl } from './sanityImage';

describe('sanityImageUrl', () => {
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

  it('builds a real Sanity CDN URL from a valid asset ref', () => {
    expect(sanityImageUrl('image-abc-100x100-png')).toBe(
      'https://cdn.sanity.io/images/abc123/production/abc-100x100.png',
    );
  });

  it('returns an empty string for an empty ref', () => {
    expect(sanityImageUrl('')).toBe('');
  });

  it('returns an empty string for a malformed ref', () => {
    expect(sanityImageUrl('not-a-real-ref')).toBe('');
  });

  it('returns an empty string when project id is missing', () => {
    import.meta.env.VITE_SANITY_PROJECT_ID = '';
    expect(sanityImageUrl('image-abc-100x100-png')).toBe('');
  });
});
