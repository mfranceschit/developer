import { randomUUID } from 'node:crypto';
import type { Invoice } from '../../shared/types';
import { draftSanityClient } from './client';

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
