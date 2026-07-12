import { Badge, type BadgeTone, Button, Dialog, type createToaster } from '@mfranceschit/ui';
import { useState } from 'react';

import type { DocumentStatus } from '../../shared/types';

export type DocumentToolbarProps = {
  status: DocumentStatus;
  dirty: boolean;
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
  'unpublished-changes': 'Unpublished changes',
};

export function DocumentToolbar({
  status,
  dirty,
  onPublish,
  onDiscard,
  toaster,
}: DocumentToolbarProps) {
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
    <div className="flex items-center gap-3">
      <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      <Dialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        title="Discard draft?"
        description="This will permanently delete your unpublished changes."
        trigger={
          <Button variant="outline" size="sm" disabled={status === 'published'}>
            Discard
          </Button>
        }
      >
        <Button variant="accent" size="sm" onClick={handleDiscard} disabled={discarding}>
          {discarding ? 'Discarding…' : 'Confirm discard'}
        </Button>
      </Dialog>
      <Button
        size="sm"
        onClick={handlePublish}
        disabled={publishing || (status === 'published' && !dirty)}
      >
        {publishing ? 'Publishing…' : 'Publish'}
      </Button>
    </div>
  );
}
