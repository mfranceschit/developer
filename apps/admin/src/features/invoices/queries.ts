import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBusinessProfileFn, upsertBusinessProfileFn } from '@/server/functions/businessProfile';
import {
  createInvoiceFn,
  deleteInvoiceFn,
  getInvoiceFn,
  listInvoicesFn,
  patchInvoiceFn,
} from '@/server/functions/invoices';
import type { BusinessProfile, Invoice } from '@/shared/types';

export function useInvoiceList() {
  return useQuery({
    queryKey: ['invoices', 'list'],
    queryFn: () => listInvoicesFn() as Promise<Invoice[]>,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', 'detail', id],
    queryFn: () => getInvoiceFn({ data: { id } }) as Promise<Invoice | null>,
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: Record<string, unknown>) =>
      createInvoiceFn({ data: { doc } }) as Promise<Invoice>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function usePatchInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      patchInvoiceFn({ data: { id, patch } }) as Promise<Invoice>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteInvoiceFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useBusinessProfile() {
  return useQuery({
    queryKey: ['businessProfile'],
    queryFn: () => getBusinessProfileFn() as Promise<BusinessProfile | null>,
  });
}

export function useUpsertBusinessProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: Record<string, unknown>) =>
      upsertBusinessProfileFn({ data: doc }) as Promise<BusinessProfile>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessProfile'] });
    },
  });
}
