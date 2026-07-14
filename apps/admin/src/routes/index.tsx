import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDashboard } from '@/features/dashboard/queries';
import type { AttentionType } from '@/shared/lib/dashboard';
import { AttentionCard } from '@/widgets/dashboard/AttentionCard';
import { BillingCard } from '@/widgets/dashboard/BillingCard';
import { DashboardHero } from '@/widgets/dashboard/DashboardHero';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const EDITOR_ROUTE: Record<AttentionType, string> = {
  project: '/projects/$id',
  certification: '/certifications/$id',
  degree: '/degrees/$id',
  client: '/clients/$id',
};

function summarize(draftCount: number, outstandingSent: number): string {
  const drafts =
    draftCount === 0
      ? 'Everything is published'
      : `${draftCount} document${draftCount === 1 ? '' : 's'} need${draftCount === 1 ? 's' : ''} attention`;
  const bills =
    outstandingSent === 0
      ? 'no invoices are outstanding'
      : `${outstandingSent} invoice${outstandingSent === 1 ? ' is' : 's are'} out for payment`;
  return `${drafts} and ${bills}.`;
}

function HomePage() {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return <p className="font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  const outstandingSentCount = data.recentInvoices.filter((i) => i.status === 'sent').length;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        summary={summarize(data.attention.length, outstandingSentCount)}
        onNewProject={() => navigate({ to: '/projects/$id', params: { id: 'new' } })}
        onNewInvoice={() => navigate({ to: '/invoices/$id', params: { id: 'new' } })}
        onEditAbout={() => navigate({ to: '/about' })}
      />
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <AttentionCard
          items={data.attention}
          onOpen={(item) =>
            navigate({ to: EDITOR_ROUTE[item.type], params: { id: item.id } })
          }
        />
        <BillingCard
          outstanding={data.outstandingTotal}
          invoices={data.recentInvoices}
          onOpen={(inv) => navigate({ to: '/invoices/$id', params: { id: inv.id } })}
          onViewAll={() => navigate({ to: '/invoices' })}
        />
      </div>
    </div>
  );
}
