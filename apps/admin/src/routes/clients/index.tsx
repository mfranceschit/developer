import { Badge, type BadgeTone, Button, Card, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '@/features/content/queries';
import type { Client, DocumentStatus } from '@/shared/types';
import { PageHeader } from '@/widgets/PageHeader/PageHeader';

export const Route = createFileRoute('/clients/')({
  component: ClientsListPage,
});

type ClientRow = Client & { _status: DocumentStatus };

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

function ClientsListPage() {
  const { data, isLoading } = useDocumentList<ClientRow>('client');
  const navigate = useNavigate();
  const rows = data ?? [];

  if (isLoading) {
    return <p className="font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Billing"
        title="Clients"
        subtitle={`${rows.length} clients`}
        action={
          <Button onClick={() => navigate({ to: '/clients/$id', params: { id: 'new' } })}>
            New client
          </Button>
        }
      />
      <Card padding="0" className="overflow-hidden">
        <Table<ClientRow>
          rows={rows}
          getRowKey={(row) => row._id}
          onRowClick={(row) => navigate({ to: '/clients/$id', params: { id: row._id } })}
          columns={[
            { header: 'Name', render: (row) => row.name },
            { header: 'Email', render: (row) => row.email },
            { header: 'Currency', render: (row) => row.currency },
            {
              header: 'Status',
              align: 'right',
              render: (row) => (
                <Badge tone={STATUS_TONE[row._status]}>{STATUS_LABEL[row._status]}</Badge>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
