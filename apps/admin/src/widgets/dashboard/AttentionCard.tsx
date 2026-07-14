import { Badge, type BadgeTone, Card } from '@mfranceschit/ui';
import type { AttentionItem } from '@/shared/lib/dashboard';
import type { DocumentStatus } from '@/shared/types';

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

const STATUS_LABEL: Record<DocumentStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  'unpublished-changes': 'Changed',
};

export type AttentionCardProps = {
  items: AttentionItem[];
  onOpen: (item: AttentionItem) => void;
};

export function AttentionCard({ items, onOpen }: AttentionCardProps) {
  return (
    <Card padding="0">
      <div className="flex items-baseline justify-between px-6 pt-5">
        <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
          Needs attention
        </h2>
        <span className="font-sans text-[13px] text-[var(--text-muted)]">
          {items.length} documents
        </span>
      </div>
      <div className="flex flex-col p-2 pt-3">
        {items.length === 0 && (
          <div className="px-4 py-6 text-center font-sans text-sm text-[var(--text-muted)]">
            All caught up.
          </div>
        )}
        {items.map((item) => (
          <button
            key={`${item.type}:${item.id}`}
            type="button"
            onClick={() => onOpen(item)}
            className="flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-left transition-colors hover:bg-[var(--mf-blue-50)]"
          >
            <div className="min-w-0">
              <div className="truncate font-sans text-sm font-medium text-[var(--text-strong)]">
                {item.name}
              </div>
              <div className="mt-px font-sans text-xs text-[var(--text-muted)]">
                {item.typeLabel}
              </div>
            </div>
            <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
          </button>
        ))}
      </div>
    </Card>
  );
}
