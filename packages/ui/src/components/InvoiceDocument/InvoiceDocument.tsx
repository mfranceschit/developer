export type InvoicePartyInfo = {
  name: string;
  taxId?: string;
  address: string;
  phone: string;
  email: string;
};

export type InvoiceLineItem = {
  quantity: number;
  description: string;
  unitPrice: number;
};

export type InvoiceDocumentProps = {
  invoiceNumber: string;
  issueDate: string;
  issuer: InvoicePartyInfo;
  billTo: InvoicePartyInfo;
  lineItems: InvoiceLineItem[];
  currency: string;
  taxRate: number;
  totals: { subtotal: number; vat: number; total: number };
  notes?: string;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function PartyBlock({ label, party }: { label: string; party: InvoicePartyInfo }) {
  return (
    <div>
      <div className="font-sans text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-sans text-sm font-semibold text-[var(--text-strong)]">
        {party.name}
      </div>
      {party.taxId && (
        <div className="font-sans text-xs text-[var(--text-body)]">Tax ID: {party.taxId}</div>
      )}
      <div className="whitespace-pre-line font-sans text-xs text-[var(--text-body)]">
        {party.address}
      </div>
      <div className="font-sans text-xs text-[var(--text-body)]">{party.phone}</div>
      <div className="font-sans text-xs text-[var(--text-body)]">{party.email}</div>
    </div>
  );
}

export function InvoiceDocument({
  invoiceNumber,
  issueDate,
  issuer,
  billTo,
  lineItems,
  currency,
  taxRate,
  totals,
  notes,
}: InvoiceDocumentProps) {
  return (
    <div className="mx-auto max-w-[800px] bg-white p-12 text-[var(--text-body)] print:p-0">
      <style>{`@page { margin: 24mm 18mm; }`}</style>
      <div className="flex items-start justify-between">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-[var(--text-strong)]">
          INVOICE
        </h1>
        <div className="text-right font-sans text-sm text-[var(--text-body)]">
          <div>
            <span className="text-[var(--text-muted)]">Invoice Number </span>
            {invoiceNumber}
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Issue Date </span>
            {issueDate}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <PartyBlock label="Issuer" party={issuer} />
        <PartyBlock label="Bill To" party={billTo} />
      </div>

      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="py-2 text-left font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              Qty
            </th>
            <th className="py-2 text-left font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              Description
            </th>
            <th className="py-2 text-right font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              Unit Price ({currency})
            </th>
            <th className="py-2 text-right font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              VAT
            </th>
            <th className="py-2 text-right font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              Total ({currency})
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => (
            <tr key={index} className="border-b border-[var(--border-subtle)]">
              <td className="py-2 font-sans text-sm">{item.quantity}</td>
              <td className="py-2 font-sans text-sm">{item.description}</td>
              <td className="py-2 text-right font-sans text-sm">
                {formatMoney(item.unitPrice, currency)}
              </td>
              <td className="py-2 text-right font-sans text-sm">{taxRate}%</td>
              <td className="py-2 text-right font-sans text-sm">
                {formatMoney(item.quantity * item.unitPrice, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-64 font-sans text-sm">
          <div className="flex justify-between py-1">
            <span className="text-[var(--text-muted)]">Subtotal</span>
            <span>{formatMoney(totals.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[var(--text-muted)]">VAT ({taxRate}%)</span>
            <span>{formatMoney(totals.vat, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border-subtle)] py-2 font-semibold text-[var(--text-strong)]">
            <span>Total Due</span>
            <span>{formatMoney(totals.total, currency)}</span>
          </div>
        </div>
      </div>

      {notes && (
        <div className="mt-8 whitespace-pre-line font-sans text-xs text-[var(--text-muted)]">
          {notes}
        </div>
      )}
    </div>
  );
}
