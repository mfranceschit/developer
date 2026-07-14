import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  listInvoices,
  markInvoiceStatus,
  patchInvoice,
} from '@/server/sanity/invoices';

export const listInvoicesFn = createServerFn({ method: 'GET', strict: { output: false } }).handler(
  async () => listInvoices(),
);

export const getInvoiceFn = createServerFn({ method: 'GET', strict: { output: false } })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => getInvoice(data.id));

export const createInvoiceFn = createServerFn({ method: 'POST', strict: { output: false } })
  .validator(z.object({ doc: z.record(z.string(), z.unknown()) }))
  .handler(async ({ data }) => createInvoice(data.doc as never));

export const patchInvoiceFn = createServerFn({ method: 'POST', strict: { output: false } })
  .validator(z.object({ id: z.string(), patch: z.record(z.string(), z.unknown()) }))
  .handler(async ({ data }) => patchInvoice(data.id, data.patch as never));

export const deleteInvoiceFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => deleteInvoice(data.id));

export const markInvoiceStatusFn = createServerFn({ method: 'POST', strict: { output: false } })
  .validator(z.object({ id: z.string(), status: z.enum(['sent', 'paid']) }))
  .handler(async ({ data }) => markInvoiceStatus(data.id, data.status));
