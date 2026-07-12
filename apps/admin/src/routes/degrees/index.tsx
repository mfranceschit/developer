import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '../../features/content/queries';
import type { Degree, DocumentStatus } from '../../shared/types';

export const Route = createFileRoute('/degrees/')({
  component: DegreesListPage,
});

type DegreeRow = Degree & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

function DegreesListPage() {
  const { data, isLoading } = useDocumentList<DegreeRow>('degree');
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">Degrees</h1>
        <Button
          size="sm"
          onClick={() => navigate({ to: '/degrees/$id', params: { id: 'new' } })}
        >
          New degree
        </Button>
      </div>
      <Table<DegreeRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: '/degrees/$id', params: { id: row._id } })}
        columns={[
          { header: 'Name', render: (row) => row.name.en },
          {
            header: 'Status',
            align: 'right',
            render: (row) => <Badge tone={STATUS_TONE[row._status]}>{row._status}</Badge>,
          },
        ]}
      />
    </div>
  );
}
