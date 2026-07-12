import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '../../features/content/queries';
import type { Certification, DocumentStatus } from '../../shared/types';

export const Route = createFileRoute('/certifications/')({
  component: CertificationsListPage,
});

type CertificationRow = Certification & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

function CertificationsListPage() {
  const { data, isLoading } = useDocumentList<CertificationRow>('certification');
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          Certifications
        </h1>
        <Button
          size="sm"
          onClick={() => navigate({ to: '/certifications/$id', params: { id: 'new' } })}
        >
          New certification
        </Button>
      </div>
      <Table<CertificationRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) =>
          navigate({ to: '/certifications/$id', params: { id: row._id } })
        }
        columns={[
          { header: 'Name', render: (row) => row.name },
          { header: 'Date', render: (row) => row.date },
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
