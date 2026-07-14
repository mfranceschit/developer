# Invoice PDF generation → Sanity

**Date:** 2026-07-14
**Status:** Approved (design)
**Area:** `apps/admin`, `packages/ui`

## Problem

When an invoice leaves `draft` (is marked sent or paid), we want a branded PDF of
the final invoice generated and stored in Sanity as a file asset, downloadable from
the admin editor. Today invoices are HTML-only: the `/invoices/$id/print` route
renders `InvoiceDocument` and relies on the browser's `window.print()`. No PDF is
persisted.

## Decisions (from brainstorming)

- **Trigger:** Generate the PDF when the invoice **transitions out of `draft`**
  (draft→sent or draft→paid). `sent → paid` keeps the existing PDF. If an invoice is
  moved back to draft and out again with no PDF present, it regenerates.
- **Engine:** `@react-pdf/renderer` (pure Node, no browser binary, serverless/Workers
  friendly). A separate PDF layout is acceptable — the invoice is small and stable.
- **Failure mode:** **Atomic.** Render + upload happen before the status patch. If
  generation or upload fails, the status stays `draft` and the user sees an error. A
  sent/paid invoice therefore always has a PDF.
- **Access:** A "Download PDF" link appears in the invoice editor summary card once a
  PDF exists.

## Architecture

### Flow

```
editor: markAs('sent' | 'paid')
  → markInvoiceStatusFn({ id, status })                 [server function]
      → invoice = getInvoice(id)
      → if invoice.status === 'draft' && !invoice.pdf:
            buffer = renderInvoicePdf(invoice)           (renderToBuffer)
            assetRef = uploadFileAsset(buffer, filename) (Sanity 'file' asset)
            patch = { status, pdf: { _type:'file', asset:{ _ref: assetRef } } }
        else:
            patch = { status }
      → patchInvoice(id, patch)
      → return updated invoice
```

Because the patch runs last, any throw in render/upload aborts before the status
changes — this is what makes the transition atomic. No try/catch that swallows the
error; the error propagates to the client mutation and is surfaced via the toaster.

### Components / units

1. **`packages/ui` — `InvoiceDocumentPdf`**
   - New `src/components/InvoiceDocumentPdf/{InvoiceDocumentPdf.tsx,index.ts}` plus a
     Storybook story is **not** applicable (react-pdf primitives don't render in the
     Storybook DOM); instead export the component and its props from the barrel.
   - Built with `@react-pdf/renderer` primitives (`Document`, `Page`, `View`, `Text`).
   - **Same props interface** as `InvoiceDocument` (`InvoiceDocumentProps`) so the two
     surfaces stay in sync by contract. Reuse the exported prop types.
   - Colors come from the JS token surface `tokens/colors.ts` (never raw hex) — this is
     the sanctioned path for JS consumers that cannot read CSS variables. HARD rule
     satisfied.
   - Typography uses react-pdf's built-in `Helvetica` / `Helvetica-Bold` (no font
     files bundled). This is a deliberate relaxation of "Inter": `@fontsource/inter`
     ships woff (not react-pdf-loadable TTF), and bundling raw Inter `.ttf` binaries is
     disproportionate to the fidelity gain. Swappable later by registering an Inter
     `.ttf` via `Font.register`.
   - `@react-pdf/renderer` is a **dependency of `packages/ui`** (peer/normal dep as the
     repo convention dictates). Verify the current version with `pnpm info
     @react-pdf/renderer` before adding — do not pin from memory.

2. **`apps/admin` — server: render helper**
   - `server/sanity/invoices.ts`: add `markInvoiceStatus(id, status)` implementing the
     flow above. A private `renderInvoicePdf(invoice: Invoice): Promise<Buffer>` maps
     the loaded invoice onto `InvoiceDocumentPdf` props (the same field mapping the
     print route already performs: `issuerSnapshot`, `clientSnapshot`→`billTo`,
     `lineItems`, `currency`, `taxRate`, `totals`, `notes`, `formatInvoiceNumber`) and
     calls `renderToBuffer(<InvoiceDocumentPdf … />)`.
   - Filename: `${formatInvoiceNumber(invoice)}.pdf` (e.g. `INV-2026-003.pdf`).

3. **`apps/admin` — server: file upload**
   - `server/sanity/upload.ts`: add `uploadFileAsset(buffer: Buffer, filename: string)`
     returning `{ _ref, _type: 'reference' }`, using
     `draftSanityClient.assets.upload('file', buffer, { filename })`. The existing
     `uploadImageAsset` stays image-only.

4. **`apps/admin` — server function**
   - `server/functions/invoices.ts`: add
     `markInvoiceStatusFn = createServerFn({ method: 'POST', strict: { output: false } })`
     with validator `z.object({ id: z.string(), status: z.enum(['sent','paid']) })`,
     handler `markInvoiceStatus(data.id, data.status)`.

5. **`apps/admin` — client wiring**
   - `features/invoices/queries.ts`: add `useMarkInvoiceStatus()` mutation over
     `markInvoiceStatusFn`, invalidating `['invoices']` on success.
   - `routes/invoices/$id.tsx`: `markAs(status)` calls the new mutation instead of
     `patchInvoice.mutateAsync({ patch: { status } })`.

6. **Schema / type**
   - `shared/schemas.ts`: add to `invoiceSchema` an optional
     `pdf: z.object({ _type: z.literal('file'), asset: z.object({ _ref: z.string(),
     _type: z.literal('reference') }) }).optional()`. Additive; invoice-only.
     `apps/portfolio` does not query invoices, so no downstream breakage.

7. **Access (download link)**
   - `shared/lib/sanityFile.ts` (new): `sanityFileUrl(ref: string): string` mirroring
     `sanityImageUrl` — parse a `file-<id>-<ext>` asset ref into
     `https://cdn.sanity.io/files/<projectId>/<dataset>/<id>.<ext>` using the public
     `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET`. Unit-tested like `sanityImage`.
   - `InvoiceSummaryCard` (or the aside in `routes/invoices/$id.tsx`): when
     `invoice.pdf?.asset._ref` resolves, render a "Download PDF" link/anchor to the
     file URL (using a UI primitive, not a bespoke element). Shown only when a PDF
     exists.

## Visual target / fidelity

The generated PDF must reproduce the current `window.print()` body layout:
`INVOICE` title (left) with `Invoice Number` / `Issue Date` (right); two-column
`ISSUER` / `BILL TO` party blocks with uppercase muted labels; the line-item table
(`QTY`, `DESCRIPTION`, `UNIT PRICE (currency)`, `VAT`, `TOTAL (currency)`); and the
right-aligned totals stack (`Subtotal`, `VAT (rate%)`, bold `Total Due`) with the
rule above `Total Due`. It must **omit** the browser print artifacts (the running
`Invoice …/date` header and the `about:srcdoc / Page 1 of 1` footer) — react-pdf
produces a clean single page. Typography is Inter; muted labels and rules use the
same token values as the HTML surface (via `tokens/colors.ts`). Acceptance is a
visual match of this body against the reference print output.

## Data flow

- Invoice document gains a `pdf` file reference. The file asset itself lives in Sanity.
- The browser never touches Sanity: generation + upload happen entirely inside the
  server function; the client only calls `markInvoiceStatusFn` and later resolves the
  public file CDN URL for download.

## Error handling

- Render/upload errors propagate out of `markInvoiceStatus` before the status patch,
  so the invoice remains `draft`. The client mutation rejects; the editor surfaces the
  error via the existing toaster. No partial state (status changed but no PDF) is
  possible.
- `sanityFileUrl` returns `''` on a malformed/absent ref or missing env, and the UI
  hides the link when the URL is empty (same guard style as `sanityImageUrl`).

## Testing

- `packages/ui`: `InvoiceDocumentPdf` renders to a buffer without throwing for a
  representative invoice (smoke test via `renderToBuffer`); assert non-empty PDF bytes
  and `%PDF` header.
- `apps/admin`:
  - `sanityFile.test.ts`: valid ref → CDN url; empty/malformed ref → `''`; missing env
    → `''` (mirror `sanityImage.test.ts`).
  - `invoices` server test: `markInvoiceStatus` on a draft invoice calls upload and
    patches `{ status, pdf }`; on an already-sent invoice patches only `{ status }`
    (no re-upload); when render throws, `patchInvoice` is **not** called.
- Follow the repo rule: update existing invoice tests to match the new `markAs` path.

## Out of scope

- Regenerating a PDF after edits while already sent/paid (invoices are locked once out
  of draft; no edit path exists).
- Emailing / sharing the PDF.
- Hotspot/crop or any change to `InvoiceDocument`'s HTML rendering.
