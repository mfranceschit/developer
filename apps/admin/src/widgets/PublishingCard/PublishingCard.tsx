import { Badge, type BadgeTone, Button, Card, Dialog, type createToaster } from '@mfranceschit/ui';
import { useState } from 'react';
import type { DocumentStatus } from '@/shared/types';

export type PublishingCardProps = {
  status: DocumentStatus;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onPublish: () => Promise<void>;
  onDiscard: () => Promise<void>;
  toaster: ReturnType<typeof createToaster>;
};

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

export function PublishingCard({
  status,
  dirty,
  saving,
  onSave,
  onPublish,
  onDiscard,
  toaster,
}: PublishingCardProps) {
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    try {
      await onPublish();
      toaster.create({ title: 'Published', type: 'success' });
    } catch {
      toaster.create({ title: 'Failed to publish', type: 'error' });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDiscard() {
    setDiscarding(true);
    try {
      await onDiscard();
      toaster.create({ title: 'Draft discarded', type: 'success' });
    } catch {
      toaster.create({ title: 'Failed to discard', type: 'error' });
    } finally {
      setDiscarding(false);
      setDiscardDialogOpen(false);
    }
  }

  return (
    <Card padding="20px 24px" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Publishing</h2>
        <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      </div>
      <div className="flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3.5">
        <Button fullWidth onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save draft'}
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={handlePublish}
          disabled={publishing || (status === 'published' && !dirty)}
        >
          {publishing ? 'Publishing…' : 'Publish'}
        </Button>
        <Dialog
          open={discardDialogOpen}
          onOpenChange={setDiscardDialogOpen}
          title="Discard draft?"
          description="This will permanently delete your unpublished changes."
          trigger={
            <button
              type="button"
              disabled={status === 'published'}
              className="self-center p-1 font-sans text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard draft
            </button>
          }
        >
          <Button variant="accent" size="sm" onClick={handleDiscard} disabled={discarding}>
            {discarding ? 'Discarding…' : 'Confirm discard'}
          </Button>
        </Dialog>
      </div>
      <p className="font-sans text-xs leading-relaxed text-[var(--text-muted)]">
        Publishing replaces the live document on the portfolio.
      </p>
    </Card>
  );
}
