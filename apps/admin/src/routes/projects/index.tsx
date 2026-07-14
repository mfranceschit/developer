import { Badge, type BadgeTone, Button, Card, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '@/features/content/queries';
import type { DocumentStatus, Project } from '@/shared/types';
import { PageHeader } from '@/widgets/PageHeader/PageHeader';

export const Route = createFileRoute('/projects/')({
  component: ProjectsListPage,
});

type ProjectRow = Project & { _status: DocumentStatus };

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

function ProjectsListPage() {
  const { data, isLoading } = useDocumentList<ProjectRow>('project');
  const navigate = useNavigate();
  const rows = data ?? [];
  const published = rows.filter((r) => r._status === 'published').length;
  const pending = rows.length - published;

  if (isLoading) {
    return <p className="font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Work"
        title="Projects"
        subtitle={`${rows.length} projects · ${published} published · ${pending} with pending changes`}
        action={
          <Button onClick={() => navigate({ to: '/projects/$id', params: { id: 'new' } })}>
            New project
          </Button>
        }
      />
      <Card padding="0" className="overflow-hidden">
        <Table<ProjectRow>
          rows={rows}
          getRowKey={(row) => row._id}
          onRowClick={(row) => navigate({ to: '/projects/$id', params: { id: row._id } })}
          columns={[
            { header: 'Name', render: (row) => row.name },
            { header: 'Technologies', render: (row) => row.technologies.join(', ') },
            {
              header: 'Status',
              align: 'right',
              render: (row) => <Badge tone={STATUS_TONE[row._status]}>{STATUS_LABEL[row._status]}</Badge>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
