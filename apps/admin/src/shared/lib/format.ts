export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function formatInvoiceNumber(invoice: { issueDate: string; seq: number }): string {
  const year = invoice.issueDate.slice(0, 4);
  const paddedSeq = String(invoice.seq).padStart(3, '0');
  return `INV-${year}-${paddedSeq}`;
}
