# Invoice PDF Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When an invoice leaves `draft` (marked sent or paid), render a branded PDF server-side, store it as a Sanity file asset on the invoice, and expose a download link in the editor.

**Architecture:** A new `InvoiceDocumentPdf` component in `packages/ui` (built with `@react-pdf/renderer`, sharing `InvoiceDocumentProps`) renders the invoice. A server-only `renderInvoicePdf` helper maps a loaded `Invoice` onto it and produces a `Buffer`. A new `markInvoiceStatus` server path renders + uploads the PDF, then patches `{ status, pdf }` — atomically, so a render/upload failure leaves the invoice in `draft`. The editor resolves the stored file's public CDN URL for a download link.

**Tech Stack:** React 19, `@react-pdf/renderer@4.5.1`, TanStack Start server functions, TanStack Query, Sanity `@sanity/client`, zod, Vitest.

## Global Constraints

- Node >=24, pnpm (`packageManager: pnpm@11.8.0`). Run node/pnpm via `fnm exec -- <cmd>`.
- Biome style: single quotes, trailing commas `all`, 2-space indent, line width 100. `import type` for type-only imports. External imports first, blank line, then `@/` imports.
- No emojis in code/comments. Comments only when the WHY is non-obvious. Max 300 lines/file, one component/file.
- **HARD rule:** all colors come from `packages/ui` tokens — no raw hex/rgba in components. `InvoiceDocumentPdf` sources colors from `packages/ui/src/tokens/colors.ts` (the JS token surface for consumers that can't read CSS vars).
- `apps/admin` alias `@/` → `apps/admin/src`; never `../` for cross-directory imports (except within the same directory). The browser never talks to Sanity — only `server/functions/*` do.
- Font: use react-pdf built-in `Helvetica` / `Helvetica-Bold` (no font files bundled). This is a deliberate relaxation of the spec's "Inter" — swappable later by registering an Inter `.ttf`.
- Dependency version: `@react-pdf/renderer@4.5.1` (verified via `pnpm info`; peer supports React 19). Do not pin any other version from memory — verify with `pnpm info` if a new dep arises.
- Git: never commit to `main`; work on `feat/pdf-generation`. Commit format `type(scope): description`. No `Co-Authored-By` / "Generated with Claude Code" lines.

---

### Task 1: PDF document component + server render helper

**Files:**
- Modify: `packages/ui/package.json` (add `@react-pdf/renderer` dependency)
- Modify: `apps/admin/package.json` (add `@react-pdf/renderer` dependency)
- Create: `packages/ui/src/components/InvoiceDocumentPdf/InvoiceDocumentPdf.tsx`
- Create: `packages/ui/src/components/InvoiceDocumentPdf/index.ts`
- Modify: `packages/ui/src/components/index.ts` (export the new component + props)
- Create: `apps/admin/src/server/pdf/renderInvoicePdf.tsx`
- Test: `apps/admin/src/server/pdf/renderInvoicePdf.test.tsx`

**Interfaces:**
- Consumes: `InvoiceDocumentProps` from `packages/ui/src/components/InvoiceDocument/InvoiceDocument.tsx`; `colors` from `packages/ui/src/tokens/colors.ts`; `formatInvoiceNumber` from `apps/admin/src/shared/lib/format.ts`; `Invoice` type from `apps/admin/src/shared/types.ts`.
- Produces:
  - `InvoiceDocumentPdf(props: InvoiceDocumentProps): JSX.Element` (a `@react-pdf/renderer` `<Document>`), exported from `@mfranceschit/ui`.
  - `renderInvoicePdf(invoice: Invoice): Promise<Buffer>` in `apps/admin/src/server/pdf/renderInvoicePdf.tsx`.

- [ ] **Step 1: Add the dependency to both packages**

Run (from repo root):
```bash
cd /Users/marco/Projects/mfranceschit/developer
fnm exec -- pnpm --filter @mfranceschit/ui add @react-pdf/renderer@4.5.1
fnm exec -- pnpm --filter @mfranceschit/admin add @react-pdf/renderer@4.5.1
```
Expected: both `package.json` files gain `"@react-pdf/renderer": "^4.5.1"` under `dependencies`; lockfile updates.

- [ ] **Step 2: Write the failing render-helper test**

Create `apps/admin/src/server/pdf/renderInvoicePdf.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest';
import type { Invoice } from '@/shared/types';
import { renderInvoicePdf } from './renderInvoicePdf';

const invoice: Invoice = {
  _id: 'inv-1',
  _type: 'invoice',
  seq: 7,
  issuerSnapshot: { name: 'Me', taxId: 'X1', address: 'Street 1', phone: '+1', email: 'me@x.com' },
  client: { _ref: 'client-1', _type: 'reference' },
  clientSnapshot: { name: 'Acme', email: 'a@x.com', phone: '+2', address: 'Ave 2', currency: 'USD' },
  issueDate: '2026-06-30',
  currency: 'USD',
  lineItems: [{ quantity: 1, description: 'Software Development', unitPrice: 5750 }],
  taxRate: 0,
  status: 'draft',
  totals: { subtotal: 5750, vat: 0, total: 5750 },
};

describe('renderInvoicePdf', () => {
  it('renders an invoice to a PDF buffer', async () => {
    const buffer = await renderInvoicePdf(invoice);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/pdf/renderInvoicePdf.test.tsx`
Expected: FAIL — cannot resolve `./renderInvoicePdf` (module not created yet).

- [ ] **Step 4: Create the PDF component**

Create `packages/ui/src/components/InvoiceDocumentPdf/InvoiceDocumentPdf.tsx`:
```tsx
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { colors } from '../../tokens/colors';
import type { InvoiceDocumentProps, InvoicePartyInfo } from '../InvoiceDocument/InvoiceDocument';

const palette = {
  strong: colors.blue[700],
  body: colors.gray[800],
  muted: colors.gray[500],
  border: colors.gray[200],
  white: colors.white,
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: palette.white,
    color: palette.body,
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingVertical: 48,
    paddingHorizontal: 48,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 24, color: palette.strong, letterSpacing: -0.5 },
  headerMeta: { textAlign: 'right', fontSize: 11, color: palette.body },
  headerMutedLabel: { color: palette.muted },
  parties: { flexDirection: 'row', marginTop: 32 },
  party: { width: '50%', paddingRight: 24 },
  partyLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: palette.muted,
  },
  partyName: { marginTop: 4, fontSize: 11, fontFamily: 'Helvetica-Bold', color: palette.strong },
  partyLine: { fontSize: 9, color: palette.body, marginTop: 1 },
  table: { marginTop: 32 },
  thead: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingBottom: 6,
  },
  th: { fontSize: 9, textTransform: 'uppercase', color: palette.muted },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: 6,
  },
  td: { fontSize: 10 },
  colQty: { width: '8%' },
  colDesc: { width: '46%' },
  colUnit: { width: '18%', textAlign: 'right' },
  colVat: { width: '10%', textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },
  totals: { marginTop: 24, flexDirection: 'row', justifyContent: 'flex-end' },
  totalsBox: { width: 220 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalsLabel: { color: palette.muted },
  totalsDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 6,
    marginTop: 3,
  },
  totalsDueText: { fontFamily: 'Helvetica-Bold', color: palette.strong },
  notes: { marginTop: 32, fontSize: 9, color: palette.muted },
});

function Party({ label, party }: { label: string; party: InvoicePartyInfo }) {
  return (
    <View style={styles.party}>
      <Text style={styles.partyLabel}>{label}</Text>
      <Text style={styles.partyName}>{party.name}</Text>
      {party.taxId ? <Text style={styles.partyLine}>Tax ID: {party.taxId}</Text> : null}
      <Text style={styles.partyLine}>{party.address}</Text>
      <Text style={styles.partyLine}>Phone: {party.phone}</Text>
      <Text style={styles.partyLine}>Email: {party.email}</Text>
    </View>
  );
}

export function InvoiceDocumentPdf({
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
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.headerMeta}>
            <Text>
              <Text style={styles.headerMutedLabel}>Invoice Number </Text>
              {invoiceNumber}
            </Text>
            <Text>
              <Text style={styles.headerMutedLabel}>Issue Date </Text>
              {issueDate}
            </Text>
          </View>
        </View>

        <View style={styles.parties}>
          <Party label="Issuer" party={issuer} />
          <Party label="Bill To" party={billTo} />
        </View>

        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colUnit]}>Unit Price ({currency})</Text>
            <Text style={[styles.th, styles.colVat]}>VAT</Text>
            <Text style={[styles.th, styles.colTotal]}>Total ({currency})</Text>
          </View>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.td, styles.colUnit]}>
                {formatMoney(item.unitPrice, currency)}
              </Text>
              <Text style={[styles.td, styles.colVat]}>{taxRate}%</Text>
              <Text style={[styles.td, styles.colTotal]}>
                {formatMoney(item.quantity * item.unitPrice, currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text>{formatMoney(totals.subtotal, currency)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>VAT ({taxRate}%)</Text>
              <Text>{formatMoney(totals.vat, currency)}</Text>
            </View>
            <View style={styles.totalsDueRow}>
              <Text style={styles.totalsDueText}>Total Due</Text>
              <Text style={styles.totalsDueText}>{formatMoney(totals.total, currency)}</Text>
            </View>
          </View>
        </View>

        {notes ? <Text style={styles.notes}>{notes}</Text> : null}
      </Page>
    </Document>
  );
}
```

Create `packages/ui/src/components/InvoiceDocumentPdf/index.ts`:
```ts
export { InvoiceDocumentPdf } from './InvoiceDocumentPdf';
```

- [ ] **Step 5: Export the component from the ui barrel**

In `packages/ui/src/components/index.ts`, directly after the existing `InvoiceDocument` export block (the lines exporting `InvoiceDocumentProps` / `InvoiceDocument` from `./InvoiceDocument/InvoiceDocument`), add:
```ts
export { InvoiceDocumentPdf } from './InvoiceDocumentPdf/InvoiceDocumentPdf';
```
(No new prop types to export — `InvoiceDocumentPdf` reuses `InvoiceDocumentProps`, already exported.)

- [ ] **Step 6: Create the render helper**

Create `apps/admin/src/server/pdf/renderInvoicePdf.tsx`:
```tsx
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocumentPdf } from '@mfranceschit/ui';

import { formatInvoiceNumber } from '@/shared/lib/format';
import type { Invoice } from '@/shared/types';

export async function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return renderToBuffer(
    <InvoiceDocumentPdf
      invoiceNumber={formatInvoiceNumber(invoice)}
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
    />,
  );
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/pdf/renderInvoicePdf.test.tsx`
Expected: PASS (buffer begins with `%PDF-`).

- [ ] **Step 8: Typecheck both packages**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/ui typecheck && fnm exec -- pnpm --filter @mfranceschit/admin typecheck`
Expected: no type errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/marco/Projects/mfranceschit/developer
git add packages/ui apps/admin/src/server/pdf apps/admin/package.json pnpm-lock.yaml
git commit -m "feat(ui): add InvoiceDocumentPdf and server render helper"
```

---

### Task 2: Sanity file asset upload helper

**Files:**
- Modify: `apps/admin/src/server/sanity/upload.ts`
- Test: `apps/admin/src/server/sanity/upload.test.ts`

**Interfaces:**
- Consumes: `draftSanityClient` from `./client`.
- Produces: `uploadFileAsset(file: Buffer, filename: string): Promise<{ _ref: string; _type: 'reference' }>`.

- [ ] **Step 1: Write the failing test**

Add to `apps/admin/src/server/sanity/upload.test.ts` (import `uploadFileAsset` alongside the existing `uploadImageAsset` import) a new describe block:
```ts
describe('uploadFileAsset', () => {
  it('uploads a file buffer and returns an asset reference', async () => {
    vi.mocked(draftSanityClient.assets.upload).mockResolvedValueOnce({ _id: 'file-abc-pdf' } as never);
    const buffer = Buffer.from('%PDF-fake');
    const result = await uploadFileAsset(buffer, 'INV-2026-007.pdf');
    expect(draftSanityClient.assets.upload).toHaveBeenCalledWith('file', buffer, {
      filename: 'INV-2026-007.pdf',
    });
    expect(result).toEqual({ _ref: 'file-abc-pdf', _type: 'reference' });
  });
});
```
Update the top import line to `import { uploadFileAsset, uploadImageAsset } from './upload';`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/sanity/upload.test.ts`
Expected: FAIL — `uploadFileAsset` is not exported.

- [ ] **Step 3: Implement the helper**

Append to `apps/admin/src/server/sanity/upload.ts`:
```ts
export async function uploadFileAsset(
  file: Buffer,
  filename: string,
): Promise<{ _ref: string; _type: 'reference' }> {
  const asset = await draftSanityClient.assets.upload('file', file, { filename });
  return { _ref: asset._id, _type: 'reference' };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/sanity/upload.test.ts`
Expected: PASS (both `uploadImageAsset` and `uploadFileAsset` cases green).

- [ ] **Step 5: Commit**

```bash
cd /Users/marco/Projects/mfranceschit/developer
git add apps/admin/src/server/sanity/upload.ts apps/admin/src/server/sanity/upload.test.ts
git commit -m "feat(admin): add uploadFileAsset for Sanity file assets"
```

---

### Task 3: Schema `pdf` field + `markInvoiceStatus`

**Files:**
- Modify: `apps/admin/src/shared/schemas.ts` (add `pdf` to `invoiceSchema`)
- Modify: `apps/admin/src/server/sanity/invoices.ts` (add `markInvoiceStatus`)
- Test: `apps/admin/src/server/sanity/invoices.test.ts`

**Interfaces:**
- Consumes: `getInvoice`, `patchInvoice` (same module); `renderInvoicePdf` from `../pdf/renderInvoicePdf`; `uploadFileAsset` from `./upload`; `formatInvoiceNumber` from `@/shared/lib/format`; `Invoice` from `@/shared/types`.
- Produces: `markInvoiceStatus(id: string, status: 'sent' | 'paid'): Promise<Invoice>`. The `Invoice` type gains an optional `pdf?: { _type: 'file'; asset: { _ref: string; _type: 'reference' } }`.

- [ ] **Step 1: Add the `pdf` field to `invoiceSchema`**

In `apps/admin/src/shared/schemas.ts`, inside `invoiceSchema = z.object({ ... })`, add immediately after the `totals: invoiceTotalsSchema,` line:
```ts
  pdf: z
    .object({
      _type: z.literal('file'),
      asset: z.object({ _ref: z.string(), _type: z.literal('reference') }),
    })
    .optional(),
```

- [ ] **Step 2: Write the failing test**

In `apps/admin/src/server/sanity/invoices.test.ts`, add these two `vi.mock` calls directly below the existing `vi.mock('./client', ...)` block:
```ts
vi.mock('./upload', () => ({
  uploadFileAsset: vi.fn(async () => ({ _ref: 'file-abc-pdf', _type: 'reference' })),
}));

vi.mock('../pdf/renderInvoicePdf', () => ({
  renderInvoicePdf: vi.fn(async () => Buffer.from('%PDF-fake')),
}));
```
Add `markInvoiceStatus` to the import from `./invoices`, add `import { uploadFileAsset } from './upload';` and `import { renderInvoicePdf } from '../pdf/renderInvoicePdf';`, then append:
```ts
describe('markInvoiceStatus', () => {
  function mockPatch() {
    const commitMock = vi.fn(async () => ({ _id: 'inv-1', status: 'sent' }));
    const setMock = vi.fn(() => ({ commit: commitMock }));
    vi.mocked(draftSanityClient.patch).mockReturnValue({ set: setMock } as never);
    return { setMock };
  }

  const draftInvoice = {
    _id: 'inv-1',
    _type: 'invoice',
    seq: 7,
    issueDate: '2026-06-30',
    status: 'draft',
    issuerSnapshot: { name: 'Me', address: 'A', phone: 'P', email: 'e@x.com' },
    clientSnapshot: { name: 'Acme', email: 'a@x.com', phone: 'P', address: 'A', currency: 'USD' },
    client: { _ref: 'client-1', _type: 'reference' },
    currency: 'USD',
    lineItems: [],
    taxRate: 0,
    totals: { subtotal: 0, vat: 0, total: 0 },
  };

  it('renders + uploads a PDF and patches status when leaving draft', async () => {
    fetchMock.mockResolvedValueOnce([draftInvoice]);
    const { setMock } = mockPatch();

    await markInvoiceStatus('inv-1', 'sent');

    expect(renderInvoicePdf).toHaveBeenCalledOnce();
    expect(uploadFileAsset).toHaveBeenCalledWith(expect.any(Buffer), 'INV-2026-007.pdf');
    expect(setMock).toHaveBeenCalledWith({
      status: 'sent',
      pdf: { _type: 'file', asset: { _ref: 'file-abc-pdf', _type: 'reference' } },
    });
  });

  it('patches status only (no PDF) when already out of draft', async () => {
    fetchMock.mockResolvedValueOnce([{ ...draftInvoice, status: 'sent' }]);
    const { setMock } = mockPatch();

    await markInvoiceStatus('inv-1', 'paid');

    expect(renderInvoicePdf).not.toHaveBeenCalled();
    expect(uploadFileAsset).not.toHaveBeenCalled();
    expect(setMock).toHaveBeenCalledWith({ status: 'paid' });
  });

  it('does not patch when PDF generation fails', async () => {
    fetchMock.mockResolvedValueOnce([draftInvoice]);
    vi.mocked(renderInvoicePdf).mockRejectedValueOnce(new Error('render boom'));

    await expect(markInvoiceStatus('inv-1', 'sent')).rejects.toThrow('render boom');
    expect(draftSanityClient.patch).not.toHaveBeenCalled();
  });
});
```
Add `beforeEach(() => vi.clearAllMocks());` near the top of the file if not present, so `renderInvoicePdf`/`uploadFileAsset` call counts reset between the three cases.

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/sanity/invoices.test.ts`
Expected: FAIL — `markInvoiceStatus` is not exported.

- [ ] **Step 4: Implement `markInvoiceStatus`**

In `apps/admin/src/server/sanity/invoices.ts`, add imports at the top (external `randomUUID` line stays first; then the `@/` and relative imports):
```ts
import { formatInvoiceNumber } from '@/shared/lib/format';
import { renderInvoicePdf } from '../pdf/renderInvoicePdf';
import { uploadFileAsset } from './upload';
```
Append the function:
```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/server/sanity/invoices.test.ts`
Expected: PASS (all three `markInvoiceStatus` cases + existing invoice cases green).

- [ ] **Step 6: Typecheck**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin typecheck`
Expected: no type errors (the `Invoice` type now includes `pdf`).

- [ ] **Step 7: Commit**

```bash
cd /Users/marco/Projects/mfranceschit/developer
git add apps/admin/src/shared/schemas.ts apps/admin/src/server/sanity/invoices.ts apps/admin/src/server/sanity/invoices.test.ts
git commit -m "feat(admin): generate + store invoice PDF when leaving draft"
```

---

### Task 4: Server function + query hook + editor wiring

**Files:**
- Modify: `apps/admin/src/server/functions/invoices.ts` (add `markInvoiceStatusFn`)
- Modify: `apps/admin/src/features/invoices/queries.ts` (add `useMarkInvoiceStatus`)
- Modify: `apps/admin/src/routes/invoices/$id.tsx` (`markAs` uses the new hook)

**Interfaces:**
- Consumes: `markInvoiceStatus` from `@/server/sanity/invoices`; `markInvoiceStatusFn` from `@/server/functions/invoices`.
- Produces:
  - `markInvoiceStatusFn` — server function, `POST`, validator `{ id: string; status: 'sent' | 'paid' }`.
  - `useMarkInvoiceStatus()` — mutation hook; `mutateAsync({ id, status })` returns `Promise<Invoice>`, invalidates `['invoices']`.

- [ ] **Step 1: Add the server function**

In `apps/admin/src/server/functions/invoices.ts`, add `markInvoiceStatus` to the import from `@/server/sanity/invoices`, then append:
```ts
export const markInvoiceStatusFn = createServerFn({ method: 'POST', strict: { output: false } })
  .validator(z.object({ id: z.string(), status: z.enum(['sent', 'paid']) }))
  .handler(async ({ data }) => markInvoiceStatus(data.id, data.status));
```

- [ ] **Step 2: Add the query hook**

In `apps/admin/src/features/invoices/queries.ts`, add `markInvoiceStatusFn` to the import from `@/server/functions/invoices`, then add:
```ts
export function useMarkInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'sent' | 'paid' }) =>
      markInvoiceStatusFn({ data: { id, status } }) as Promise<Invoice>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
```

- [ ] **Step 3: Wire the editor's `markAs` to the new hook**

In `apps/admin/src/routes/invoices/$id.tsx`:
1. Add `useMarkInvoiceStatus` to the import from `@/features/invoices/queries`.
2. Below `const patchInvoice = usePatchInvoice();` add:
```ts
  const markInvoiceStatus = useMarkInvoiceStatus();
```
3. Replace the body of `markAs`:
```ts
  async function markAs(status: 'sent' | 'paid') {
    if (isNew) return;
    await markInvoiceStatus.mutateAsync({ id, status });
  }
```
(Leave `patchInvoice` in place — `onSubmit` still uses it to save draft edits.)

- [ ] **Step 4: Typecheck**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin typecheck`
Expected: no type errors.

- [ ] **Step 5: Run the full admin test suite (no regressions)**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/marco/Projects/mfranceschit/developer
git add apps/admin/src/server/functions/invoices.ts apps/admin/src/features/invoices/queries.ts "apps/admin/src/routes/invoices/\$id.tsx"
git commit -m "feat(admin): wire mark-status to server PDF generation"
```

---

### Task 5: `sanityFileUrl` helper

**Files:**
- Create: `apps/admin/src/shared/lib/sanityFile.ts`
- Test: `apps/admin/src/shared/lib/sanityFile.test.ts`

**Interfaces:**
- Produces: `sanityFileUrl(ref: string): string` — resolves a `file-<id>-<ext>` asset ref to a public CDN URL, or `''` when the ref is malformed / env is missing.

- [ ] **Step 1: Write the failing test**

Create `apps/admin/src/shared/lib/sanityFile.test.ts` (mirrors `sanityImage.test.ts`):
```ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sanityFileUrl } from './sanityFile';

describe('sanityFileUrl', () => {
  const originalProjectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const originalDataset = import.meta.env.VITE_SANITY_DATASET;

  beforeEach(() => {
    import.meta.env.VITE_SANITY_PROJECT_ID = 'abc123';
    import.meta.env.VITE_SANITY_DATASET = 'production';
  });

  afterEach(() => {
    import.meta.env.VITE_SANITY_PROJECT_ID = originalProjectId;
    import.meta.env.VITE_SANITY_DATASET = originalDataset;
  });

  it('builds a real Sanity file CDN URL from a valid asset ref', () => {
    expect(sanityFileUrl('file-abc-pdf')).toBe(
      'https://cdn.sanity.io/files/abc123/production/abc.pdf',
    );
  });

  it('returns an empty string for an empty ref', () => {
    expect(sanityFileUrl('')).toBe('');
  });

  it('returns an empty string for a malformed ref', () => {
    expect(sanityFileUrl('not-a-real-ref')).toBe('');
  });

  it('returns an empty string when project id is missing', () => {
    import.meta.env.VITE_SANITY_PROJECT_ID = '';
    expect(sanityFileUrl('file-abc-pdf')).toBe('');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/shared/lib/sanityFile.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the helper**

Create `apps/admin/src/shared/lib/sanityFile.ts`:
```ts
const FILE_REF_PATTERN = /^file-([a-zA-Z0-9]+)-([a-z0-9]+)$/;

export function sanityFileUrl(ref: string): string {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const dataset = import.meta.env.VITE_SANITY_DATASET;
  const match = FILE_REF_PATTERN.exec(ref);

  if (!projectId || !dataset || !match) {
    return '';
  }

  const [, assetId, ext] = match;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${ext}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin exec vitest run src/shared/lib/sanityFile.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/marco/Projects/mfranceschit/developer
git add apps/admin/src/shared/lib/sanityFile.ts apps/admin/src/shared/lib/sanityFile.test.ts
git commit -m "feat(admin): add sanityFileUrl helper for file assets"
```

---

### Task 6: Download-PDF link in the invoice editor

**Files:**
- Modify: `apps/admin/src/widgets/InvoiceSummaryCard/InvoiceSummaryCard.tsx` (add `pdfUrl` prop + link)
- Modify: `apps/admin/src/routes/invoices/$id.tsx` (resolve + pass `pdfUrl`)

**Interfaces:**
- Consumes: `sanityFileUrl` from `@/shared/lib/sanityFile`; the invoice's `pdf?.asset._ref`.
- Produces: `InvoiceSummaryCardProps.pdfUrl?: string`; a "Download PDF" link rendered only when `pdfUrl` is a non-empty string.

- [ ] **Step 1: Add the `pdfUrl` prop + link to the summary card**

In `apps/admin/src/widgets/InvoiceSummaryCard/InvoiceSummaryCard.tsx`:
1. Add `pdfUrl?: string;` to `InvoiceSummaryCardProps` (after `onEditIssuer: () => void;`).
2. Add `pdfUrl,` to the destructured props in the function signature.
3. Directly after the closing `</p>` of the "Once marked as sent…" paragraph and before the `Card` closes, add:
```tsx
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm font-medium text-[var(--text-strong)] underline underline-offset-2"
          >
            Download PDF
          </a>
        ) : null}
```

- [ ] **Step 2: Resolve and pass `pdfUrl` from the editor**

In `apps/admin/src/routes/invoices/$id.tsx`:
1. Add `import { sanityFileUrl } from '@/shared/lib/sanityFile';` in the `@/` import group.
2. On the `<InvoiceSummaryCard ... />` element, add the prop:
```tsx
          pdfUrl={invoice?.pdf?.asset._ref ? sanityFileUrl(invoice.pdf.asset._ref) : undefined}
```

- [ ] **Step 3: Typecheck**

Run: `cd /Users/marco/Projects/mfranceschit/developer && fnm exec -- pnpm --filter @mfranceschit/admin typecheck`
Expected: no type errors.

- [ ] **Step 4: Manual verification (dev server)**

Ask the user to: open an existing `draft` invoice, click "Mark as sent", confirm no error toast, then reload and confirm a "Download PDF" link appears in the summary card and opens a PDF matching the invoice body (INVOICE title, ISSUER/BILL TO, line items, totals). (Per project rules, the user runs the dev server.)

- [ ] **Step 5: Commit**

```bash
cd /Users/marco/Projects/mfranceschit/developer
git add apps/admin/src/widgets/InvoiceSummaryCard/InvoiceSummaryCard.tsx "apps/admin/src/routes/invoices/\$id.tsx"
git commit -m "feat(admin): add Download PDF link to invoice editor"
```

---

## Self-Review

**Spec coverage:**
- Trigger (leave draft → generate) → Task 3 (`markInvoiceStatus`) + Task 4 (wiring).
- Engine `@react-pdf/renderer`, component in `packages/ui`, colors from `tokens/colors.ts` → Task 1.
- Atomic failure (no status change if PDF fails) → Task 3 (patch runs last; test asserts patch not called on render failure).
- Store as Sanity file asset + `pdf` schema field → Task 2 + Task 3 (schema).
- Download link → Task 5 (`sanityFileUrl`) + Task 6 (UI).
- Visual/fidelity target → Task 1 component layout + Task 6 manual verification.

**Font deviation:** spec said "Inter"; plan uses built-in Helvetica (documented in Global Constraints) because `@fontsource` ships woff (not react-pdf TTF) and bundling Inter binaries is disproportionate. Swappable later.

**Type consistency:** `markInvoiceStatus(id, status)` and `markInvoiceStatusFn`/`useMarkInvoiceStatus` all use `status: 'sent' | 'paid'`. `pdf` shape `{ _type: 'file'; asset: { _ref; _type: 'reference' } }` is identical across schema, `markInvoiceStatus`, and the `pdfUrl` resolver. `uploadFileAsset` returns `{ _ref, _type: 'reference' }`, consumed directly as `patch.pdf.asset`.
