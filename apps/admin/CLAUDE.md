# apps/admin — Admin Studio

A custom content-authoring app (`@mfranceschit/admin`) that replaces the standalone Sanity
Studio: full CRUD over the portfolio content types plus branded invoice generation, wearing the
`@mfranceschit/ui` design system instead of default Studio chrome. Built on TanStack Start
(full-stack React on Vite). Repo-wide rules and the design-system HARD rule live in the root
`CLAUDE.md`.

## Layout

```
src/
  router.tsx               TanStack Router + QueryClient + toaster (createRouter)
  routes/                  File-based route tree (TanStack Router)
    __root.tsx             Shell: <html>/<head>/<body>, HeadContent/Scripts, QueryClientProvider, NavShell, Toaster
    <type>/index.tsx       List route per content type
    <type>/$id.tsx         Edit route ('new' id = create mode)
    invoices/$id.print.tsx Print surface (InvoiceDocument only)
    settings/business-profile.tsx  Issuer singleton editor
  features/                TanStack Query hooks over the server-function seam
    content/queries.ts     Draft-based content (project/certification/degree/client)
    invoices/queries.ts    Direct-write invoices + businessProfile
  server/                  THE SEAM — the only place Sanity is touched
    sanity/                @sanity/client + GROQ + mutations (server-only token)
    functions/             createServerFn wrappers (the only server/* surface client code imports)
  shared/                  types.ts, schemas.ts (zod), lib/ (pure helpers)
  widgets/                 Cross-feature compositions (DocumentToolbar, NavShell)
  styles/global.css        Imports tailwind + @mfranceschit/ui tokens
```

## Scripts

```bash
pnpm dev          # vite dev
pnpm build        # vite build
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
```

## Imports & aliases

- **Alias: `@/` → `apps/admin/src`. Never use `../` / `../../`** for cross-directory imports.
  Configured in **both** `vite.config.ts` and `vitest.config.ts` (the two do NOT share config —
  a new alias must be added to both, or tests silently fail to resolve it). `import '@/styles/...'`
  too, not a relative CSS import.
- Consume the UI library from its barrel: `import { Button, Card, Table } from '@mfranceschit/ui'`.
  **Never deep-import** (`@mfranceschit/ui/src/components/...`).
- `import type` for type-only imports. External imports first, blank line, then `@/` imports.

## The seam (Sanity access)

- **The browser never talks to Sanity.** Features call **server functions** (`createServerFn`,
  in `server/functions/*`) via TanStack Query hooks; those functions run `server/sanity/*` with
  the write token. Nothing in `routes/`, `features/`, or `widgets/` may import `@sanity/client`
  or `server/sanity/*` directly — only `server/functions/*`.
- Server functions are invoked from the client as `someFn({ data: {...} })` and return a
  `Promise`. Some GET/complex-return wrappers carry `strict: { output: false }` (compile-time
  serializability relaxation only — no runtime effect).
- **Two clients** in `server/sanity/client.ts`: `sanityClient` (published, no token) and
  `draftSanityClient` (raw perspective + write token). Both read secrets from **`process.env`,
  NOT `import.meta.env`** — Vite replaces non-`VITE_` server vars with `void 0` in SSR chunks.
- `server/sanity/ids.ts` holds the shared `toDraftId`/`toPublishedId` helpers — reuse them,
  don't reinline the `drafts.` prefix logic.

## Data model & document shapes

- Shapes are encoded as TS types (`shared/types.ts`) + zod schemas (`shared/schemas.ts`), which
  must match the existing Sanity Studio shapes so `apps/portfolio` queries keep working. **Do not
  change the shapes** without a matching reason — the schema is effectively fixed.
- `localeString` / `localeContent` are `{ en, es, pt }` objects (default `en`). Image shape is
  `{ _type: 'image', asset: { _ref }, hotspot?, crop?, alt }` — preserve hotspot/crop exactly.

## Draft / publish

- `project`, `certification`, `degree`, `client` follow the Studio draft/publish model: edits
  write to `drafts.<id>`; reads prefer the draft; publish = `createOrReplace(published ← draft)` +
  delete draft; discard = delete draft. List views show status (published / draft /
  unpublished-changes); the shared **`DocumentToolbar`** widget exposes Publish/Discard.
- **Invoices are EXEMPT.** They are written directly (no `drafts.` prefix), governed by
  `status: 'draft' | 'sent' | 'paid'`. The edit form locks entirely once `status !== 'draft'`
  (totals + issuer/client snapshots are frozen from that point). Invoices do NOT use
  `DocumentToolbar` or the draft-based `content/queries.ts` — they have their own
  `invoices/queries.ts` + `server/sanity/invoices.ts`. Numbering: `INV-{year}-{seq:03}`, seq resets
  per year, derived from `issueDate`.

## Forms

- react-hook-form + zod (`@hookform/resolvers/zod`). Each edit route defines a **form-level zod
  schema distinct from the document schema** in `shared/schemas.ts` (form validates flat user
  input; the document schema validates the Sanity shape). Surface errors via `FormField`'s
  `error` prop.
- `localeString` fields use `LocaleField` wired with `useWatch` + `setValue(..., { shouldDirty:
  true })`. `localeContent` (block content) uses a `Tabs` + `RichTextEditor` per-locale switcher.
- Number fields go through `NumberInput` with `Controller`; guard against `NaN` on clear
  (`Number.isNaN(v) ? '' : String(v)`), since empty strings collapse to `undefined` on submit.

## UI (design-system HARD rule)

- **All components and colors come from `@mfranceschit/ui`.** App code never hand-rolls buttons/
  inputs/dialogs or writes raw hex/rgba. `widgets/` (NavShell, DocumentToolbar) are app-level
  *compositions* of UI primitives + tokens, not new primitives — layout-only Tailwind (flex/grid/
  spacing) is fine; new colors are not.
- `InvoiceDocument` lives in `packages/ui` (it's a reusable branded surface); the print route
  just maps a loaded `Invoice` onto its plain-props interface.

## Environment / config

- `apps/admin/.env` (see `.env.example`): `SANITY_PROJECT_ID`, `SANITY_DATASET`,
  `SANITY_API_VERSION`, `SANITY_TOKEN` (server-only write token) — plus **public**
  `VITE_SANITY_PROJECT_ID` / `VITE_SANITY_DATASET`, needed client-side by `shared/lib/sanityImage.ts`
  to build resolvable CDN image URLs. The `VITE_` pair is not secret (project id/dataset only);
  the token is, and must never be `VITE_`-prefixed.
- `routeTree.gen.ts` is generated by `vite dev`/the router plugin and is gitignored — never edit
  or commit it.

## Known deferrals (v1)

- Deployment + auth (Cloudflare Workers + Access) — local-only for now.
- Invoice totals are trusted from the client (not recomputed server-side); numbering is not
  atomic. Both are fine for a single trusted local user; harden if this goes multi-user.
- `ImageUploader` hotspot/crop editing is not wired (the alt + upload path works).
