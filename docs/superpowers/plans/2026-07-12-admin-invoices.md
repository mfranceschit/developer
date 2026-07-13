# Admin Invoices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship invoice generation end-to-end — `businessProfile` (issuer singleton), `invoice`
CRUD with per-year numbering and frozen snapshots, a branded `InvoiceDocument` component, and a
print route. This is Phase 7, the last phase of `docs/superpowers/specs/2026-07-12-admin-studio-invoices-design.md`.

**Architecture:** Unlike `project`/`certification`/`degree`/`client`, **invoices are exempt from
draft/publish** (spec: "financial records don't fit that model"). They are written directly
(no `drafts.<id>` prefix) and governed by `status: 'draft' | 'sent' | 'paid'` instead — editable
while `status === 'draft'`; once `status !== 'draft'`, the edit form locks and the `totals`/
snapshots are permanently frozen (enforced by simply refusing to call the patch mutation once
locked — the server function itself has no separate lock check in this v1, matching the spec's
"explicit design choice — revisit if undesired" framing for the whole exemption). This means the
existing `server/sanity/mutations.ts` (`createDraft`/`patchDraft`/`deleteDraft`, all
`drafts.<id>`-based) and `features/content/queries.ts` (draft/publish-aware) are **not reused for
invoices** — a parallel, simpler direct-write layer is built instead.

`businessProfile` is a **singleton** (`_id: 'businessProfile'`, fixed) — also not draft-based;
edited in place via `createOrReplace`.

**Tech Stack:** No new dependencies.

## Global Constraints

- All colors/UI components live in `packages/ui`; `apps/admin` imports only (HARD RULE).
- Invoice numbering: `seq` = `(max seq among invoices of the current year) + 1` at **create**
  time; display number `INV-{year}-{seq:03}` (e.g. `INV-2026-007`), derived from `issueDate`'s
  year. Sequence resets per year. Not atomic in this v1 (spec: "fine for a single local user").
- Totals (`{ subtotal, vat, total }`) computed via the already-built
  `apps/admin/src/shared/lib/invoiceTotals.ts`'s `calculateInvoiceTotals(lineItems, taxRate)` —
  reuse this, do not reimplement.
- `issuerSnapshot`/`clientSnapshot` are re-captured fresh on every save **while `status ===
  'draft'`**; once the status transitions away from `'draft'`, no further patches are allowed
  (enforced client-side by locking the form) so the snapshot and totals become permanently frozen
  from that point, matching the spec's rationale.
- Currency: per-invoice, default `USD`. Tax: single invoice-level VAT rate, echoed per line and
  in totals (no mixed per-line rates in v1).
- Due date optional. No IBAN/payment-terms fields in v1.
- Biome formatting (single quotes, trailing commas `all`, 2-space indent, 100 col).
- Do not run `pnpm dev` or `pnpm build` (or start any server). `pnpm typecheck` and `vitest`
  (unit tests for the new server-layer/query-hook logic, matching prior plans' convention) are
  allowed for verification.
- Never commit unless explicitly instructed.

---

## File Structure

```
apps/admin/src/
  server/
    sanity/
      invoices.ts              (direct create/patch/list/get + numbering)
      invoices.test.ts
      businessProfile.ts       (singleton get/upsert)
      businessProfile.test.ts
    functions/
      invoices.ts               (createServerFn wrappers)
      businessProfile.ts        (createServerFn wrappers)
  features/
    invoices/
      queries.ts                (TanStack Query hooks, invoice-specific — not the generic
                                  draft-based content/queries.ts)
      queries.test.ts
  routes/
    invoices/
      index.tsx                 (list route)
      $id.tsx                   (edit route — 'new' id creates)
      $id.print.tsx             (print route)
    settings/
      business-profile.tsx      (issuer singleton edit route)
  widgets/
    NavShell/NavShell.tsx       (modified — add "Billing" group: Clients, Invoices,
                                  Business Profile)

packages/ui/src/components/
  InvoiceDocument/
    InvoiceDocument.tsx
    InvoiceDocument.stories.tsx
    index.ts
  index.ts                      (modified — add InvoiceDocument export)
```

---

### Task 1: `server/sanity/invoices.ts` — direct writes + numbering

**Files:**
- Create: `apps/admin/src/server/sanity/invoices.ts`
- Test: `apps/admin/src/server/sanity/invoices.test.ts`

**Interfaces:**
- Consumes: `draftSanityClient` from `./client` (the only client with a write token — used here
  for direct, non-draft writes, not for its draft-perspective behavior).
- Produces: `listInvoices(): Promise<Invoice[]>`, `getInvoice(id: string): Promise<Invoice |
  null>`, `nextInvoiceSeq(year: number): Promise<number>` (queries
  `*[_type == "invoice" && issueDate match $year + "*"]` — actually GROQ can't easily match a
  year substring on an ISO date reliably across formats; use
  `*[_type == "invoice"]{ seq, issueDate }` and filter/derive year in JS from
  `issueDate.slice(0, 4)`, returning `Math.max(0, ...matchingSeqs) + 1`), `createInvoice(doc:
  Omit<Invoice, '_id' | '_type' | 'seq'>): Promise<Invoice>` (assigns `_id` via `randomUUID()`,
  computes `seq` via `nextInvoiceSeq`, calls `draftSanityClient.create`), `patchInvoice(id:
  string, patch: Partial<Invoice>): Promise<Invoice>` (plain `.patch(id).set(patch).commit()`,
  no `drafts.` prefix), `deleteInvoice(id: string): Promise<void>`.

- [ ] **Step 1: Write the failing test**

```typescript
// apps/admin/src/server/sanity/invoices.test.ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    fetch: vi.fn(),
    create: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { draftSanityClient } from './client';
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  listInvoices,
  nextInvoiceSeq,
  patchInvoice,
} from './invoices';

const fetchMock = vi.mocked(draftSanityClient.fetch) as unknown as ReturnType<
  typeof vi.fn<(query: string, params?: Record<string, unknown>) => Promise<unknown>>
>;

describe('nextInvoiceSeq', () => {
  it('returns 1 when no invoices exist for the year', async () => {
    fetchMock.mockResolvedValue([]);
    expect(await nextInvoiceSeq(2026)).toBe(1);
  });

  it('returns max seq + 1 for matching-year invoices, ignoring other years', async () => {
    fetchMock.mockResolvedValue([
      { seq: 3, issueDate: '2026-01-01' },
      { seq: 7, issueDate: '2026-06-01' },
      { seq: 99, issueDate: '2025-01-01' },
    ]);
    expect(await nextInvoiceSeq(2026)).toBe(8);
  });
});

describe('createInvoice', () => {
  it('assigns an id and the next seq, then creates the document', async () => {
    fetchMock.mockResolvedValue([{ seq: 2, issueDate: '2026-01-01' }]);
    vi.mocked(draftSanityClient.create).mockImplementation(async (doc) => doc as never);

    const result = await createInvoice({
      issuerSnapshot: { name: 'Me', address: 'A', phone: 'P', email: 'e@x.com' },
      client: { _ref: 'client-1', _type: 'reference' },
      clientSnapshot: { name: 'Acme', email: 'a@x.com', phone: 'P', address: 'A', currency: 'USD' },
      issueDate: '2026-07-12',
      currency: 'USD',
      lineItems: [],
      taxRate: 0,
      status: 'draft',
      totals: { subtotal: 0, vat: 0, total: 0 },
    });

    expect(result.seq).toBe(3);
    expect(draftSanityClient.create).toHaveBeenCalledWith(
      expect.objectContaining({ _type: 'invoice', seq: 3 }),
    );
  });
});

describe('patchInvoice', () => {
  it('patches the plain (non-drafts.) id', async () => {
    const commitMock = vi.fn(async () => ({ _id: 'inv-1', status: 'sent' }));
    const setMock = vi.fn(() => ({ commit: commitMock }));
    vi.mocked(draftSanityClient.patch).mockReturnValue({ set: setMock } as never);

    await patchInvoice('inv-1', { status: 'sent' });

    expect(draftSanityClient.patch).toHaveBeenCalledWith('inv-1');
    expect(setMock).toHaveBeenCalledWith({ status: 'sent' });
  });
});

describe('deleteInvoice', () => {
  it('deletes the plain (non-drafts.) id', async () => {
    await deleteInvoice('inv-1');
    expect(draftSanityClient.delete).toHaveBeenCalledWith('inv-1');
  });
});

describe('listInvoices / getInvoice', () => {
  it('lists all invoices', async () => {
    fetchMock.mockResolvedValue([{ _id: 'inv-1' }]);
    const result = await listInvoices();
    expect(result).toEqual([{ _id: 'inv-1' }]);
  });

  it('gets a single invoice by id or returns null', async () => {
    fetchMock.mockResolvedValueOnce([{ _id: 'inv-1' }]);
    expect(await getInvoice('inv-1')).toEqual({ _id: 'inv-1' });

    fetchMock.mockResolvedValueOnce([]);
    expect(await getInvoice('missing')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/sanity/invoices.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `apps/admin/src/server/sanity/invoices.ts`**

```typescript
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
```

If `draftSanityClient.patch(id).set(...).commit()`'s mocked typing hits the same
overload-resolution friction seen in prior plans (mocking `@sanity/client`'s overloaded
methods), apply the same fix: narrow the mocked reference once near the top of the test file
rather than using `@ts-expect-error`.

- [ ] **Step 4: Run test to verify it passes**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/sanity/invoices.test.ts
```

Expected: PASS (7/7 or however many cases you end up with).

- [ ] **Step 5: Run typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/server/sanity/invoices.ts apps/admin/src/server/sanity/invoices.test.ts
git commit -m "feat(admin): add direct-write invoice sanity layer with per-year numbering"
```

---

### Task 2: `server/sanity/businessProfile.ts` — singleton get/upsert

**Files:**
- Create: `apps/admin/src/server/sanity/businessProfile.ts`
- Test: `apps/admin/src/server/sanity/businessProfile.test.ts`

**Interfaces:**
- Consumes: `draftSanityClient` from `./client`.
- Produces: `getBusinessProfile(): Promise<BusinessProfile | null>` (fetches the fixed
  `_id: 'businessProfile'` document), `upsertBusinessProfile(doc: Omit<BusinessProfile, '_id' |
  '_type'>): Promise<BusinessProfile>` (uses `draftSanityClient.createOrReplace` with the fixed
  id, so it works whether or not the singleton already exists).

- [ ] **Step 1: Write the failing test**

```typescript
// apps/admin/src/server/sanity/businessProfile.test.ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    getDocument: vi.fn(),
    createOrReplace: vi.fn(),
  },
}));

import { draftSanityClient } from './client';
import { getBusinessProfile, upsertBusinessProfile } from './businessProfile';

describe('getBusinessProfile', () => {
  it('returns the singleton document', async () => {
    vi.mocked(draftSanityClient.getDocument).mockResolvedValue({
      _id: 'businessProfile',
      name: 'Me',
    } as never);
    const result = await getBusinessProfile();
    expect(draftSanityClient.getDocument).toHaveBeenCalledWith('businessProfile');
    expect(result).toEqual({ _id: 'businessProfile', name: 'Me' });
  });

  it('returns null when the singleton does not exist yet', async () => {
    vi.mocked(draftSanityClient.getDocument).mockResolvedValue(undefined as never);
    expect(await getBusinessProfile()).toBeNull();
  });
});

describe('upsertBusinessProfile', () => {
  it('createOrReplaces with the fixed id', async () => {
    vi.mocked(draftSanityClient.createOrReplace).mockImplementation(async (doc) => doc as never);
    const result = await upsertBusinessProfile({
      name: 'Me',
      taxId: '123',
      address: 'A',
      phone: 'P',
      email: 'e@x.com',
    });
    expect(draftSanityClient.createOrReplace).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'businessProfile', _type: 'businessProfile', name: 'Me' }),
    );
    expect(result.name).toBe('Me');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/sanity/businessProfile.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `apps/admin/src/server/sanity/businessProfile.ts`**

```typescript
import type { BusinessProfile } from '../../shared/types';
import { draftSanityClient } from './client';

const BUSINESS_PROFILE_ID = 'businessProfile';

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const doc = await draftSanityClient.getDocument(BUSINESS_PROFILE_ID);
  return (doc as unknown as BusinessProfile) ?? null;
}

export async function upsertBusinessProfile(
  doc: Omit<BusinessProfile, '_id' | '_type'>,
): Promise<BusinessProfile> {
  const result = await draftSanityClient.createOrReplace({
    ...doc,
    _id: BUSINESS_PROFILE_ID,
    _type: 'businessProfile',
  });
  return result as unknown as BusinessProfile;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/sanity/businessProfile.test.ts
```

- [ ] **Step 5: Run typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/server/sanity/businessProfile.ts apps/admin/src/server/sanity/businessProfile.test.ts
git commit -m "feat(admin): add business profile singleton get/upsert"
```

---

### Task 3: `server/functions/invoices.ts` + `server/functions/businessProfile.ts`

**Files:**
- Create: `apps/admin/src/server/functions/invoices.ts`
- Create: `apps/admin/src/server/functions/businessProfile.ts`

**Interfaces:**
- Consumes: Task 1's `listInvoices`/`getInvoice`/`createInvoice`/`patchInvoice`/`deleteInvoice`;
  Task 2's `getBusinessProfile`/`upsertBusinessProfile`.
- Produces: `listInvoicesFn`, `getInvoiceFn`, `createInvoiceFn`, `patchInvoiceFn`,
  `deleteInvoiceFn`, `getBusinessProfileFn`, `upsertBusinessProfileFn` — the only surface later
  client code may import from `server/*` for invoice/business-profile data. Check the real
  `createServerFn` call/validator shape already established in `server/functions/content.ts`
  (from the scaffold plan) and mirror it exactly — including the `strict: { output: false }`
  pattern if a given function's return type needs it (check by running typecheck, don't guess
  upfront).

- [ ] **Step 1: Read `apps/admin/src/server/functions/content.ts` for the established pattern**

- [ ] **Step 2: Write `apps/admin/src/server/functions/invoices.ts`**

```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  createInvoice,
  deleteInvoice,
  getInvoice,
  listInvoices,
  patchInvoice,
} from '../sanity/invoices';

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
```

- [ ] **Step 3: Write `apps/admin/src/server/functions/businessProfile.ts`**

```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { getBusinessProfile, upsertBusinessProfile } from '../sanity/businessProfile';

export const getBusinessProfileFn = createServerFn({
  method: 'GET',
  strict: { output: false },
}).handler(async () => getBusinessProfile());

export const upsertBusinessProfileFn = createServerFn({
  method: 'POST',
  strict: { output: false },
})
  .validator(z.record(z.string(), z.unknown()))
  .handler(async ({ data }) => upsertBusinessProfile(data as never));
```

- [ ] **Step 4: Verify typecheck, adjusting `strict`/validator shapes to whatever the installed `createServerFn` actually requires**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/server/functions/invoices.ts apps/admin/src/server/functions/businessProfile.ts
git commit -m "feat(admin): add createServerFn wrappers for invoices and business profile"
```

---

### Task 4: `features/invoices/queries.ts` — TanStack Query hooks

**Files:**
- Create: `apps/admin/src/features/invoices/queries.ts`
- Test: `apps/admin/src/features/invoices/queries.test.ts`

**Interfaces:**
- Consumes: Task 3's server functions.
- Produces: `useInvoiceList()`, `useInvoice(id: string)`, `useCreateInvoice()`,
  `usePatchInvoice()`, `useDeleteInvoice()`, `useBusinessProfile()`,
  `useUpsertBusinessProfile()`. Query keys: `['invoices', 'list']`, `['invoices', 'detail', id]`,
  `['businessProfile']`. This is a SEPARATE module from `features/content/queries.ts` (which is
  draft/publish-aware and generic over `type: string`) — invoices don't fit that model, per the
  Global Constraints.

- [ ] **Step 1: Write the failing test**

Follow the exact TDD pattern from `apps/admin/src/features/content/queries.test.ts` (from a
prior plan) — mock the server functions from Task 3, use `renderHook` +
`QueryClientProvider` wrapper, assert both success state and that the mocked server function was
called with the correct `{ data: ... }` shape for each of the 7 hooks.

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/features/invoices/queries.test.ts
```

Expected: FAIL — module not found (write the test file with 7 `describe` blocks, one per hook,
mirroring `features/content/queries.test.ts`'s structure exactly — read that file first as your
template).

- [ ] **Step 2: Write `apps/admin/src/features/invoices/queries.ts`**

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInvoiceFn,
  deleteInvoiceFn,
  getInvoiceFn,
  listInvoicesFn,
  patchInvoiceFn,
} from '../../server/functions/invoices';
import { getBusinessProfileFn, upsertBusinessProfileFn } from '../../server/functions/businessProfile';
import type { BusinessProfile, Invoice } from '../../shared/types';

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
```

Adjust the exact `{ data: ... }` call shape to whatever Task 3's real `createServerFn`
signatures require — check by running the test, not by assuming this literal code is correct.

- [ ] **Step 3: Run test to verify it passes**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/features/invoices/queries.test.ts
```

- [ ] **Step 4: Run typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/features/invoices
git commit -m "feat(admin): add TanStack Query hooks for invoices and business profile"
```

---

### Task 5: `InvoiceDocument` component (`packages/ui`)

**Files:**
- Create: `packages/ui/src/components/InvoiceDocument/InvoiceDocument.tsx`
- Create: `packages/ui/src/components/InvoiceDocument/InvoiceDocument.stories.tsx`
- Create: `packages/ui/src/components/InvoiceDocument/index.ts`
- Modify: `packages/ui/src/components/index.ts`

**Interfaces:**
- Produces: `InvoiceDocument` component, `InvoiceDocumentProps` type — takes plain, pre-resolved
  data (NOT Sanity types, keeping `packages/ui` generic per its established convention):
  `{ invoiceNumber: string, issueDate: string, issuer: { name, taxId?, address, phone, email },
  billTo: { name, taxId?, address, phone, email }, lineItems: Array<{ quantity, description,
  unitPrice }>, currency: string, taxRate: number, totals: { subtotal, vat, total }, notes?:
  string }`. Restrained/monochrome per the spec, matching the reference layout: title `INVOICE` +
  meta block (Invoice Number, Issue Date), two columns (ISSUER, BILL TO), line-item table (`QTY
  | DESCRIPTION | UNIT PRICE (cur) | VAT | TOTAL (cur)`), totals block (Subtotal, VAT (rate%),
  emphasized Total Due), optional notes. Also carries the `@page` print CSS the spec calls for
  (suppressing the browser's default header/footer via `@page { margin: ... }` and print-specific
  Tailwind classes — check whether Tailwind's `print:` variant is sufficient or whether a `<style>`
  tag with `@page` rules needs to be embedded, since `@page` isn't expressible via Tailwind
  utility classes).

- [ ] **Step 1: Write `packages/ui/src/components/InvoiceDocument/InvoiceDocument.tsx`**

```tsx
export type InvoicePartyInfo = {
  name: string;
  taxId?: string;
  address: string;
  phone: string;
  email: string;
};

export type InvoiceLineItem = {
  quantity: number;
  description: string;
  unitPrice: number;
};

export type InvoiceDocumentProps = {
  invoiceNumber: string;
  issueDate: string;
  issuer: InvoicePartyInfo;
  billTo: InvoicePartyInfo;
  lineItems: InvoiceLineItem[];
  currency: string;
  taxRate: number;
  totals: { subtotal: number; vat: number; total: number };
  notes?: string;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function PartyBlock({ label, party }: { label: string; party: InvoicePartyInfo }) {
  return (
    <div>
      <div className="font-sans text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 font-sans text-sm font-semibold text-[var(--text-strong)]">
        {party.name}
      </div>
      {party.taxId && (
        <div className="font-sans text-xs text-[var(--text-body)]">Tax ID: {party.taxId}</div>
      )}
      <div className="whitespace-pre-line font-sans text-xs text-[var(--text-body)]">
        {party.address}
      </div>
      <div className="font-sans text-xs text-[var(--text-body)]">{party.phone}</div>
      <div className="font-sans text-xs text-[var(--text-body)]">{party.email}</div>
    </div>
  );
}

export function InvoiceDocument({
  invoiceNumber,
  issueDate,
  issuer,
  billTo,
  lineItems,
  currency,
  taxRate,
  totals,
  notes,
}: InvoiceDocumentProps) {
  return (
    <div className="mx-auto max-w-[800px] bg-white p-12 text-[var(--text-body)] print:p-0">
      <style>{`@page { margin: 24mm 18mm; }`}</style>
      <div className="flex items-start justify-between">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-[var(--text-strong)]">
          INVOICE
        </h1>
        <div className="text-right font-sans text-sm text-[var(--text-body)]">
          <div>
            <span className="text-[var(--text-muted)]">Invoice Number </span>
            {invoiceNumber}
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Issue Date </span>
            {issueDate}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <PartyBlock label="Issuer" party={issuer} />
        <PartyBlock label="Bill To" party={billTo} />
      </div>

      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-subtle)]">
            <th className="py-2 text-left font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              Qty
            </th>
            <th className="py-2 text-left font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              Description
            </th>
            <th className="py-2 text-right font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              Unit Price ({currency})
            </th>
            <th className="py-2 text-right font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              VAT
            </th>
            <th className="py-2 text-right font-sans text-xs font-medium uppercase text-[var(--text-muted)]">
              Total ({currency})
            </th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, index) => (
            <tr key={index} className="border-b border-[var(--border-subtle)]">
              <td className="py-2 font-sans text-sm">{item.quantity}</td>
              <td className="py-2 font-sans text-sm">{item.description}</td>
              <td className="py-2 text-right font-sans text-sm">
                {formatMoney(item.unitPrice, currency)}
              </td>
              <td className="py-2 text-right font-sans text-sm">{taxRate}%</td>
              <td className="py-2 text-right font-sans text-sm">
                {formatMoney(item.quantity * item.unitPrice, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-64 font-sans text-sm">
          <div className="flex justify-between py-1">
            <span className="text-[var(--text-muted)]">Subtotal</span>
            <span>{formatMoney(totals.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[var(--text-muted)]">VAT ({taxRate}%)</span>
            <span>{formatMoney(totals.vat, currency)}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border-subtle)] py-2 font-semibold text-[var(--text-strong)]">
            <span>Total Due</span>
            <span>{formatMoney(totals.total, currency)}</span>
          </div>
        </div>
      </div>

      {notes && (
        <div className="mt-8 whitespace-pre-line font-sans text-xs text-[var(--text-muted)]">
          {notes}
        </div>
      )}
    </div>
  );
}
```

Using a plain HTML `key={index}` for line items is acceptable here since this is a read-only
rendering surface (not an editable list — the editable line-item list lives in the invoice edit
route, a later task, which should use a stable key like a generated id or index only if items are
never reordered/removed individually — check that task's actual implementation before assuming
`index` is fine there too).

- [ ] **Step 2: Write `packages/ui/src/components/InvoiceDocument/InvoiceDocument.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InvoiceDocument } from './InvoiceDocument';

const meta: Meta<typeof InvoiceDocument> = {
  title: 'Components/InvoiceDocument',
  component: InvoiceDocument,
  args: {
    invoiceNumber: 'INV-2026-007',
    issueDate: '2026-07-12',
    issuer: {
      name: 'Marco Franceschi',
      taxId: '123456789',
      address: 'Street 1\nCity, Country',
      phone: '+1 555 0100',
      email: 'me@mfranceschit.com',
    },
    billTo: {
      name: 'Acme Inc',
      address: '123 Main St\nCity, Country',
      phone: '+1 555 0200',
      email: 'billing@acme.test',
    },
    lineItems: [
      { quantity: 10, description: 'Consulting hours', unitPrice: 100 },
      { quantity: 1, description: 'Design review', unitPrice: 250 },
    ],
    currency: 'USD',
    taxRate: 21,
    totals: { subtotal: 1250, vat: 262.5, total: 1512.5 },
  },
};

export default meta;
type Story = StoryObj<typeof InvoiceDocument>;

export const Default: Story = {};

export const WithNotes: Story = {
  args: { notes: 'Payment due within 30 days.' },
};
```

- [ ] **Step 3: Write `packages/ui/src/components/InvoiceDocument/index.ts`**

```typescript
export type { InvoiceDocumentProps, InvoiceLineItem, InvoicePartyInfo } from './InvoiceDocument';
export { InvoiceDocument } from './InvoiceDocument';
```

- [ ] **Step 4: Add to `packages/ui/src/components/index.ts`**

Insert alphabetically (after `ImageUploader`, before `Input`):

```typescript
export type { InvoiceDocumentProps, InvoiceLineItem, InvoicePartyInfo } from './InvoiceDocument/InvoiceDocument';
export { InvoiceDocument } from './InvoiceDocument/InvoiceDocument';
```

- [ ] **Step 5: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/ui typecheck
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/InvoiceDocument packages/ui/src/components/index.ts
git commit -m "feat(ui): add InvoiceDocument component"
```

---

### Task 6: Business Profile settings route

**Files:**
- Create: `apps/admin/src/routes/settings/business-profile.tsx`

**Interfaces:**
- Consumes: `useBusinessProfile`, `useUpsertBusinessProfile` from `../../features/invoices/queries`;
  `Input`, `FormField`, `Button` from `@mfranceschit/ui`.
- Produces: a simple singleton edit form (no list, no draft/publish, no `DocumentToolbar` — just
  load-and-save) for `businessProfile` (`name`, `taxId`, `address`, `phone`, `email`).

- [ ] **Step 1: Write `apps/admin/src/routes/settings/business-profile.tsx`**

```tsx
import { Button, FormField, Input } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useBusinessProfile, useUpsertBusinessProfile } from '../../features/invoices/queries';
import type { BusinessProfile } from '../../shared/types';

export const Route = createFileRoute('/settings/business-profile')({
  component: BusinessProfilePage,
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  taxId: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string().email('Must be a valid email'),
});

type BusinessProfileFormValues = z.infer<typeof formSchema>;

function toFormValues(profile?: BusinessProfile | null): BusinessProfileFormValues {
  return {
    name: profile?.name ?? '',
    taxId: profile?.taxId ?? '',
    address: profile?.address ?? '',
    phone: profile?.phone ?? '',
    email: profile?.email ?? '',
  };
}

function BusinessProfilePage() {
  const { data: profile } = useBusinessProfile();
  const upsert = useUpsertBusinessProfile();
  const { toaster } = Route.useRouteContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessProfileFormValues>({
    values: toFormValues(profile),
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: BusinessProfileFormValues) {
    await upsert.mutateAsync(values);
    toaster.create({ title: 'Business profile saved', type: 'success' });
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
        Business Profile
      </h1>
      <p className="font-sans text-sm text-[var(--text-muted)]">
        Reused as the issuer on every new invoice.
      </p>

      <FormField label="Name" required error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>
      <FormField label="Tax ID" error={errors.taxId?.message}>
        <Input {...register('taxId')} />
      </FormField>
      <FormField label="Address" error={errors.address?.message}>
        <Input as="textarea" {...register('address')} />
      </FormField>
      <FormField label="Phone" error={errors.phone?.message}>
        <Input {...register('phone')} />
      </FormField>
      <FormField label="Email" required error={errors.email?.message}>
        <Input {...register('email')} />
      </FormField>

      <Button type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register `/settings/business-profile`.

- [ ] **Step 3: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/routes/settings
git commit -m "feat(admin): add business profile settings route"
```

---

### Task 7: Invoices — list route + `NavShell` Billing group

**Files:**
- Create: `apps/admin/src/routes/invoices/index.tsx`
- Modify: `apps/admin/src/widgets/NavShell/NavShell.tsx`

**Interfaces:**
- Consumes: `useInvoiceList` from `../../features/invoices/queries`; `Table`, `Badge`, `Button`
  from `@mfranceschit/ui`.
- Produces: a route listing invoices (number, client name from `clientSnapshot.name`, total,
  status), row-click to `/invoices/$id`, "New invoice" button. `NavShell` gains a "Billing" group
  (Clients, Invoices, Business Profile) — the deferred nav addition from the Clients plan.

- [ ] **Step 1: Write `apps/admin/src/routes/invoices/index.tsx`**

```tsx
import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useInvoiceList } from '../../features/invoices/queries';
import type { Invoice, InvoiceStatus } from '../../shared/types';
import { formatMoney } from '../../shared/lib/format';

export const Route = createFileRoute('/invoices/')({
  component: InvoicesListPage,
});

const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'blue',
  paid: 'blue',
};

function InvoiceNumber(invoice: Invoice): string {
  const year = invoice.issueDate.slice(0, 4);
  return `INV-${year}-${String(invoice.seq).padStart(3, '0')}`;
}

function InvoicesListPage() {
  const { data, isLoading } = useInvoiceList();
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">Invoices</h1>
        <Button size="sm" onClick={() => navigate({ to: '/invoices/$id', params: { id: 'new' } })}>
          New invoice
        </Button>
      </div>
      <Table<Invoice>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: '/invoices/$id', params: { id: row._id } })}
        columns={[
          { header: 'Number', render: InvoiceNumber },
          { header: 'Client', render: (row) => row.clientSnapshot.name },
          {
            header: 'Total',
            align: 'right',
            render: (row) => formatMoney(row.totals.total, row.currency),
          },
          {
            header: 'Status',
            align: 'right',
            render: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
          },
        ]}
      />
    </div>
  );
}
```

Check `InvoiceStatus`'s exact values (`'draft' | 'sent' | 'paid'`) and `formatMoney`'s real
signature from `apps/admin/src/shared/lib/format.ts` (already built in the scaffold plan) before
assuming the call shape above is correct.

- [ ] **Step 2: Modify `apps/admin/src/widgets/NavShell/NavShell.tsx` — add a Billing group**

Read the file first. Add a third `NavGroup` entry to `NAV_GROUPS`:

```typescript
{
  label: 'Billing',
  links: [
    { to: '/clients', label: 'Clients' },
    { to: '/invoices', label: 'Invoices' },
    { to: '/settings/business-profile', label: 'Business Profile' },
  ],
},
```

- [ ] **Step 3: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register `/invoices/`.

- [ ] **Step 4: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/routes/invoices/index.tsx apps/admin/src/widgets/NavShell/NavShell.tsx
git commit -m "feat(admin): add invoices list route and Billing nav group"
```

---

### Task 8: Invoices — edit route

**Files:**
- Create: `apps/admin/src/routes/invoices/$id.tsx`

**Interfaces:**
- Consumes: `useInvoice`, `useCreateInvoice`, `usePatchInvoice` from
  `../../features/invoices/queries`; `useDocumentList` from `../../features/content/queries`
  (to power the client picker — reusing the EXISTING generic content-query hook with `type:
  'client'`, since clients ARE draft/publish-based even though invoices aren't); `Input`,
  `FormField`, `NumberInput`, `DatePicker`, `Select`, `Combobox`, `Button`, `Badge` from
  `@mfranceschit/ui`; `calculateInvoiceTotals` from `../../shared/lib/invoiceTotals`;
  `businessProfile` via `useBusinessProfile` from `../../features/invoices/queries` (for the
  issuer snapshot).
- Produces: `/invoices/$id` (`'new'` = create mode). Line items are a local `useFieldArray`
  (react-hook-form) list, NOT a `LocaleField`/`Tabs` pattern — this is the first use of dynamic
  add/remove rows in this codebase. Client picker via `Combobox` (single-select over the client
  list, matching by `_ref`). Status badge + "Mark as sent"/"Mark as paid" buttons (NOT
  `DocumentToolbar` — invoices don't use publish/discard). **Form locks entirely (all fields
  `disabled`, no save button) once `status !== 'draft'`** per the Global Constraints.

- [ ] **Step 1: Write `apps/admin/src/routes/invoices/$id.tsx`**

```tsx
import {
  Badge,
  Button,
  Combobox,
  DatePicker,
  FormField,
  Input,
  NumberInput,
  Select,
} from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useDocumentList } from '../../features/content/queries';
import {
  useBusinessProfile,
  useCreateInvoice,
  useInvoice,
  usePatchInvoice,
} from '../../features/invoices/queries';
import { calculateInvoiceTotals } from '../../shared/lib/invoiceTotals';
import type { Client, DocumentStatus, Invoice } from '../../shared/types';

export const Route = createFileRoute('/invoices/$id')({
  component: InvoiceEditPage,
});

const lineItemSchema = z.object({
  quantity: z.string().min(1),
  description: z.string().min(1),
  unitPrice: z.string().min(1),
});

const formSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string(),
  currency: z.string().min(1),
  taxRate: z.string(),
  lineItems: z.array(lineItemSchema),
  notes: z.string(),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

function toFormValues(invoice?: Invoice | null): InvoiceFormValues {
  return {
    clientId: invoice?.client._ref ?? '',
    issueDate: invoice?.issueDate ?? new Date().toISOString().slice(0, 10),
    dueDate: invoice?.dueDate ?? '',
    currency: invoice?.currency ?? 'USD',
    taxRate: invoice?.taxRate !== undefined ? String(invoice.taxRate) : '0',
    lineItems: invoice?.lineItems.map((item) => ({
      quantity: String(item.quantity),
      description: item.description,
      unitPrice: String(item.unitPrice),
    })) ?? [{ quantity: '1', description: '', unitPrice: '0' }],
    notes: invoice?.notes ?? '',
  };
}

function InvoiceEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: invoice } = useInvoice(isNew ? '' : id);
  const { data: clients } = useDocumentList<Client & { _status: DocumentStatus }>('client');
  const { data: businessProfile } = useBusinessProfile();
  const createInvoice = useCreateInvoice();
  const patchInvoice = usePatchInvoice();

  const locked = !isNew && invoice?.status !== 'draft' && invoice !== undefined;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    values: toFormValues(invoice),
    resolver: zodResolver(formSchema),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });

  const watchedLineItems = useWatch({ control, name: 'lineItems' });
  const watchedTaxRate = useWatch({ control, name: 'taxRate' });
  const liveTotals = calculateInvoiceTotals(
    watchedLineItems.map((item) => ({
      quantity: Number(item.quantity) || 0,
      description: item.description,
      unitPrice: Number(item.unitPrice) || 0,
    })),
    Number(watchedTaxRate) || 0,
  );

  async function onSubmit(values: InvoiceFormValues) {
    const client = clients?.find((c) => c._id === values.clientId);
    if (!client || !businessProfile) return;

    const lineItems = values.lineItems.map((item) => ({
      quantity: Number(item.quantity),
      description: item.description,
      unitPrice: Number(item.unitPrice),
    }));
    const taxRate = Number(values.taxRate);
    const totals = calculateInvoiceTotals(lineItems, taxRate);

    const doc = {
      issuerSnapshot: {
        name: businessProfile.name,
        taxId: businessProfile.taxId,
        address: businessProfile.address,
        phone: businessProfile.phone,
        email: businessProfile.email,
      },
      client: { _ref: client._id, _type: 'reference' as const },
      clientSnapshot: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        currency: client.currency,
      },
      issueDate: values.issueDate,
      dueDate: values.dueDate || undefined,
      currency: values.currency,
      lineItems,
      taxRate,
      notes: values.notes || undefined,
      status: 'draft' as const,
      totals,
    };

    if (isNew) {
      const created = await createInvoice.mutateAsync(doc);
      navigate({ to: '/invoices/$id', params: { id: created._id } });
    } else {
      await patchInvoice.mutateAsync({ id, patch: doc });
    }
  }

  async function markAs(status: 'sent' | 'paid') {
    if (isNew) return;
    await patchInvoice.mutateAsync({ id, patch: { status } });
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          {isNew ? 'New invoice' : `Invoice ${invoice?.seq}`}
        </h1>
        {!isNew && invoice && (
          <div className="flex items-center gap-3">
            <Badge tone={invoice.status === 'draft' ? 'neutral' : 'blue'}>{invoice.status}</Badge>
            {invoice.status === 'draft' && (
              <Button size="sm" onClick={() => markAs('sent')}>
                Mark as sent
              </Button>
            )}
            {invoice.status === 'sent' && (
              <Button size="sm" onClick={() => markAs('paid')}>
                Mark as paid
              </Button>
            )}
          </div>
        )}
      </div>

      <FormField label="Client" required error={errors.clientId?.message}>
        <Controller
          control={control}
          name="clientId"
          render={({ field }) => (
            <Combobox
              items={clients ?? []}
              itemToString={(item: Client) => item.name}
              itemToValue={(item: Client) => item._id}
              value={field.value ? [field.value] : []}
              onValueChange={(value) => field.onChange(value[0] ?? '')}
              disabled={locked}
            />
          )}
        />
      </FormField>

      <FormField label="Issue Date" required error={errors.issueDate?.message}>
        <Controller
          control={control}
          name="issueDate"
          render={({ field }) => (
            <DatePicker value={field.value} onValueChange={field.onChange} disabled={locked} />
          )}
        />
      </FormField>

      <FormField label="Due Date" error={errors.dueDate?.message}>
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DatePicker value={field.value} onValueChange={field.onChange} disabled={locked} />
          )}
        />
      </FormField>

      <FormField label="Currency" required error={errors.currency?.message}>
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <Select
              items={['USD', 'EUR', 'GBP']}
              itemToString={(item: string) => item}
              itemToValue={(item: string) => item}
              value={[field.value]}
              onValueChange={(value) => field.onChange(value[0] ?? '')}
              disabled={locked}
            />
          )}
        />
      </FormField>

      <FormField label="Tax Rate (%)" error={errors.taxRate?.message}>
        <Controller
          control={control}
          name="taxRate"
          render={({ field }) => (
            <NumberInput
              value={field.value}
              onValueChange={(value) => field.onChange(Number.isNaN(value) ? '' : String(value))}
              min={0}
              disabled={locked}
            />
          )}
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <span className="font-sans text-sm font-medium text-[var(--text-body)]">Line items</span>
        {fields.map((item, index) => (
          <div key={item.id} className="flex gap-2">
            <div className="w-20">
              <NumberInput
                value={String(watchedLineItems[index]?.quantity ?? '')}
                onValueChange={(value) => {
                  if (!Number.isNaN(value)) {
                    /* wired via register below, kept for live-total display only */
                  }
                }}
                min={0}
                disabled
              />
            </div>
            <Input
              {...register(`lineItems.${index}.quantity`)}
              className="w-20"
              disabled={locked}
            />
            <Input
              {...register(`lineItems.${index}.description`)}
              className="flex-1"
              placeholder="Description"
              disabled={locked}
            />
            <Input
              {...register(`lineItems.${index}.unitPrice`)}
              className="w-28"
              disabled={locked}
            />
            {!locked && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        {!locked && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => append({ quantity: '1', description: '', unitPrice: '0' })}
          >
            Add line item
          </Button>
        )}
      </div>

      <FormField label="Notes" error={errors.notes?.message}>
        <Input as="textarea" {...register('notes')} disabled={locked} />
      </FormField>

      <div className="self-end text-right font-sans text-sm">
        <div>Subtotal: {liveTotals.subtotal}</div>
        <div>VAT: {liveTotals.vat}</div>
        <div className="font-semibold">Total: {liveTotals.total}</div>
      </div>

      {!locked && (
        <Button type="submit" className="self-start">
          Save draft
        </Button>
      )}
    </form>
  );
}
```

**This step's example code has real problems the implementer must fix, not copy verbatim:**

1. The redundant disabled `NumberInput` inside the line-item row (duplicating a quantity field
   that's separately `register`ed as a plain `Input`) is nonsensical dead code — delete it. Use
   plain `Input` fields (`register`ed, matching `quantity`/`unitPrice` as numeric-looking text
   inputs) for the line-item row, OR properly wire `NumberInput` via `Controller` per-field (not
   both at once). Pick ONE approach per field and make it functional — the example above
   contains a leftover half-finished idea, not a design decision.
2. `useWatch` is used but never imported — add it to the `react-hook-form` import.
3. Decide and implement the `disabled` handling for `Combobox`/`Select`/`DatePicker`/`NumberInput`
   consistently — check each component's actual prop name for disabling (some may use `disabled`,
   confirm against each component's real `Props` type in `packages/ui`, don't assume uniformity).
4. `remove(index)`/`append(...)` from `useFieldArray` need `type="button"` on their triggering
   `Button`s to avoid accidentally submitting the form (already shown above, keep it) — verify
   `Button`'s `type` prop actually accepts `'button'` per its real signature.
5. The live totals display uses raw numbers with no currency formatting — use `formatMoney` from
   `../../shared/lib/format` (already built) instead of printing bare numbers.
6. Once you fix the above, re-verify the whole file makes structural sense end-to-end: does
   `locked` correctly disable every interactive field, does line-item add/remove work with
   react-hook-form's `useFieldArray`, does the create → edit navigation flow match the established
   pattern from Projects/Certifications/Degrees/Clients?

- [ ] **Step 2: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register `/invoices/$id`.

- [ ] **Step 3: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: 0 errors — this will very likely surface real issues from the deliberately-broken
example code above; work through them methodically rather than suppressing errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/routes/invoices/\$id.tsx
git commit -m "feat(admin): add invoice edit route with line items and status transitions"
```

---

### Task 9: Invoices — print route

**Files:**
- Create: `apps/admin/src/routes/invoices/$id.print.tsx`

**Interfaces:**
- Consumes: `useInvoice` from `../../features/invoices/queries`; `InvoiceDocument`, `Button`
  from `@mfranceschit/ui`.
- Produces: a route at `/invoices/$id/print` rendering ONLY `InvoiceDocument` (no `NavShell`
  chrome — this route needs its own minimal layout so the print output isn't wrapped in the app
  sidebar) with a "Print" button calling `window.print()`. Maps the loaded `Invoice` document to
  `InvoiceDocumentProps` (plain, pre-resolved shape).

- [ ] **Step 1: Write `apps/admin/src/routes/invoices/$id.print.tsx`**

```tsx
import { Button, InvoiceDocument } from '@mfranceschit/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useInvoice } from '../../features/invoices/queries';

export const Route = createFileRoute('/invoices/$id/print')({
  component: InvoicePrintPage,
});

function InvoicePrintPage() {
  const { id } = Route.useParams();
  const { data: invoice, isLoading } = useInvoice(id);

  if (isLoading || !invoice) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  const invoiceNumber = `INV-${invoice.issueDate.slice(0, 4)}-${String(invoice.seq).padStart(3, '0')}`;

  return (
    <div>
      <div className="p-6 print:hidden">
        <Button onClick={() => window.print()}>Print</Button>
      </div>
      <InvoiceDocument
        invoiceNumber={invoiceNumber}
        issueDate={invoice.issueDate}
        issuer={invoice.issuerSnapshot}
        billTo={{
          name: invoice.clientSnapshot.name,
          address: invoice.clientSnapshot.address,
          phone: invoice.clientSnapshot.phone,
          email: invoice.clientSnapshot.email,
        }}
        lineItems={invoice.lineItems}
        currency={invoice.currency}
        taxRate={invoice.taxRate}
        totals={invoice.totals}
        notes={invoice.notes}
      />
    </div>
  );
}
```

Note this route is nested under the same `NavShell`-wrapping root layout as every other route in
this app (per `apps/admin/src/routes/__root.tsx` from the scaffold plan, which wraps `<Outlet
/>` in `<NavShell>`) — the brief's stated goal of "no `NavShell` chrome" for this route is NOT
achievable without either a route-tree layout exception (a route group that opts out of the root
layout, which TanStack Router supports via pathless layout routes) or accepting that the sidebar
prints too (undesirable) unless suppressed via `print:hidden` on `NavShell`'s own markup.
**Resolve this properly:** the simplest correct fix within this task's scope is to add
`className="print:hidden"` to `NavShell`'s root `<aside>` element (so the sidebar itself doesn't
print, regardless of which route is active) — modify `apps/admin/src/widgets/NavShell/NavShell.tsx`
as part of this task to add that one class. Do not attempt a pathless-layout-route restructuring
for this — that's disproportionate scope for what a single Tailwind `print:` utility solves.

- [ ] **Step 2: Modify `apps/admin/src/widgets/NavShell/NavShell.tsx` to hide the sidebar when printing**

Add `print:hidden` to the `<aside>` element's `className`.

- [ ] **Step 3: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register `/invoices/$id/print`.

- [ ] **Step 4: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/routes/invoices/\$id.print.tsx apps/admin/src/widgets/NavShell/NavShell.tsx
git commit -m "feat(admin): add invoice print route"
```

---

## Self-Review Notes

- **Spec coverage:** All of Phase 7 is covered — `businessProfile` singleton (Tasks 2, 6),
  `invoice` CRUD with numbering/totals/snapshots (Tasks 1, 3, 4, 8), draft/publish exemption
  honored via status-gated locking rather than reusing the draft/publish infra, `InvoiceDocument`
  (Task 5) matching the reference layout, print route (Task 9). The deferred "Billing" nav group
  from the Clients plan is added here (Task 7), completing that loop.
- **Placeholder scan:** Task 8's Step 1 explicitly flags its own example code's problems (dead
  redundant `NumberInput`, missing `useWatch` import, inconsistent disabled-handling, raw number
  formatting) and requires the implementer to resolve them — this is intentional, mirroring the
  same "deliberately imperfect first draft, corrected in the same task" pattern used successfully
  in the Certifications/Degrees plan for `LocaleField` wiring. Task 9's "no NavShell chrome" note
  is resolved with a concrete, scoped fix (`print:hidden` on the sidebar), not left open.
- **Type consistency:** `Invoice`/`BusinessProfile`/`Client`/`InvoiceStatus` (from the scaffold
  plan's `shared/types.ts`) are used consistently. `calculateInvoiceTotals` (scaffold plan) is
  reused, not reimplemented, in both the live-preview totals (Task 8) and — implicitly, since the
  server layer trusts the client-submitted `totals` object rather than recomputing server-side in
  this v1 — the persisted snapshot. This trust boundary (client computes, server stores as-is) is
  consistent with the spec's "fine for a single local user" framing for the whole invoices
  feature, but is worth flagging explicitly: **a malicious or buggy client could submit
  mismatched totals**. Acceptable for this v1 (single trusted local user, no public access per
  the scaffold plan's non-goals), but a future hardening pass should recompute totals
  server-side in `createInvoice`/`patchInvoice` rather than trusting the payload.

## Next Steps (beyond this plan — the spec's own "Future" section)

- Deploy to Cloudflare Workers + Access, atomic invoice numbering, server-rendered/emailed PDFs,
  revision-history UI — all explicitly out of scope per the spec's "Future (out of scope here)"
  section.
- Retire the old standalone Sanity Studio once parity is confirmed against this admin app.
