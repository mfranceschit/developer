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

// `/degrees/$id` isn't registered yet (added by the sibling edit-route task) — a
// non-literal `string` widens TanStack Router's `to` inference instead of checking it against
// the known-route literal union. Resolves correctly once that route exists.
function degreeDetailPath(id: string): string {
  return `/degrees/${id}`;
}

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
        <Button size="sm" onClick={() => navigate({ to: degreeDetailPath('new') })}>
          New degree
        </Button>
      </div>
      <Table<DegreeRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: degreeDetailPath(row._id) })}
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
