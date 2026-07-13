import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '@/features/content/queries';
import type { Client, DocumentStatus } from '@/shared/types';

export const Route = createFileRoute('/clients/')({
  component: ClientsListPage,
});

type ClientRow = Client & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

function ClientsListPage() {
  const { data, isLoading } = useDocumentList<ClientRow>('client');
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">Clients</h1>
        <Button size="sm" onClick={() => navigate({ to: '/clients/$id', params: { id: 'new' } })}>
          New client
        </Button>
      </div>
      <Table<ClientRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: '/clients/$id', params: { id: row._id } })}
        columns={[
          { header: 'Name', render: (row) => row.name },
          { header: 'Email', render: (row) => row.email },
          { header: 'Currency', render: (row) => row.currency },
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
