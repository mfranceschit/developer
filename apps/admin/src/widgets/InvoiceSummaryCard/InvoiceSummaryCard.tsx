import { Button, Card } from '@mfranceschit/ui';
import { formatMoney } from '@/shared/lib/format';
import type { InvoiceStatus } from '@/shared/types';

export type InvoiceSummaryCardProps = {
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  vat: number;
  total: number;
  taxRate: number;
  locked: boolean;
  saving: boolean;
  blocked?: boolean;
  onSave: () => void;
  onMarkSent: () => void;
  onMarkPaid: () => void;
  issuer?: { name: string; email: string; taxId?: string };
  onEditIssuer: () => void;
  pdfUrl?: string;
};

const STEPS: InvoiceStatus[] = ['draft', 'sent', 'paid'];
const STEP_LABEL: Record<InvoiceStatus, string> = { draft: 'Draft', sent: 'Sent', paid: 'Paid' };

export function InvoiceSummaryCard({
  status,
  currency,
  subtotal,
  vat,
  total,
  taxRate,
  locked,
  saving,
  blocked = false,
  onSave,
  onMarkSent,
  onMarkPaid,
  issuer,
  onEditIssuer,
  pdfUrl,
}: InvoiceSummaryCardProps) {
  const activeIndex = STEPS.indexOf(status);
  return (
    <>
      <Card padding="20px 24px" className="flex flex-col gap-4">
        <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Summary</h2>
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background:
                      i <= activeIndex ? 'var(--mf-very-berry)' : 'var(--mf-gray-300)',
                  }}
                />
                <span
                  className="font-sans text-[13px]"
                  style={{
                    color: i <= activeIndex ? 'var(--text-strong)' : 'var(--text-muted)',
                    fontWeight: i === activeIndex ? 600 : 400,
                  }}
                >
                  {STEP_LABEL[step]}
                </span>
              </div>
              {i < STEPS.length - 1 && <span className="text-[var(--mf-gray-300)]">→</span>}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3">
          <div className="flex justify-between font-sans text-sm text-[var(--text-body)]">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between font-sans text-sm text-[var(--text-body)]">
            <span>VAT ({taxRate}%)</span>
            <span>{formatMoney(vat, currency)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-2.5">
            <span className="font-sans text-sm font-semibold text-[var(--text-strong)]">Total</span>
            <span className="font-sans text-[22px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
              {formatMoney(total, currency)}
            </span>
          </div>
        </div>
        {!locked && (
          <div className="flex flex-col gap-2">
            <Button fullWidth onClick={onSave} disabled={saving || blocked}>
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
            <Button variant="outline" fullWidth onClick={onMarkSent} disabled={blocked}>
              Mark as sent
            </Button>
          </div>
        )}
        {status === 'sent' && (
          <Button variant="outline" fullWidth onClick={onMarkPaid}>
            Mark as paid
          </Button>
        )}
        <p className="font-sans text-xs leading-relaxed text-[var(--text-muted)]">
          Once marked as sent, line items and totals lock permanently.
        </p>
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm font-medium text-[var(--text-strong)] underline underline-offset-2"
          >
            Download PDF
          </a>
        ) : null}
      </Card>
      {issuer && (
        <Card
          interactive
          hoverLift={false}
          onClick={onEditIssuer}
          padding="16px 20px"
          className="!border-[var(--mf-sand-200)] !bg-[var(--mf-sand-50)]"
        >
          <div className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mf-bark)]">
            Issuer
          </div>
          <div className="mt-1.5 font-sans text-sm font-medium text-[var(--text-strong)]">
            {issuer.name}
          </div>
          <div className="mt-0.5 font-sans text-[13px] text-[var(--text-muted)]">
            {issuer.email}
            {issuer.taxId ? ` · ${issuer.taxId}` : ''}
          </div>
        </Card>
      )}
    </>
  );
}
