import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/server/functions/invoices', () => ({
  listInvoicesFn: vi.fn(async () => [{ _id: 'inv-a', invoiceNumber: 'INV-1' }]),
  getInvoiceFn: vi.fn(async () => ({ _id: 'inv-a', invoiceNumber: 'INV-1' })),
  createInvoiceFn: vi.fn(async () => ({ _id: 'inv-b', invoiceNumber: 'INV-2' })),
  patchInvoiceFn: vi.fn(async () => ({ _id: 'inv-a', invoiceNumber: 'INV-1-updated' })),
  deleteInvoiceFn: vi.fn(async () => undefined),
}));

vi.mock('@/server/functions/businessProfile', () => ({
  getBusinessProfileFn: vi.fn(async () => ({ _id: 'businessProfile', name: 'Acme' })),
  upsertBusinessProfileFn: vi.fn(async () => ({ _id: 'businessProfile', name: 'Acme Inc' })),
}));

import {
  createInvoiceFn,
  deleteInvoiceFn,
  getInvoiceFn,
  listInvoicesFn,
  patchInvoiceFn,
} from '@/server/functions/invoices';
import { getBusinessProfileFn, upsertBusinessProfileFn } from '@/server/functions/businessProfile';
import {
  useBusinessProfile,
  useCreateInvoice,
  useDeleteInvoice,
  useInvoice,
  useInvoiceList,
  usePatchInvoice,
  useUpsertBusinessProfile,
} from './queries';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useInvoiceList', () => {
  it('fetches the invoice list', async () => {
    const { result } = renderHook(() => useInvoiceList(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ _id: 'inv-a', invoiceNumber: 'INV-1' }]);
    expect(listInvoicesFn).toHaveBeenCalledWith();
  });
});

describe('useInvoice', () => {
  it('fetches a single invoice', async () => {
    const { result } = renderHook(() => useInvoice('inv-a'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ _id: 'inv-a', invoiceNumber: 'INV-1' });
    expect(getInvoiceFn).toHaveBeenCalledWith({ data: { id: 'inv-a' } });
  });
});

describe('useCreateInvoice', () => {
  it('creates an invoice', async () => {
    const { result } = renderHook(() => useCreateInvoice(), { wrapper });
    result.current.mutate({ invoiceNumber: 'INV-2' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ _id: 'inv-b', invoiceNumber: 'INV-2' });
    expect(createInvoiceFn).toHaveBeenCalledWith({ data: { doc: { invoiceNumber: 'INV-2' } } });
  });
});

describe('usePatchInvoice', () => {
  it('patches an invoice', async () => {
    const { result } = renderHook(() => usePatchInvoice(), { wrapper });
    result.current.mutate({ id: 'inv-a', patch: { invoiceNumber: 'INV-1-updated' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patchInvoiceFn).toHaveBeenCalledWith({
      data: { id: 'inv-a', patch: { invoiceNumber: 'INV-1-updated' } },
    });
  });
});

describe('useDeleteInvoice', () => {
  it('deletes an invoice', async () => {
    const { result } = renderHook(() => useDeleteInvoice(), { wrapper });
    result.current.mutate({ id: 'inv-a' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteInvoiceFn).toHaveBeenCalledWith({ data: { id: 'inv-a' } });
  });
});

describe('useBusinessProfile', () => {
  it('fetches the business profile', async () => {
    const { result } = renderHook(() => useBusinessProfile(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ _id: 'businessProfile', name: 'Acme' });
    expect(getBusinessProfileFn).toHaveBeenCalledWith();
  });
});

describe('useUpsertBusinessProfile', () => {
  it('upserts the business profile', async () => {
    const { result } = renderHook(() => useUpsertBusinessProfile(), { wrapper });
    result.current.mutate({ name: 'Acme Inc' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ _id: 'businessProfile', name: 'Acme Inc' });
    expect(upsertBusinessProfileFn).toHaveBeenCalledWith({ data: { name: 'Acme Inc' } });
  });
});
