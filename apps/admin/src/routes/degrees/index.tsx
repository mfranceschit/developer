import { Badge, type BadgeTone, Button, Card, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '@/features/content/queries';
import type { Degree, DocumentStatus } from '@/shared/types';
import { PageHeader } from '@/widgets/PageHeader/PageHeader';

export const Route = createFileRoute('/degrees/')({
  component: DegreesListPage,
});

type DegreeRow = Degree & { _status: DocumentStatus };

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

function DegreesListPage() {
  const { data, isLoading } = useDocumentList<DegreeRow>('degree');
  const navigate = useNavigate();
  const rows = data ?? [];
  const published = rows.filter((r) => r._status === 'published').length;
  const draft = rows.filter((r) => r._status !== 'published').length;

  if (isLoading) {
    return <p className="font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Certifications"
        title="Degrees"
        subtitle={`${rows.length} degrees · ${published} published · ${draft} draft`}
        action={
          <Button onClick={() => navigate({ to: '/degrees/$id', params: { id: 'new' } })}>
            New degree
          </Button>
        }
      />
      <Card padding="0" className="overflow-hidden">
        <Table<DegreeRow>
          rows={rows}
          getRowKey={(row) => row._id}
          onRowClick={(row) => navigate({ to: '/degrees/$id', params: { id: row._id } })}
          columns={[
            { header: 'Name', render: (row) => row.name.en },
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
