const ASSET_REF_PATTERN = /^image-([a-zA-Z0-9]+)-(\d+x\d+)-([a-z]+)$/;

/**
 * Builds a real, resolvable Sanity CDN URL from an image asset `_ref`
 * (e.g. `image-abc123-800x600-png`), matching the format Sanity's own
 * asset pipeline uses: https://www.sanity.io/docs/image-urls
 *
 * Project ID/dataset are not secrets — they're required to construct
 * public, unauthenticated CDN URLs, the same way apps/portfolio's
 * server-resolved `asset->url` queries work.
 */
export function sanityImageUrl(ref: string): string {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const dataset = import.meta.env.VITE_SANITY_DATASET;
  const match = ASSET_REF_PATTERN.exec(ref);

  if (!projectId || !dataset || !match) {
    return '';
  }

  const [, assetId, dimensions, format] = match;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${format}`;
}
