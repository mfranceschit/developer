import { Badge, type BadgeTone, Card } from '@mfranceschit/ui';
import { formatMoney } from '@/shared/lib/format';
import type { OutstandingTotal, RecentInvoice } from '@/shared/lib/dashboard';
import type { InvoiceStatus } from '@/shared/types';

const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'blue',
  paid: 'blue',
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
};

export type BillingCardProps = {
  outstanding: OutstandingTotal;
  invoices: RecentInvoice[];
  onOpen: (invoice: RecentInvoice) => void;
  onViewAll: () => void;
};

export function BillingCard({ outstanding, invoices, onOpen, onViewAll }: BillingCardProps) {
  const outstandingLabel =
    outstanding.currency === 'mixed'
      ? `${outstanding.amount.toLocaleString('en-US')} (mixed)`
      : formatMoney(outstanding.amount, outstanding.currency);

  return (
    <Card padding="0">
      <div className="flex items-baseline justify-between px-6 pt-5">
        <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Billing</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="font-sans text-[13px] text-[var(--text-link)] transition-colors hover:text-[var(--text-accent)]"
        >
          All invoices →
        </button>
      </div>
      <div className="px-6 pt-4">
        <div className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Outstanding
        </div>
        <div className="mt-1 font-sans text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
          {outstandingLabel}
        </div>
      </div>
      <div className="flex flex-col p-2 pt-3">
        {invoices.map((inv) => (
          <button
            key={inv.id}
            type="button"
            onClick={() => onOpen(inv)}
            className="flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-left transition-colors hover:bg-[var(--mf-blue-50)]"
          >
            <div>
              <div className="font-sans text-sm font-medium text-[var(--text-strong)]">
                {inv.number}
              </div>
              <div className="mt-px font-sans text-xs text-[var(--text-muted)]">
                {inv.clientName}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm font-medium text-[var(--text-body)]">
                {formatMoney(inv.total, inv.currency)}
              </span>
              <Badge tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
