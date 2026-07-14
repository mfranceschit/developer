import { Badge, type BadgeTone, Button, Card, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useInvoiceList } from '@/features/invoices/queries';
import { formatInvoiceNumber, formatMoney } from '@/shared/lib/format';
import type { Invoice, InvoiceStatus } from '@/shared/types';
import { PageHeader } from '@/widgets/PageHeader/PageHeader';

export const Route = createFileRoute('/invoices/')({
  component: InvoicesListPage,
});

const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'blue',
  paid: 'blue',
};

function InvoicesListPage() {
  const { data, isLoading } = useInvoiceList();
  const navigate = useNavigate();
  const rows = data ?? [];
  const sent = rows.filter((i) => i.status === 'sent');
  const sentCount = sent.length;
  const outstanding = sent.reduce((sum, i) => sum + i.totals.total, 0);
  const outstandingCurrency = sent[0]?.currency ?? 'USD';

  if (isLoading) {
    return <p className="font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Billing"
        title="Invoices"
        subtitle={`${rows.length} invoices`}
        action={
          <Button onClick={() => navigate({ to: '/invoices/$id', params: { id: 'new' } })}>
            New invoice
          </Button>
        }
      />
      <Card padding="0" className="overflow-hidden">
        <Table<Invoice>
          rows={rows}
          getRowKey={(row) => row._id}
          onRowClick={(row) => navigate({ to: '/invoices/$id', params: { id: row._id } })}
          columns={[
            { header: 'Number', render: formatInvoiceNumber },
            { header: 'Client', render: (row) => row.clientSnapshot.name },
            {
              header: 'Total',
              align: 'right',
              render: (row) => formatMoney(row.totals.total, row.currency),
            },
            {
              header: 'Status',
              align: 'right',
              render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
            },
          ]}
        />
        <div className="border-t border-[var(--border-subtle)] bg-[var(--mf-gray-50)] px-6 py-3 font-sans text-[13px] text-[var(--text-muted)]">
          {sentCount === 0
            ? 'No outstanding invoices'
            : `${formatMoney(outstanding, outstandingCurrency)} outstanding across ${sentCount} sent invoice${sentCount === 1 ? '' : 's'}`}
        </div>
      </Card>
    </div>
  );
}
