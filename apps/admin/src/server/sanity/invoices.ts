import { randomUUID } from 'node:crypto';
import type { Invoice } from '@/shared/types';
import { formatInvoiceNumber } from '@/shared/lib/format';
import { renderInvoicePdf } from '../pdf/renderInvoicePdf';
import { draftSanityClient } from './client';
import { uploadFileAsset } from './upload';

export async function nextInvoiceSeq(year: number): Promise<number> {
  const invoices = await draftSanityClient.fetch<Array<{ seq: number; issueDate: string }>>(
    `*[_type == "invoice"]{ seq, issueDate }`,
  );
  const seqs = invoices
    .filter((invoice) => Number(invoice.issueDate.slice(0, 4)) === year)
    .map((invoice) => invoice.seq);
  return Math.max(0, ...seqs) + 1;
}

export async function listInvoices(): Promise<Invoice[]> {
  return draftSanityClient.fetch<Invoice[]>(`*[_type == "invoice"] | order(issueDate desc)`);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const invoices = await draftSanityClient.fetch<Invoice[]>(
    `*[_type == "invoice" && _id == $id]`,
    { id },
  );
  return invoices[0] ?? null;
}

export async function createInvoice(
  doc: Omit<Invoice, '_id' | '_type' | 'seq'>,
): Promise<Invoice> {
  const year = Number(doc.issueDate.slice(0, 4));
  const seq = await nextInvoiceSeq(year);
  const _id = randomUUID();
  const created = await draftSanityClient.create({ ...doc, _id, _type: 'invoice', seq });
  return created as unknown as Invoice;
}

export async function patchInvoice(id: string, patch: Partial<Invoice>): Promise<Invoice> {
  const result = await draftSanityClient.patch(id).set(patch).commit();
  return result as unknown as Invoice;
}

export async function deleteInvoice(id: string): Promise<void> {
  await draftSanityClient.delete(id);
}

export async function markInvoiceStatus(
  id: string,
  status: 'sent' | 'paid',
): Promise<Invoice> {
  const invoice = await getInvoice(id);
  if (!invoice) {
    throw new Error(`Invoice not found: ${id}`);
  }
  const patch: Partial<Invoice> = { status };
  if (invoice.status === 'draft' && !invoice.pdf) {
    const buffer = await renderInvoicePdf(invoice);
    const asset = await uploadFileAsset(buffer, `${formatInvoiceNumber(invoice)}.pdf`);
    patch.pdf = { _type: 'file', asset };
  }
  return patchInvoice(id, patch);
}
