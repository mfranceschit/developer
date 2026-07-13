import { Button, InvoiceDocument } from '@mfranceschit/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useInvoice } from '@/features/invoices/queries';
import { formatInvoiceNumber } from '@/shared/lib/format';

export const Route = createFileRoute('/invoices/$id/print')({
  component: InvoicePrintPage,
});

function InvoicePrintPage() {
  const { id } = Route.useParams();
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading || !invoice) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  const invoiceNumber = formatInvoiceNumber(invoice);

  return (
    <div>
      <div className="p-6 print:hidden">
        <Button onClick={() => window.print()}>Print</Button>
      </div>
      <InvoiceDocument
        invoiceNumber={invoiceNumber}
        issueDate={invoice.issueDate}
        issuer={invoice.issuerSnapshot}
        billTo={{
          name: invoice.clientSnapshot.name,
          address: invoice.clientSnapshot.address,
          phone: invoice.clientSnapshot.phone,
          email: invoice.clientSnapshot.email,
        }}
        lineItems={invoice.lineItems}
        currency={invoice.currency}
        taxRate={invoice.taxRate}
        totals={invoice.totals}
        notes={invoice.notes}
      />
    </div>
  );
}
