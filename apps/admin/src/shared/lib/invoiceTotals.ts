import type { InvoiceTotals, LineItem } from '@/shared/types';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateInvoiceTotals(lineItems: LineItem[], taxRate: number): InvoiceTotals {
  const subtotal = round2(
    lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  );
  const vat = round2(subtotal * (taxRate / 100));
  const total = round2(subtotal + vat);
  return { subtotal, vat, total };
}
