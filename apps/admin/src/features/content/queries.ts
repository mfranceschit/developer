import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDraftFn,
  deleteDraftFn,
  getDocumentFn,
  listDocumentsFn,
  patchDraftFn,
} from '@/server/functions/content';
import { discardDraftFn, publishDocumentFn } from '@/server/functions/publish';

export function useDocumentList<T>(type: string) {
  return useQuery({
    queryKey: ['content', type, 'list'],
    queryFn: () => listDocumentsFn({ data: { type } }) as Promise<T[]>,
  });
}

export function useDocument<T>(type: string, id: string) {
  return useQuery({
    queryKey: ['content', type, 'detail', id],
    queryFn: () => getDocumentFn({ data: { type, id } }) as Promise<T | null>,
    enabled: Boolean(id),
  });
}

export function useCreateDraft<T>(type: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: Record<string, unknown>) =>
      createDraftFn({ data: { type, doc } }) as Promise<T>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', type, 'list'] });
    },
  });
}

export function usePatchDraft<T>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      patchDraftFn({ data: { id, patch } }) as Promise<T>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteDraftFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}

export function usePublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => publishDocumentFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}

export function useDiscard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => discardDraftFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}
