# Admin — Custom Studio + Invoices

**Date:** 2026-07-12
**Status:** Design approved, pending spec review

## Overview

Build a custom admin app (`apps/admin`) in the monorepo that replaces the standalone
Sanity Studio currently hosted from `~/Projects/developer`, wearing the `@mfranceschit/ui`
visual identity instead of the default Studio chrome. It reaches **parity** with what the
old Studio manages today (projects, certifications, degrees, with en/es/pt localization and
images) and **adds an invoice feature** that renders branded, printable invoices.

The old repo's front-end already migrated to `apps/portfolio` (Astro). This spec migrates the
*authoring* side. The public Astro site is unaffected — it keeps reading the same Sanity
dataset with the same document shapes.

## Goals

- Full CRUD over the existing content types, styled entirely with `packages/ui`.
- Preserve the exact Sanity document shapes so `apps/portfolio` queries keep working unchanged.
- Keep Sanity draft/publish behavior (parity with Studio).
- Add `client` + `invoice` content and a branded invoice document with print-to-PDF.
- Keep all Sanity access behind server functions so the token stays off the client and the
  logic can later deploy as / extract to a Cloudflare Worker.

## Non-goals (this phase)

- Deployment + auth. **Local-only.** No Cloudflare Access, no public hosting yet.
- Revision-history UI (list/preview/restore) — deferred to a later phase; draft/publish stays.
- Server-side / emailed PDF generation — client-side print only for v1.
- Migrating `apps/portfolio` off Sanity or changing its schema.

## Stack

- **TanStack Start** (full-stack React on Vite): TanStack Router (routing), TanStack Query
  (data/cache/mutations), **server functions** for all Sanity access.
- **Forms:** react-hook-form + zod.
- **UI:** `@mfranceschit/ui` only, per the repo HARD RULE. New primitives are added to
  `packages/ui`, never hand-rolled in the app.
- **Sanity:** `@sanity/client` used **inside server functions**; the token is a server-only env
  var and never reaches the browser bundle.
- **Deploy target (future):** `admin.mfranceschit.com` on Cloudflare Workers + Cloudflare
  Access. Out of scope now, but Start deploys to Workers natively, so the future step is
  largely "deploy + gate", not a rewrite.

Exact package versions are pinned against current docs at build time (never from memory).

## Architecture

```
apps/admin/
  src/
    router.tsx / app entry   TanStack Start + Router + QueryClient provider
    routes/                  TanStack Router route tree (file-based)
    features/
      content/               projects / certifications / degrees (list + edit forms)
      clients/               client CRUD
      invoices/              invoice CRUD + branded document + print view
    widgets/                 Cross-feature compositions (document toolbar, nav shell)
    server/                  TanStack Start server functions (THE seam)
      sanity/
        client.ts            configured @sanity/client (server-only token)
        queries.ts           GROQ reads (draft-aware)
        mutations.ts         patch/create/delete on drafts
        publish.ts           publish / discard-draft transactions
        upload.ts            image asset upload
      functions/             createServerFn wrappers the client calls
    shared/
      types.ts               document shapes (TS)
      schemas.ts             zod schemas per document type (shared client+server)
      lib/                   formatters (money, dates), invoice totals
    stores/                  Zustand for pure UI state (only if needed)
```

**The seam:** the browser never talks to Sanity. Features call **server functions**
(`createServerFn`) via TanStack Query hooks; those functions run `server/sanity/*` with the
token. Moving to a standalone Worker later = deploy Start's server to Cloudflare Workers (or
lift `server/sanity/*` behind a Worker), leaving features/UI untouched. zod schemas in
`shared/` validate on both sides.

## Data model

All types live in the **same existing Sanity dataset**. Shapes below must match what the old
Studio produced (so portfolio queries keep working). The custom admin does **not** need Sanity
Studio schema files; document shapes are encoded as TS types + zod schemas in `shared/`.

### Existing (parity)

- **`project`** — `name` (string), `slug` (slug), `image` (image + hotspot + `alt`),
  `url`, `repository`, `description` (`localeContent` = block content ×3 langs),
  `technologies` (string[]).
- **`certification`** — `name` (string), `date` (date), `image` (image + hotspot + `alt`),
  `url`, `issued` (`localeString`).
- **`degree`** — `name` (`localeString`), `image` (image + hotspot + `alt`),
  `issued` (`localeString`).
- **`localeString`** — object `{ en, es, pt }` of strings.
- **`localeContent`** — object `{ en, es, pt }` of block-content arrays.
- **Image shape** — `{ _type: 'image', asset: { _ref }, hotspot?, crop?, alt }`. hotspot/crop
  must be preserved exactly.

Languages: `en` (default), `es`, `pt`.

Desk structure parity (informs nav grouping):
- **Certifications** → Degrees, Certificates
- **Work** → Projects

### New

- **`businessProfile`** — singleton for the **ISSUER** (you). Edited once, reused on every
  invoice: `name`, `taxId`, `address` (multiline), `phone`, `email`. (Modeled as a single
  well-known document, e.g. `_id: 'businessProfile'`.)
- **`client`** — the **BILL TO** party: `name`, `email`, `phone`, `address` (multiline),
  `taxId` (optional), `currency` (default `USD`), `defaultRate` (number, optional).
- **`invoice`** —
  - `seq` (integer, per-year sequence) + display number `INV-{year}-{seq:03}` derived from
    `issueDate`'s year (e.g. `INV-2026-007`)
  - `issuerSnapshot` — copy of `businessProfile` fields at finalize (so a later profile edit
    never rewrites a sent invoice)
  - `client` (reference → `client`) + `clientSnapshot` (same freezing rationale)
  - `issueDate` (date); `dueDate` (date, **optional** — not shown in the reference layout)
  - `currency` (string, default `USD`)
  - `lineItems[]` — `{ quantity, description, unitPrice }` (line total = qty × unitPrice)
  - `taxRate` (number, %) — **single invoice-level VAT**, shown in each line's VAT column and
    summarized in totals
  - `notes` (text, optional)
  - `status` — `draft | sent | paid`
  - `totals` — **stored snapshot** `{ subtotal, vat, total }` (frozen once finalized so later
    rate edits never mutate a sent/paid invoice)

## Draft / publish (parity with Studio)

Implemented in `server/sanity/{queries,mutations,publish}.ts`:

- Edits write to `drafts.<id>`.
- Edit reads prefer the draft over the published doc (token + raw perspective).
- **Publish** = transaction: `createOrReplace(published ← draft)` + `delete(drafts.<id>)`.
- **Discard** = `delete(drafts.<id>)`.
- List views show per-document status: published / draft / unpublished-changes.
- A shared **document toolbar** widget exposes Publish / Discard and dirty state.

**Invoices are exempt from draft/publish** (financial records don't fit that model). They are
written directly and governed by `status`: editable while `draft`; once `sent`, the form locks
and the `totals` snapshot is frozen. Explicit design choice — revisit if undesired.

## Invoice generation + PDF

- **Numbering:** per-year sequence. At create, `seq = (max seq among invoices of the current
  year) + 1`; the display number is `INV-{year}-{seq:03}`. Fine for a single local user; the
  future Worker can make this atomic.
- **Totals:** computed in `shared/lib` from line items + `taxRate`; shown live while editing;
  snapshotted onto `invoice.totals` at finalize.

**`InvoiceDocument` layout** (matches the reference image; built in `packages/ui` from brand
tokens + Inter, restrained/monochrome with subtle brand accent):
- Title `INVOICE` (left) + meta block (right): `Invoice Number`, `Issue Date`.
- Two columns: **ISSUER** (from `issuerSnapshot`) and **BILL TO** (from `clientSnapshot`) —
  bold name, then Tax ID / address lines / phone / email.
- Line-item table: `QTY | DESCRIPTION | UNIT PRICE ({cur}) | VAT | TOTAL ({cur})`.
- Totals block (right): `Subtotal`, `VAT ({rate}%)`, **`Total Due`** (emphasized).
- Optional notes/footer.
- **Print:** `@page` margins + CSS to suppress/replace the browser's default header/footer
  (the reference's top `Invoice … / date-time` and bottom `about:srcdoc / Page 1 of 1` are
  browser artifacts, not part of the design).

- **PDF v1 = client-side print.** A dedicated print route (e.g. `/invoices/$id/print`) renders
  only `InvoiceDocument` with `@page` CSS; a Print button calls `window.print()`. No infra.
- **Future upgrade:** a server function renders the same route via Cloudflare Browser Rendering
  for auto/emailed PDFs.

## packages/ui additions

Per the HARD RULE, these go in `packages/ui` (Ark UI + tokens + a Storybook story each),
following `packages/ui/CLAUDE.md`. Existing today: Button, Input, FormField, Card, Badge,
Avatar, Logo, MobileNav.

New primitives:
- `Select`, `Combobox` (client picker, technologies), `DatePicker`, `Dialog`, `Table`/DataTable,
  `Tabs` (locale switcher), `Toast` (save/publish feedback), `NumberInput`, `Checkbox`/`Switch`,
  `Tooltip`.

New composite components:
- **`ImageUploader`** — hardest piece. Uploads to the Sanity asset API (via a server function),
  edits `alt`, sets the hotspot point + crop rect, emits Sanity's exact image object.
- **`RichTextEditor`** — built on Sanity's standalone `@portabletext/editor` (headless) with a
  branded toolbar; emits the same block array `localeContent` stores.
- **`LocaleField`** — tabbed en/es/pt wrapper around `Input` or `RichTextEditor`, matching
  `localeString` / `localeContent` shapes.
- **`InvoiceDocument`** — the branded invoice layout (also the print surface).

## Environment / config

- `apps/admin/.env` (local, server-only): `SANITY_PROJECT_ID`, `SANITY_DATASET`,
  `SANITY_API_VERSION`, `SANITY_TOKEN` (write token).
- No `VITE_`/public exposure of the token — it is read only inside server functions.

## Phasing

1. **Scaffold** — `apps/admin` (TanStack Start, Router/Query, RHF/zod), providers, nav shell
   from `packages/ui`, `.env`, workspace + Turbo wiring.
2. **Sanity seam** — `server/sanity/*` + `server/functions/*`: client, draft-aware reads,
   mutations, publish/discard, upload; `shared/` types + zod schemas.
3. **packages/ui primitives** — Select, DatePicker, Dialog, Table, Tabs, Toast, NumberInput,
   Checkbox/Switch, Tooltip, Combobox.
4. **LocaleField + RichTextEditor + ImageUploader** in `packages/ui`.
5. **Content parity** — projects / certifications / degrees list + edit forms with i18n +
   images + draft/publish toolbar.
6. **Clients** — CRUD.
7. **Invoices** — schema, form, numbering, totals, list, `InvoiceDocument`, print-to-PDF.

## Future (out of scope here)

- Deploy Start's server to Cloudflare Workers; add Cloudflare Access; host at
  `admin.mfranceschit.com`.
- Atomic invoice numbering, server-rendered / emailed PDFs via Browser Rendering.
- Revision-history UI (list / preview / restore).
- Retire the old `~/Projects/developer` Studio once parity is confirmed.

## Resolved from the reference invoice

- Currency: per-invoice, default **USD** (`$`).
- Tax: **single invoice-level VAT rate**, echoed per line and in totals.
- Issuer is a reusable **`businessProfile` singleton**; issuer + client are **snapshotted**
  onto the invoice at finalize.
- Number format `INV-{year}-{seq:03}`, sequence **resets per year**.
- Due date optional; no IBAN/payment-terms in v1.

## Open questions

- Should `businessProfile` support multiple currencies/logos, or is one profile enough?
- Do you ever need **per-line** VAT (mixed rates on one invoice), or is invoice-level always fine?
- Add a subtle brand accent (e.g. blue rule under section labels) or keep it strictly
  monochrome like the reference?
