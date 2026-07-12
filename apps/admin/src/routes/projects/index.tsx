import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '../../features/content/queries';
import type { DocumentStatus, Project } from '../../shared/types';

export const Route = createFileRoute('/projects/')({
  component: ProjectsListPage,
});

type ProjectRow = Project & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

// `/projects/$id` isn't registered in the route tree until Task 7 adds
// `routes/projects/$id.tsx`; widening `to`/`id` to `string` sidesteps TanStack Router's
// literal-union check the same way NavShell (Task 5) did for not-yet-existing routes.
function projectDetailPath(id: string): string {
  return `/projects/${id}`;
}

function ProjectsListPage() {
  const { data, isLoading } = useDocumentList<ProjectRow>('project');
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">Projects</h1>
        <Button size="sm" onClick={() => navigate({ to: projectDetailPath('new') })}>
          New project
        </Button>
      </div>
      <Table<ProjectRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: projectDetailPath(row._id) })}
        columns={[
          { header: 'Name', render: (row) => row.name },
          { header: 'Technologies', render: (row) => row.technologies.join(', ') },
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
