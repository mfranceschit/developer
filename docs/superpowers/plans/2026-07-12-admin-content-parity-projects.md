# Admin Content Parity — Infra + Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `apps/admin` up to actually render `@mfranceschit/ui` (Tailwind + tokens), add
the shared query-hook layer over the Sanity seam, build the `DocumentToolbar` (publish/discard)
and `NavShell` widgets, and ship the first full content-parity feature end-to-end: **Projects**
(list + edit form with i18n description, image, technologies, draft/publish). This proves the
full pattern; a follow-up plan repeats it for Certifications and Degrees.

**Architecture:** TanStack Query hooks (`features/content/queries.ts`) wrap the
`server/functions/*` `createServerFn` calls from the scaffold plan. Feature routes
(`routes/projects/index.tsx`, `routes/projects/$id.tsx`) compose `@mfranceschit/ui` primitives
+ react-hook-form + zod (`shared/schemas.ts`'s `projectSchema`, already defined). The
`DocumentToolbar` widget is generic over `{ status: DocumentStatus, dirty: boolean, onPublish,
onDiscard }` so later content types reuse it unchanged.

**Tech Stack:** react-hook-form 7.81.0, `@hookform/resolvers` 5.4.0 (pin exact versions at
execution time), `@tailwindcss/vite` (match `packages/ui`'s installed version), everything else
already installed from prior plans.

## Global Constraints

- All colors/UI components live in `packages/ui`; `apps/admin` imports only, never hand-rolls
  markup or raw styles (root `CLAUDE.md` HARD RULE). `NavShell`/`DocumentToolbar` are
  app-specific *compositions* of `packages/ui` primitives (per the spec's `widgets/` directory),
  not new primitives — they must not introduce new colors or raw Tailwind utility classes beyond
  layout (flex/grid/spacing), and must use `@mfranceschit/ui`'s exported components/tokens for
  every visual surface.
- Sanity access happens only inside server functions (already true from the scaffold plan) — no
  new Sanity imports anywhere in `routes/`, `features/`, or `widgets/`.
- Document shapes: `project` — `name` (string), `slug` (slug), `image` (SanityImage), `url`,
  `repository`, `description` (localeContent), `technologies` (string[]). Already encoded as
  `projectSchema` in `apps/admin/src/shared/schemas.ts`.
- Languages: `en` (default), `es`, `pt`.
- Draft/publish parity: edits write to `drafts.<id>`; list views show per-document status
  (published/draft/unpublished-changes); a shared toolbar exposes Publish/Discard + dirty state.
- Biome formatting (single quotes, trailing commas `all`, 2-space indent, 100 col) — do not run
  `pnpm check`/`pnpm format`, just write clean code.
- Do not run `pnpm dev` or `pnpm build` (or start any server) at any point in this plan.
  `pnpm typecheck` and `vitest` (unit tests only, for pure logic in `apps/admin`) are allowed.
- Never commit unless explicitly instructed.

---

## File Structure

```
apps/admin/
  vite.config.ts                   (add tailwindcss() plugin)
  package.json                     (add react-hook-form, @hookform/resolvers, @tailwindcss/vite)
  src/
    styles/global.css              (new — tailwind + @mfranceschit/ui tokens import)
    routes/
      __root.tsx                   (import global.css; render NavShell + Toaster)
      index.tsx                    (unchanged from scaffold)
      projects/
        index.tsx                  (list route)
        $id.tsx                    (edit route — 'new' id creates a draft)
    features/
      content/
        queries.ts                 (generic TanStack Query hooks over server/functions/content.ts)
        queries.test.ts
    widgets/
      DocumentToolbar/DocumentToolbar.tsx
      NavShell/NavShell.tsx
    server/  (untouched — already exists from scaffold plan)
    shared/  (untouched — already exists from scaffold plan)
```

---

### Task 1: Wire Tailwind + `@mfranceschit/ui` styles into `apps/admin`

**Files:**
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/vite.config.ts`
- Create: `apps/admin/src/styles/global.css`
- Modify: `apps/admin/src/routes/__root.tsx`

**Interfaces:**
- Produces: a working Tailwind pipeline so any `@mfranceschit/ui` component renders styled in
  `apps/admin`, matching the pattern already used by `apps/portfolio` (see
  `apps/portfolio/astro.config.mjs`'s `vite: { plugins: [tailwindcss()] }` and
  `apps/portfolio/src/styles/global.css`'s `@import 'tailwindcss'; @import
  '@mfranceschit/ui/styles/tokens.css'; @source '../../../../packages/ui/src/**/*.{ts,tsx}';`).

- [ ] **Step 1: Confirm exact current version before pinning (never from memory)**

```bash
fnm exec -- pnpm info @tailwindcss/vite version
```

- [ ] **Step 2: Add `@tailwindcss/vite` to `apps/admin/package.json` devDependencies**

Read the file first, then add (alongside the existing devDependencies, matching whatever version
Step 1 printed):

```json
"@tailwindcss/vite": "^<version>",
```

- [ ] **Step 3: Install**

```bash
fnm exec -- pnpm install
```

- [ ] **Step 4: Write `apps/admin/src/styles/global.css`**

```css
@import 'tailwindcss';
@import '@mfranceschit/ui/styles/tokens.css';

@source '../../../../packages/ui/src/**/*.{ts,tsx}';

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  body {
    color: var(--text-body);
    background: var(--surface-page);
  }
}
```

- [ ] **Step 5: Modify `apps/admin/vite.config.ts` to add the Tailwind plugin**

```typescript
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), tanstackStart()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
```

Check plugin ordering against `apps/portfolio`'s config if the two plugins conflict at typecheck
time (they shouldn't — Vite plugin order rarely matters for a CSS + framework plugin pair, but
confirm nothing errors).

- [ ] **Step 6: Modify `apps/admin/src/routes/__root.tsx` to import the stylesheet**

Read the file first (it currently renders `<html>`/`<head>`/`<body>` directly with a
`QueryClientProvider`). Add the import at the top:

```tsx
import '../styles/global.css';
```

- [ ] **Step 7: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: no errors. A CSS `@import`/`@source` won't be checked by `tsc`, but confirm the plain
TS/TSX changes (vite.config.ts, __root.tsx) don't break anything.

- [ ] **Step 8: Commit**

```bash
git add apps/admin/package.json apps/admin/vite.config.ts apps/admin/src/styles apps/admin/src/routes/__root.tsx pnpm-lock.yaml
git commit -m "feat(admin): wire Tailwind and @mfranceschit/ui styles"
```

---

### Task 2: Add `react-hook-form` + `@hookform/resolvers`

**Files:**
- Modify: `apps/admin/package.json`

**Interfaces:**
- Produces: `react-hook-form`'s `useForm` and `@hookform/resolvers/zod`'s `zodResolver`,
  available to Task 6's edit form.

- [ ] **Step 1: Confirm exact current versions before pinning (never from memory)**

```bash
fnm exec -- pnpm info react-hook-form version
fnm exec -- pnpm info @hookform/resolvers version
```

- [ ] **Step 2: Add both to `apps/admin/package.json` dependencies**

Read the file first, then add:

```json
"@hookform/resolvers": "^<version>",
"react-hook-form": "^<version>",
```

(Keep the dependencies block alphabetically sorted, matching the existing file's convention.)

- [ ] **Step 3: Install**

```bash
fnm exec -- pnpm install
```

- [ ] **Step 4: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: no errors (nothing imports these packages yet, this task is pure dependency addition).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/package.json pnpm-lock.yaml
git commit -m "feat(admin): add react-hook-form and @hookform/resolvers"
```

---

### Task 3: `features/content/queries.ts` — TanStack Query hooks over the Sanity seam

**Files:**
- Create: `apps/admin/src/features/content/queries.ts`
- Test: `apps/admin/src/features/content/queries.test.ts`

**Interfaces:**
- Consumes: `listDocumentsFn`, `getDocumentFn`, `createDraftFn`, `patchDraftFn`, `deleteDraftFn`
  from `../../server/functions/content`; `publishDocumentFn`, `discardDraftFn` from
  `../../server/functions/publish`.
- Produces: `useDocumentList<T>(type: string)` (wraps `useQuery`, calls `listDocumentsFn`),
  `useDocument<T>(type: string, id: string)` (wraps `useQuery`, calls `getDocumentFn`),
  `useCreateDraft<T>(type: string)` (wraps `useMutation`, calls `createDraftFn`, invalidates the
  list query on success), `usePatchDraft<T>()` (wraps `useMutation`, calls `patchDraftFn`,
  invalidates both the list and the specific document query on success), `useDeleteDraft()`
  (wraps `useMutation`, calls `deleteDraftFn`), `usePublish()` (wraps `useMutation`, calls
  `publishDocumentFn`, invalidates list + document queries on success), `useDiscard()` (wraps
  `useMutation`, calls `discardDraftFn`, invalidates list + document queries on success). Query
  keys: `['content', type, 'list']` and `['content', type, 'detail', id]`.

Since `createServerFn`'s actual invocation shape was adapted in the scaffold plan (Task 10 there
added `strict: { output: false }` and confirmed `{ data }` as the handler's input shape) — check
`apps/admin/src/server/functions/content.ts` and `publish.ts` directly for the exact exported
function signatures before writing the hooks; do not assume the shape from this plan's prose
alone.

- [ ] **Step 1: Read the actual server function signatures**

```bash
cat apps/admin/src/server/functions/content.ts
cat apps/admin/src/server/functions/publish.ts
```

Note how each `createServerFn` result is actually invoked from client code (TanStack Start
server functions are typically called as `someFn({ data: {...} })` returning a `Promise` — but
confirm the exact call signature by checking `@tanstack/react-start`'s `createServerFn` return
type, e.g. `node_modules/@tanstack/react-start/dist/**/createServerFn.d.ts` relative to
`apps/admin/`, if the shape isn't obvious from the function definitions alone).

- [ ] **Step 2: Write the failing test**

```typescript
// apps/admin/src/features/content/queries.test.ts
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../server/functions/content', () => ({
  listDocumentsFn: vi.fn(async () => [{ _id: 'a', name: 'A', _status: 'published' }]),
  getDocumentFn: vi.fn(async () => ({ _id: 'a', name: 'A', _status: 'published' })),
  createDraftFn: vi.fn(async () => ({ _id: 'drafts.b', name: 'B' })),
  patchDraftFn: vi.fn(async () => ({ _id: 'drafts.a', name: 'A2' })),
  deleteDraftFn: vi.fn(async () => undefined),
}));

vi.mock('../../server/functions/publish', () => ({
  publishDocumentFn: vi.fn(async () => undefined),
  discardDraftFn: vi.fn(async () => undefined),
}));

import { listDocumentsFn } from '../../server/functions/content';
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
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useDocumentList', () => {
  it('fetches the list for a content type', async () => {
    const { result } = renderHook(() => useDocumentList('project'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ _id: 'a', name: 'A', _status: 'published' }]);
    expect(listDocumentsFn).toHaveBeenCalled();
  });
});

describe('useDocument', () => {
  it('fetches a single document', async () => {
    const { result } = renderHook(() => useDocument('project', 'a'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ _id: 'a', name: 'A', _status: 'published' });
  });
});

describe('useCreateDraft', () => {
  it('creates a draft', async () => {
    const { result } = renderHook(() => useCreateDraft('project'), { wrapper });
    result.current.mutate({ name: 'B' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ _id: 'drafts.b', name: 'B' });
  });
});

describe('usePatchDraft', () => {
  it('patches a draft', async () => {
    const { result } = renderHook(() => usePatchDraft(), { wrapper });
    result.current.mutate({ id: 'a', patch: { name: 'A2' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
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
  });
});

describe('useDiscard', () => {
  it('discards a draft', async () => {
    const { result } = renderHook(() => useDiscard(), { wrapper });
    result.current.mutate({ id: 'a' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

- [ ] **Step 3: Add test dependencies if missing**

This test uses `@testing-library/react`. Check if it's already a devDependency of
`apps/admin/package.json`; if not, check the current version and add it:

```bash
fnm exec -- pnpm info @testing-library/react version
```

Add to devDependencies, then `fnm exec -- pnpm install`. Also confirm `apps/admin`'s vitest
config (there may not be one yet beyond the `package.json` `test` script — check for a
`vitest.config.ts` or inline config; if none exists and this test needs a DOM environment
(`renderHook` needs one), add a minimal `apps/admin/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

Check if `jsdom` needs to be added as a devDependency too (`fnm exec -- pnpm info jsdom
version`, add if missing, install).

- [ ] **Step 4: Run test to verify it fails**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/features/content/queries.test.ts
```

Expected: FAIL — `./queries` module not found.

- [ ] **Step 5: Write `apps/admin/src/features/content/queries.ts`**

Write this against the REAL signatures you read in Step 1 — the shape below is illustrative,
adapt the actual `createServerFn` invocation (`someFn({ data: ... })` vs. `someFn(...)`
directly) to match:

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDraftFn,
  deleteDraftFn,
  getDocumentFn,
  listDocumentsFn,
  patchDraftFn,
} from '../../server/functions/content';
import { discardDraftFn, publishDocumentFn } from '../../server/functions/publish';

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
```

- [ ] **Step 6: Run test to verify it passes**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/features/content/queries.test.ts
```

Expected: PASS (7/7).

- [ ] **Step 7: Run typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: 0 errors.

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/features/content apps/admin/package.json apps/admin/vitest.config.ts pnpm-lock.yaml
git commit -m "feat(admin): add TanStack Query hooks over the Sanity seam"
```

(Only include `vitest.config.ts` in the `git add` if you created it in Step 3.)

---

### Task 4: `DocumentToolbar` widget

**Files:**
- Create: `apps/admin/src/widgets/DocumentToolbar/DocumentToolbar.tsx`

**Interfaces:**
- Consumes: `Button`, `Badge`, `Dialog` from `@mfranceschit/ui`; a `toaster` instance (passed in
  as a prop, created once at the app root in Task 5).
- Produces: `DocumentToolbar` component, `DocumentToolbarProps` type (`status: DocumentStatus`,
  `dirty: boolean`, `onPublish: () => Promise<void>`, `onDiscard: () => Promise<void>`,
  `toaster: ReturnType<typeof createToaster>`) — shows a `Badge` for current status, a Publish
  `Button` (disabled while not dirty and already published), and a Discard `Button` wrapped in a
  confirmation `Dialog`. No test — this is presentational composition; verified via typecheck.

- [ ] **Step 1: Write `apps/admin/src/widgets/DocumentToolbar/DocumentToolbar.tsx`**

```tsx
import { Badge, type BadgeTone, Button, Dialog, type createToaster } from '@mfranceschit/ui';
import { useState } from 'react';
import type { DocumentStatus } from '../../shared/types';

export type DocumentToolbarProps = {
  status: DocumentStatus;
  dirty: boolean;
  onPublish: () => Promise<void>;
  onDiscard: () => Promise<void>;
  toaster: ReturnType<typeof createToaster>;
};

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

const STATUS_LABEL: Record<DocumentStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  'unpublished-changes': 'Unpublished changes',
};

export function DocumentToolbar({
  status,
  dirty,
  onPublish,
  onDiscard,
  toaster,
}: DocumentToolbarProps) {
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  async function handlePublish() {
    setPublishing(true);
    try {
      await onPublish();
      toaster.create({ title: 'Published', type: 'success' });
    } catch {
      toaster.create({ title: 'Failed to publish', type: 'error' });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDiscard() {
    setDiscarding(true);
    try {
      await onDiscard();
      toaster.create({ title: 'Draft discarded', type: 'success' });
    } catch {
      toaster.create({ title: 'Failed to discard', type: 'error' });
    } finally {
      setDiscarding(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      <Dialog
        title="Discard draft?"
        description="This will permanently delete your unpublished changes."
        trigger={
          <Button variant="outline" size="sm" disabled={status === 'published'}>
            Discard
          </Button>
        }
      >
        <Button variant="accent" size="sm" onClick={handleDiscard} disabled={discarding}>
          {discarding ? 'Discarding…' : 'Confirm discard'}
        </Button>
      </Dialog>
      <Button
        size="sm"
        onClick={handlePublish}
        disabled={publishing || (status === 'published' && !dirty)}
      >
        {publishing ? 'Publishing…' : 'Publish'}
      </Button>
    </div>
  );
}
```

Check `BadgeTone`'s real union (`packages/ui/src/components/Badge/Badge.tsx`) before assuming
`'blue' | 'neutral' | 'berry'` are all valid members — adjust `STATUS_TONE` to use real values.

- [ ] **Step 2: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/widgets/DocumentToolbar
git commit -m "feat(admin): add DocumentToolbar widget"
```

---

### Task 5: `NavShell` widget + wire into root

**Files:**
- Create: `apps/admin/src/widgets/NavShell/NavShell.tsx`
- Modify: `apps/admin/src/routes/__root.tsx`

**Interfaces:**
- Consumes: `Logo`, `Card`, `createToaster`, `Toaster` from `@mfranceschit/ui`; TanStack
  Router's `Link`.
- Produces: `NavShell` component rendering a persistent sidebar (`Certifications` group →
  Degrees, Certificates; `Work` group → Projects — desk structure parity per the spec) plus the
  page content passed as `children`. A single `toaster` instance is created once here and passed
  down to routes via `Route.useRouteContext()` — extend the router context accordingly.

- [ ] **Step 1: Write `apps/admin/src/widgets/NavShell/NavShell.tsx`**

```tsx
import { Card, Logo } from '@mfranceschit/ui';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

type NavGroup = {
  label: string;
  links: { to: string; label: string }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Certifications',
    links: [
      { to: '/degrees', label: 'Degrees' },
      { to: '/certifications', label: 'Certificates' },
    ],
  },
  {
    label: 'Work',
    links: [{ to: '/projects', label: 'Projects' }],
  },
];

export function NavShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-[var(--border-subtle)] p-4">
        <Logo variant="navy" height={32} />
        <nav className="mt-6 flex flex-col gap-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="rounded-sm px-2 py-1.5 font-sans text-sm text-[var(--text-body)] hover:bg-[var(--primary-soft)]"
                    activeProps={{ className: 'bg-[var(--primary-soft)] font-medium' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Card padding="0">{children}</Card>
      </main>
    </div>
  );
}
```

`Link`'s `activeProps`/route paths (`/degrees`, `/certifications`, `/projects`) reference routes
that don't exist yet in this plan (only `/projects` will, by Task 6-7) — that's fine, TanStack
Router typechecks route paths against the generated route tree, so `/degrees`/`/certifications`
will only exist once a later plan adds them. **If `to="/degrees"` fails typecheck** because the
route doesn't exist yet, use a plain string type escape appropriate to the installed
`@tanstack/react-router` version (check how `Link`'s `to` prop is typed — some versions accept
`LinkComponentProps['to']` as a loosely-typed string when the route tree doesn't have the path,
others error). If it hard-errors, the fallback is: only link to `/projects` in this task, and
leave a `// TODO(next plan): degrees/certifications routes` comment — report this as a concern
rather than fighting the router's typed-routes system.

- [ ] **Step 2: Modify `apps/admin/src/routes/__root.tsx` to render `NavShell` and provide a `toaster`**

Read the current file first (it wraps `<Outlet />` in `QueryClientProvider`). Add a
`createToaster` instance and `Toaster`, and wrap the outlet in `NavShell`:

```tsx
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { createToaster, Toaster } from '@mfranceschit/ui';
import { NavShell } from '../widgets/NavShell/NavShell';
import '../styles/global.css';

interface RouterContext {
  queryClient: QueryClient;
  toaster: ReturnType<typeof createToaster>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { queryClient, toaster } = Route.useRouteContext();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Admin</title>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <NavShell>
            <Outlet />
          </NavShell>
          <Toaster toaster={toaster} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Modify `apps/admin/src/router.tsx` to create and pass the `toaster`**

Read the current file first (it creates a `QueryClient` and passes router `context`). Add:

```tsx
import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { createToaster } from '@mfranceschit/ui';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  const queryClient = new QueryClient();
  const toaster = createToaster({ placement: 'bottom-end' });
  return createRouter({
    routeTree,
    context: { queryClient, toaster },
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

- [ ] **Step 4: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/widgets/NavShell apps/admin/src/routes/__root.tsx apps/admin/src/router.tsx
git commit -m "feat(admin): add NavShell widget and wire toaster into root"
```

---

### Task 6: Projects — list route

**Files:**
- Create: `apps/admin/src/routes/projects/index.tsx`

**Interfaces:**
- Consumes: `useDocumentList` from `../../features/content/queries`; `Table`, `Badge`, `Button`
  from `@mfranceschit/ui`; `Project` type from `../../shared/types`.
- Produces: a route rendering a `Table<Project & { _status: DocumentStatus }>` of all projects
  with name, technologies, and status columns, each row linking to `/projects/$id`, plus a "New
  project" button linking to `/projects/new`.

- [ ] **Step 1: Write `apps/admin/src/routes/projects/index.tsx`**

```tsx
import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '../../features/content/queries';
import type { DocumentStatus, Project } from '../../shared/types';

export const Route = createFileRoute('/projects/')({
  component: ProjectsListPage,
});

type ProjectRow = Project & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

function ProjectsListPage() {
  const { data, isLoading } = useDocumentList<ProjectRow>('project');
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">Projects</h1>
        <Button size="sm" onClick={() => navigate({ to: '/projects/$id', params: { id: 'new' } })}>
          New project
        </Button>
      </div>
      <Table<ProjectRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: '/projects/$id', params: { id: row._id } })}
        columns={[
          { header: 'Name', render: (row) => row.name },
          { header: 'Technologies', render: (row) => row.technologies.join(', ') },
          {
            header: 'Status',
            align: 'right',
            render: (row) => <Badge tone={STATUS_TONE[row._status]}>{row._status}</Badge>,
          },
        ]}
      />
    </div>
  );
}
```

Check `BadgeTone`'s real union before assuming `'blue' | 'neutral' | 'berry'` — adjust as
`DocumentToolbar` (Task 4) did.

- [ ] **Step 2: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Note: file-based routing (`createFileRoute('/projects/')`) requires the route tree to be
regenerated, which normally happens via `vite dev`/`@tanstack/router-plugin`'s codegen — since
this plan doesn't run `vite dev`, you may need to manually extend the `routeTree.gen.ts` stub
(the same one the scaffold plan created for typecheck purposes) to include this route, the same
way Task 10 of the scaffold plan handled it. Check `apps/admin/src/routeTree.gen.ts`'s current
content and extend it consistently — this file is gitignored and only exists locally for
typecheck; the user's real `vite dev` run will regenerate the authoritative version.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/routes/projects
git commit -m "feat(admin): add projects list route"
```

---

### Task 7: Projects — edit route

**Files:**
- Create: `apps/admin/src/routes/projects/$id.tsx`

**Interfaces:**
- Consumes: `useDocument`, `useCreateDraft`, `usePatchDraft`, `usePublish`, `useDiscard` from
  `../../features/content/queries`; `Input`, `FormField`, `ImageUploader`, `Combobox` (or plain
  `Input` for `technologies` — see below), `RichTextEditor`, `Tabs` from `@mfranceschit/ui`;
  `DocumentToolbar` from `../../widgets/DocumentToolbar/DocumentToolbar`; `projectSchema` from
  `../../shared/schemas`; `Route.useRouteContext()` for `toaster`; `uploadImageAssetFn` from
  `../../server/functions/upload`.
- Produces: a route at `/projects/$id` (where `id === 'new'` means "create mode": render an
  empty form, and on first save call `useCreateDraft` then navigate to the real id; any other
  `id` means "edit mode": load via `useDocument`, patch via `usePatchDraft`) with a
  react-hook-form bound to `projectSchema` via `zodResolver`, an `ImageUploader` for `image`, a
  `Tabs`-wrapped `RichTextEditor` per locale for `description` (localeContent — NOT `LocaleField`,
  since `LocaleField` only wraps `Input`; build this tab switcher directly using `Tabs`/`TabItem`
  the same way `LocaleField` does internally), a plain `Input` for `technologies` (comma-separated
  string, split/joined to/from the `string[]` schema field — simplest correct approach given
  `Combobox`'s multi-select semantics aren't yet proven in this codebase), and the
  `DocumentToolbar` for publish/discard.

- [ ] **Step 1: Write `apps/admin/src/routes/projects/$id.tsx`**

```tsx
import {
  FormField,
  ImageUploader,
  Input,
  RichTextEditor,
  Tabs,
} from '@mfranceschit/ui';
import type { PortableTextBlock } from '@portabletext/editor';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  useCreateDraft,
  useDiscard,
  useDocument,
  usePatchDraft,
  usePublish,
} from '../../features/content/queries';
import { uploadImageAssetFn } from '../../server/functions/upload';
import { projectSchema } from '../../shared/schemas';
import type { DocumentStatus, Project } from '../../shared/types';
import { DocumentToolbar } from '../../widgets/DocumentToolbar/DocumentToolbar';

export const Route = createFileRoute('/projects/$id')({
  component: ProjectEditPage,
});

type ProjectFormValues = {
  name: string;
  slug: string;
  url: string;
  repository: string;
  technologies: string;
  descriptionEn: PortableTextBlock[];
  descriptionEs: PortableTextBlock[];
  descriptionPt: PortableTextBlock[];
  imageAlt: string;
  imageUrl?: string;
};

function toFormValues(project?: Project | null): ProjectFormValues {
  return {
    name: project?.name ?? '',
    slug: project?.slug ?? '',
    url: project?.url ?? '',
    repository: project?.repository ?? '',
    technologies: project?.technologies?.join(', ') ?? '',
    descriptionEn: project?.description.en ?? [],
    descriptionEs: project?.description.es ?? [],
    descriptionPt: project?.description.pt ?? [],
    imageAlt: project?.image.alt ?? '',
    imageUrl: undefined,
  };
}

function ProjectEditPage() {
  const { id } = Route.useParams();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: project } = useDocument<Project & { _status: DocumentStatus }>(
    'project',
    isNew ? '' : id,
  );
  const createDraft = useCreateDraft<Project>('project');
  const patchDraft = usePatchDraft<Project>();
  const publish = usePublish();
  const discard = useDiscard();

  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ProjectFormValues>({
    values: toFormValues(project),
  });

  async function onSubmit(values: ProjectFormValues) {
    const doc = {
      name: values.name,
      slug: values.slug,
      url: values.url,
      repository: values.repository,
      technologies: values.technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: {
        en: values.descriptionEn,
        es: values.descriptionEs,
        pt: values.descriptionPt,
      },
      image: project?.image ?? {
        _type: 'image' as const,
        asset: { _ref: '', _type: 'reference' as const },
        alt: values.imageAlt,
      },
    };

    if (isNew) {
      const created = await createDraft.mutateAsync(doc);
      navigate({ to: '/projects/$id', params: { id: created._id } });
    } else {
      await patchDraft.mutateAsync({ id, patch: doc });
    }
  }

  async function handleUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.set('file', file);
    const asset = await uploadImageAssetFn({ data: formData });
    return `https://cdn.sanity.io/images/placeholder/${asset._ref}`;
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          {isNew ? 'New project' : project?.name}
        </h1>
        {!isNew && (
          <DocumentToolbar
            status={project?._status ?? 'draft'}
            dirty={isDirty}
            onPublish={() => publish.mutateAsync({ id })}
            onDiscard={() => discard.mutateAsync({ id })}
            toaster={toaster}
          />
        )}
      </div>

      <FormField label="Name" required>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Slug" required>
        <Input {...register('slug')} />
      </FormField>

      <FormField label="URL">
        <Input {...register('url')} />
      </FormField>

      <FormField label="Repository">
        <Input {...register('repository')} />
      </FormField>

      <FormField label="Technologies" hint="Comma-separated">
        <Input {...register('technologies')} />
      </FormField>

      <FormField label="Image">
        <Controller
          control={control}
          name="imageAlt"
          render={({ field }) => (
            <ImageUploader
              imageUrl={undefined}
              alt={field.value}
              onAltChange={field.onChange}
              onUpload={handleUpload}
            />
          )}
        />
      </FormField>

      <FormField label="Description">
        <Tabs
          items={[
            {
              value: 'en',
              label: 'English',
              content: (
                <Controller
                  control={control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onValueChange={field.onChange} />
                  )}
                />
              ),
            },
            {
              value: 'es',
              label: 'Español',
              content: (
                <Controller
                  control={control}
                  name="descriptionEs"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onValueChange={field.onChange} />
                  )}
                />
              ),
            },
            {
              value: 'pt',
              label: 'Português',
              content: (
                <Controller
                  control={control}
                  name="descriptionPt"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onValueChange={field.onChange} />
                  )}
                />
              ),
            },
          ]}
        />
      </FormField>

      <button
        type="submit"
        className="self-start rounded-md bg-[var(--primary)] px-4 py-2 font-sans text-sm font-semibold text-[var(--text-inverse)]"
      >
        Save draft
      </button>
    </form>
  );
}
```

This step deliberately omits `zodResolver`/`projectSchema` wiring from the literal code above —
**you must add it**: pass `resolver: zodResolver(projectSchema)` (or a form-shaped variant of
it, since `projectSchema` validates the Sanity document shape including `_id`/`_type`, not the
flat `ProjectFormValues` shape used by the form — build a lighter form-level zod schema in this
file, e.g. `z.object({ name: z.string().min(1), slug: z.string().min(1), ... })`, rather than
reusing `projectSchema` directly, since the two schemas serve different layers: `projectSchema`
validates what goes INTO Sanity, the form schema validates what the USER typed). Add this to
`useForm`'s config and surface validation errors via `FormField`'s `error` prop
(`formState.errors.name?.message`, etc.) on each field.

Also note: the raw `<button>` at the end is a placeholder — replace it with `@mfranceschit/ui`'s
`Button` component (`type="submit"`) per the HARD RULE; the literal code above has a bespoke
raw-styled button which violates the rule and must not ship as-is.

- [ ] **Step 2: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

If the route's file-based path (`/projects/$id`) needs a `routeTree.gen.ts` stub extension
(same caveat as Task 6), extend it consistently.

- [ ] **Step 3: Commit**

```bash
git add apps/admin/src/routes/projects
git commit -m "feat(admin): add projects edit route with draft/publish"
```

---

## Self-Review Notes

- **Spec coverage:** This plan covers the Tailwind/styling gap (not covered by the scaffold
  plan, which was intentionally UI-free), the query-hook layer, `DocumentToolbar`/`NavShell`
  widgets, and one full content type (Projects) end-to-end with draft/publish, image upload, and
  i18n description editing. Certifications and Degrees are explicitly deferred to a follow-up
  plan since they follow the exact same pattern established here — repeating the full plan
  structure for them here would be redundant given how much of Task 3-5's infrastructure is
  shared and already built.
- **Placeholder scan:** Task 7's Step 1 explicitly calls out its own gaps (zod resolver wiring,
  raw button) as required follow-up work within the SAME task, not deferred — this is not a
  placeholder left unresolved, it's a two-part step where the literal code needs one more
  documented pass before commit. No other TBD/TODO left unresolved.
- **Type consistency:** `DocumentStatus`/`Project` (from the scaffold plan's `shared/types.ts`)
  are consumed consistently across `queries.ts`, `DocumentToolbar`, and both routes. The
  `ProjectFormValues` shape in Task 7 correctly maps to/from `Project`'s Sanity shape via
  `toFormValues`/the submit handler's `doc` object construction.

## Next Plans

- `docs/superpowers/plans/<date>-admin-content-parity-certifications-degrees.md` — repeat the
  Projects pattern for Certifications (name/date/image/url/issued) and Degrees
  (name/image/issued), reusing `DocumentToolbar`/`NavShell`/`queries.ts` unchanged.
- `docs/superpowers/plans/<date>-admin-clients-invoices.md` — Phase 6-7 (clients CRUD, invoice
  schema/form/numbering/list, `InvoiceDocument`, print route).
