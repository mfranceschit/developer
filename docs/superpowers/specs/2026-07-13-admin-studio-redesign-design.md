# Admin Studio Redesign — Design

**Date:** 2026-07-13
**Status:** Approved (design)

## Problem

The admin studio (`apps/admin`) is functionally complete but visually a scaffold: the
dashboard is a placeholder `Card`, list pages are a bare `h1` + `Table`, editors are a single
flat form column with a top toolbar, and the nav is an unstyled sidebar. A Claude Design
mockup (`Admin Studio Redesign.dc.html`) specifies a cohesive redesign of every surface —
sand-toned nav, a real dashboard, header-led list pages, and two-column editors with a sticky
right rail — all built on the existing `@mfranceschit/ui` design system.

This redesign is **presentation + composition only**. Every color and primitive the mockup
uses already exists in `packages/ui` (verified: all `--surface-*`, `--border-*`, `--shadow-*`,
`--text-*`, `--mf-sand/blue/gray/berry-*`, `--focus-ring`, `--radius-pill` tokens; `Button`
variants `primary`/`accent`/`outline`; `Badge` tones `blue`/`neutral`/`berry`/`sand`; `Logo`;
`Card`; `Table`). No document shapes, seam contracts, form logic, or Sanity access change.

## Scope

**In scope:**

- One new `packages/ui` primitive: `SegmentedControl`.
- New admin `widgets/`: `PageHeader`, `EditorLayout`, `PublishingCard`, `InvoiceSummaryCard`,
  and `widgets/dashboard/` (`DashboardHero`, `AttentionCard`, `BillingCard`).
- Restyle `NavShell` and the root shell.
- Rebuild the dashboard (`routes/index.tsx`) with real, live data via **one** new aggregation
  server function behind the seam.
- Reflow all list pages and all editors (project, certification, degree, client, about,
  business-profile, invoice) onto the new header + layout.

**Out of scope / unchanged:**

- Document shapes (`shared/types.ts`, `shared/schemas.ts`), the Sanity seam contract, the
  draft/publish model, invoice numbering/locking, and `InvoiceDocument` / the print route.
- No new colors or tokens (HARD rule: all colors/primitives stay in `packages/ui`; admin
  `widgets/` are compositions of primitives + layout-only Tailwind).
- Mobile nav behavior beyond what already exists.

## Approach

Follow the mockup's information architecture: a persistent sand sidebar, a centered
`max-w-[1100px]` content column, and three recurring page shapes — **dashboard**, **list**,
**editor**. Factor the recurring chrome into a small set of admin widgets so each route stays
a thin composition, and add exactly one shared UI primitive (`SegmentedControl`) that the
mockup introduces.

Key structural change to the shell: today `__root` wraps `<Outlet>` in one big `Card`
(`NavShell`'s `<main>`). The redesign removes that single wrapper — each screen owns its own
surfaces (hero, cards, table-in-card) inside the centered container, matching the mockup.

## New UI primitive (`packages/ui`)

### `SegmentedControl`

A compact pill toggle (the EN/ES/PT switcher and any future 2–4 option inline choice).
Replaces the full-width `Tabs` currently used for locale editing.

```
type SegmentedControlOption<T extends string> = { value: T; label: string };
type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  size?: 'sm' | 'md';   // sm for the inline cert/degree/about header switch
  'aria-label'?: string;
};
```

Visuals from the mockup: track `--mf-gray-100`, 2px padding, `--radius` pill segments; active
segment `--surface-card` + `--shadow-xs` + `--text-strong` (weight 600); inactive
`--text-muted`. Tokens only — no new colors. Built on Ark UI's `SegmentGroup` (mirroring how
`Tabs` wraps `ArkTabs`), giving keyboard/`role` semantics for free (arrow keys move selection).
Exported from the `packages/ui` barrel with a `.stories.tsx` alongside the other 27 stories —
that is the package's convention (Storybook only; the package has no unit-test runner).

The read-only invoice **Draft → Sent → Paid** stepper in the mockup is a presentational
element (dots + arrows), **not** a `SegmentedControl` — it lives inside `InvoiceSummaryCard`.

## New admin widgets (`apps/admin/src/widgets`)

All are compositions of `@mfranceschit/ui` primitives + tokens + layout-only Tailwind.

### `PageHeader`

Eyebrow (uppercase, tracked, `--text-muted`) + `h1` title + optional subtitle, with an
optional right-aligned `action` slot and an optional `backLink` ({ label, onClick }) rendered
as a `← {label}` row above the eyebrow. Used by every list page and every editor header.

```
type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backLink?: { label: string; onClick: () => void };
};
```

### `EditorLayout`

The editor shell: renders a `PageHeader` (with `backLink`) then a
`grid-cols-[1fr_300px]` two-column body — `main` (stacked form-section cards) and a sticky
(`sticky top-6`) `aside` rail. On narrow widths the rail stacks under the main column.

```
type EditorLayoutProps = {
  header: { eyebrow: string; title: string; backLink: { label; onClick } };
  children: ReactNode;   // main column
  aside: ReactNode;      // right rail
};
```

### `PublishingCard` (content editors' right rail)

Absorbs the current `DocumentToolbar`. A card with: status `Badge`, created / last-edited
rows, and `Save draft` (submits the form) / `Publish` / `Discard` actions, keeping the
existing confirm `Dialog` for discard and the existing toast wiring. Props mirror
`DocumentToolbar` plus `created`/`edited` display strings and a `saving`/`onSave` hook for the
form submit. **`DocumentToolbar` is deleted** once all editors move to `PublishingCard`.

```
type PublishingCardProps = {
  status: DocumentStatus;
  dirty: boolean;
  created?: string;
  edited?: string;
  onSave: () => void;      // triggers form submit
  saving: boolean;
  onPublish: () => Promise<void>;
  onDiscard: () => Promise<void>;
  toaster: ReturnType<typeof createToaster>;
};
```

### `InvoiceSummaryCard` (invoice editor's right rail)

Read-only Draft→Sent→Paid stepper (current status highlighted), subtotal / VAT / total rows
(computed via the existing `shared/lib/invoiceTotals`), `Save draft` and `Mark as sent`
buttons, and an issuer snapshot block linking to Business Profile. Respects the existing
lock rule: once `status !== 'draft'`, actions/totals are frozen (the invoice route already
owns this state — the card just reflects it).

### `widgets/dashboard/`

- `DashboardHero` — gradient panel (`linear-gradient(135deg, --mf-blue-700, --mf-blue-900)`)
  with the beige monogram watermark, greeting, a one-line summary, and `New project` /
  `New invoice` / `Edit about` actions (navigation callbacks passed in).
- `AttentionCard` — "Needs attention" list of rows (name, type label, status `Badge`), each
  navigating to its editor; header shows the count.
- `BillingCard` — "Outstanding" figure + a short recent-invoice list (number, meta, total,
  status `Badge`) and an "All invoices →" link.

Hero copy that depends on counts (e.g. "Three drafts are waiting…") is derived from the
dashboard data, with a sensible fallback when everything is published/empty.

## Data — one aggregation server function

The dashboard's data is assembled by a single server function behind the seam (the browser
never fans out across content types).

### Seam (`server/`)

- `server/sanity/dashboard.ts`
  - `getDashboard()` — server-side, calls the existing `listDocuments('project' |
    'certification' | 'degree' | 'client')` and `listInvoices()`, then delegates shaping to
    the pure helper below. Returns:
    ```
    {
      attention: Array<{ id: string; type: 'project'|'certification'|'degree'|'client';
                         typeLabel: string; name: string; status: DocumentStatus }>,
      counts: { projects; certifications; degrees; clients; invoices },
      outstandingTotal: { amount: number; currency: string | 'mixed' },
      recentInvoices: Array<{ id; number; clientName; total; status; issueDate; dueDate }>,
    }
    ```
  - `name` is normalized per type (`project.name`, `certification.name`, localized
    `degree.name.en` / `client.name`), so the client renders a flat list.
- `shared/lib/dashboard.ts` — `buildDashboard({ projects, certifications, degrees, clients,
  invoices })` — **pure**, unit-tested. Filters `_status !== 'published'` into `attention`,
  sums `status === 'sent'` invoices into `outstandingTotal` (flagging `'mixed'` if currencies
  differ), and picks the most recent invoices. Keeping the logic pure keeps `getDashboard` a
  thin fetch-and-shape wrapper.
- `server/functions/dashboard.ts` — `getDashboardFn` (`GET`, `strict: { output: false }`),
  no input.

### Query hook

- `features/dashboard/queries.ts` — `useDashboard()` over `getDashboardFn`, key `['dashboard']`.

### Nav counts

`NavShell` shows the per-type counts from the mockup. Since the nav is mounted on every route
(not just the dashboard), it reads counts from the same `useDashboard()` hook — React Query
caches it, so navigating from the dashboard reuses the cached result and other routes fetch it
once. Counts render only when loaded (no layout shift placeholder needed).

## Screen-by-screen

### `NavShell` + root shell

Sidebar: `--mf-sand-50` background, `--mf-sand-200` right border, 264px wide, sticky
full-height. `Logo variant="navy"`. A new top group **"Studio"** with **Dashboard** (`/`),
above the existing Certifications / Work / Site / Billing groups. Each link is a row with an
active "card" treatment (`--surface-card` bg + `--border-subtle` + `--shadow-xs`, weight 600)
vs. inactive (`--mf-gray-600`, transparent), a hover fill, and a right-aligned muted count.
Footer: `mfranceschit.com ↗` link pinned to the bottom. `__root`/`NavShell` no longer wrap
`<Outlet>` in a `Card`; `<main>` becomes the `--surface-page` scroll area with the centered
`max-w-[1100px]` padding container.

### Dashboard (`routes/index.tsx`)

`useDashboard()` → `DashboardHero` + a two-column grid of `AttentionCard` and `BillingCard`.
Loading and empty states handled (empty attention → "All caught up" style message).

### List pages (projects, certifications, degrees, clients, invoices)

`PageHeader` (eyebrow = group, title, subtitle summarizing counts + status breakdown, action =
`New …` `Button`) followed by the existing `Table` wrapped in a `Card padding="0"` with
`overflow-hidden`, plus an optional footer summary row (`--mf-gray-50`) — used by invoices for
the outstanding line. Row/column data and navigation are unchanged from today; only the header
and card framing are new. Subtitle strings are derived from the already-loaded list + status.

### Editors (project, certification, degree, client, about, business-profile, invoice)

Each route swaps its flat form for `EditorLayout`:

- **Main column** — existing fields regrouped into `Card` sections matching the mockup
  ("Details", "Media", "Description"/"Body", "Contact", "Billing defaults", "Line items",
  "Notes", etc.). Fields keep using `FormField` + `Input`/`NumberInput`/`ImageUploader`.
  Per-locale fields (project description, about title/body, cert issuer, degree name/issuer)
  switch from `Tabs` to `SegmentedControl` + the same `RichTextEditor`/`Input` + the existing
  `useWatch`/`setValue(..., { shouldDirty: true })` locale wiring.
- **Right rail** — `PublishingCard` for the six content editors; `InvoiceSummaryCard` for the
  invoice editor. `business-profile` (direct-write singleton, no draft/publish) uses a reduced
  rail: a simple "Save" card (no status/publish), consistent with its existing semantics.

All react-hook-form + zod form schemas, submit handlers, draft/publish mutations, and invoice
locking/numbering/totals are preserved exactly — this is a layout reflow, not a logic change.
The invoice editor keeps its existing line-item add/remove and client/currency selects; they
are re-slotted into the new cards.

## Testing

Following existing admin conventions (vitest, colocated `*.test.ts`):

- `shared/lib/dashboard.test.ts` — `buildDashboard`: attention filtering across types,
  outstanding sum, `'mixed'` currency flag, recent-invoice ordering, per-type name
  normalization, empty inputs.
- `server/sanity/dashboard.test.ts` — `getDashboard` calls the right list functions and passes
  their output through `buildDashboard` (mock the seam, as the existing seam tests do).
- `packages/ui` — a `SegmentedControl.stories.tsx` (the package ships Storybook, not unit
  tests, so a story is the convention here; interaction correctness rides on Ark UI's
  `SegmentGroup`).
- Widgets are thin presentational compositions; no snapshot tests. Existing publish/discard and
  invoice-total logic is already covered and unchanged.

## Files touched

**packages/ui**

- `src/components/SegmentedControl/SegmentedControl.tsx` (new) + `index.ts`
- `src/components/index.ts` (export)
- `src/components/SegmentedControl/SegmentedControl.stories.tsx`

**apps/admin — new**

- `src/widgets/PageHeader/PageHeader.tsx`
- `src/widgets/EditorLayout/EditorLayout.tsx`
- `src/widgets/PublishingCard/PublishingCard.tsx`
- `src/widgets/InvoiceSummaryCard/InvoiceSummaryCard.tsx`
- `src/widgets/dashboard/DashboardHero.tsx`
- `src/widgets/dashboard/AttentionCard.tsx`
- `src/widgets/dashboard/BillingCard.tsx`
- `src/server/sanity/dashboard.ts` + `dashboard.test.ts`
- `src/server/functions/dashboard.ts`
- `src/features/dashboard/queries.ts`
- `src/shared/lib/dashboard.ts` + `dashboard.test.ts`

**apps/admin — changed**

- `src/widgets/NavShell/NavShell.tsx` (restyle + Studio/Dashboard group + counts + footer)
- `src/routes/__root.tsx` (drop the single `Card` wrapper)
- `src/routes/index.tsx` (dashboard)
- `src/routes/{projects,certifications,degrees,clients,invoices}/index.tsx` (PageHeader + card)
- `src/routes/{projects,certifications,degrees,clients}/$id.tsx`, `src/routes/about.tsx`,
  `src/routes/settings/business-profile.tsx`, `src/routes/invoices/$id.tsx` (EditorLayout)
- `src/widgets/DocumentToolbar/DocumentToolbar.tsx` (deleted; logic → `PublishingCard`)

## Deferred / notes

- Real-time hero copy is derived, not templated per the mockup's literal sample text.
- `business-profile` intentionally keeps its simpler direct-write rail (no publish workflow).
- Mobile: the sidebar keeps current behavior; a responsive collapse is out of scope here.
