export function toDraftId(id: string): string {
  return id.startsWith('drafts.') ? id : `drafts.${id}`;
}

export function toPublishedId(id: string): string {
  return id.startsWith('drafts.') ? id.slice('drafts.'.length) : id;
}
