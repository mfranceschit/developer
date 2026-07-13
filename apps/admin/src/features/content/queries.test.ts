import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/server/functions/content', () => ({
  listDocumentsFn: vi.fn(async () => [{ _id: 'a', name: 'A', _status: 'published' }]),
  getDocumentFn: vi.fn(async () => ({ _id: 'a', name: 'A', _status: 'published' })),
  createDraftFn: vi.fn(async () => ({ _id: 'drafts.b', name: 'B' })),
  patchDraftFn: vi.fn(async () => ({ _id: 'drafts.a', name: 'A2' })),
  deleteDraftFn: vi.fn(async () => undefined),
}));

vi.mock('@/server/functions/publish', () => ({
  publishDocumentFn: vi.fn(async () => undefined),
  discardDraftFn: vi.fn(async () => undefined),
}));

import { createDraftFn, getDocumentFn, listDocumentsFn, patchDraftFn } from '@/server/functions/content';
import { discardDraftFn, publishDocumentFn } from '@/server/functions/publish';
import {
  useCreateDraft,
  useDeleteDraft,
  useDiscard,
  useDocument,
  useDocumentList,
  usePatchDraft,
  usePublish,
} from './queries';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useDocumentList', () => {
  it('fetches the list for a content type', async () => {
    const { result } = renderHook(() => useDocumentList('project'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ _id: 'a', name: 'A', _status: 'published' }]);
    expect(listDocumentsFn).toHaveBeenCalledWith({ data: { type: 'project' } });
  });
});

describe('useDocument', () => {
  it('fetches a single document', async () => {
    const { result } = renderHook(() => useDocument('project', 'a'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ _id: 'a', name: 'A', _status: 'published' });
    expect(getDocumentFn).toHaveBeenCalledWith({ data: { type: 'project', id: 'a' } });
  });
});

describe('useCreateDraft', () => {
  it('creates a draft', async () => {
    const { result } = renderHook(() => useCreateDraft('project'), { wrapper });
    result.current.mutate({ name: 'B' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ _id: 'drafts.b', name: 'B' });
    expect(createDraftFn).toHaveBeenCalledWith({ data: { type: 'project', doc: { name: 'B' } } });
  });
});

describe('usePatchDraft', () => {
  it('patches a draft', async () => {
    const { result } = renderHook(() => usePatchDraft(), { wrapper });
    result.current.mutate({ id: 'a', patch: { name: 'A2' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patchDraftFn).toHaveBeenCalledWith({ data: { id: 'a', patch: { name: 'A2' } } });
  });
});

describe('useDeleteDraft', () => {
  it('deletes a draft', async () => {
    const { result } = renderHook(() => useDeleteDraft(), { wrapper });
    result.current.mutate({ id: 'a' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('usePublish', () => {
  it('publishes a document', async () => {
    const { result } = renderHook(() => usePublish(), { wrapper });
    result.current.mutate({ id: 'a' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(publishDocumentFn).toHaveBeenCalledWith({ data: { id: 'a' } });
  });
});

describe('useDiscard', () => {
  it('discards a draft', async () => {
    const { result } = renderHook(() => useDiscard(), { wrapper });
    result.current.mutate({ id: 'a' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(discardDraftFn).toHaveBeenCalledWith({ data: { id: 'a' } });
  });
});
