import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useInvoiceList } from '../../features/invoices/queries';
import { formatMoney } from '../../shared/lib/format';
import type { Invoice, InvoiceStatus } from '../../shared/types';

export const Route = createFileRoute('/invoices/')({
  component: InvoicesListPage,
});

const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'blue',
  paid: 'blue',
};

function invoiceNumber(invoice: Invoice): string {
  const year = invoice.issueDate.slice(0, 4);
  return `INV-${year}-${String(invoice.seq).padStart(3, '0')}`;
}

// `/invoices/$id` isn't registered in the route tree until Task 8 adds
// `routes/invoices/$id.tsx`; widening `to` to `string` sidesteps TanStack Router's
// literal-union check the same way projects/index.tsx (Task 7 of the Projects plan) did
// for not-yet-existing routes.
function invoiceDetailPath(id: string): string {
  return `/invoices/${id}`;
}

function InvoicesListPage() {
  const { data, isLoading } = useInvoiceList();
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">Invoices</h1>
        <Button size="sm" onClick={() => navigate({ to: invoiceDetailPath('new') })}>
          New invoice
        </Button>
      </div>
      <Table<Invoice>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: invoiceDetailPath(row._id) })}
        columns={[
          { header: 'Number', render: invoiceNumber },
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
    </div>
  );
}
