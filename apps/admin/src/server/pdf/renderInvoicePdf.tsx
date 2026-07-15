import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocumentPdf } from '@mfranceschit/ui';

import { formatInvoiceNumber } from '@/shared/lib/format';
import type { Invoice } from '@/shared/types';

export async function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return renderToBuffer(
    <InvoiceDocumentPdf
      invoiceNumber={formatInvoiceNumber(invoice)}
      issueDate={invoice.issueDate}
      dueDate={invoice.dueDate}
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
    />,
  );
}
