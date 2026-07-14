const FILE_REF_PATTERN = /^file-([a-zA-Z0-9]+)-([a-z0-9]+)$/;

export function sanityFileUrl(ref: string): string {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const dataset = import.meta.env.VITE_SANITY_DATASET;
  const match = FILE_REF_PATTERN.exec(ref);

  if (!projectId || !dataset || !match) {
    return '';
  }

  const [, assetId, ext] = match;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${ext}`;
}
