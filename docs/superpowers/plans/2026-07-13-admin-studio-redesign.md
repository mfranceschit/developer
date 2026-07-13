# Admin Studio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the entire admin studio (`apps/admin`) to the `Admin Studio Redesign` mockup — sand nav, a real dashboard, header-led list pages, and two-column editors with a sticky right rail — using the existing `@mfranceschit/ui` design system.

**Architecture:** One new UI primitive (`SegmentedControl`) in `packages/ui`; a set of thin admin `widgets/` compositions (`PageHeader`, `EditorLayout`, `PublishingCard`, `InvoiceSummaryCard`, dashboard trio); one aggregation server function (`getDashboardFn`) behind the existing Sanity seam feeding a pure, tested `buildDashboard` helper; then a per-screen reflow of the nav, dashboard, all list pages, and all editors. No document shapes, seam contracts, form logic, or tokens change.

**Tech Stack:** TanStack Start/Router, React 19, react-hook-form + zod, TanStack Query, Ark UI, Tailwind v4 + `--mf-*` tokens, Vitest (jsdom), Storybook.

## Global Constraints

- **Design-system HARD rule:** all colors/primitives live in `packages/ui`. Admin `widgets/` are compositions of UI primitives + tokens + **layout-only** Tailwind (flex/grid/spacing). No raw hex/rgba, no new tokens — every token the mockup uses already exists.
- **Node/pnpm via fnm:** prefix every node/pnpm command with `fnm exec --` (e.g. `fnm exec -- pnpm typecheck`).
- **Never run lint/format** commands; write clean Biome-conforming code (single quotes, trailing commas `all`, 2-space indent, width 100, `import type`, external imports then blank line then `@/` imports).
- **Never run the dev server or `build`**; the gate for UI-only tasks is `fnm exec -- pnpm typecheck`.
- **Imports:** admin uses `@/` alias (never `../`); consume UI only from the `@mfranceschit/ui` barrel (never deep-import).
- **Do not edit** `routeTree.gen.ts` (generated, gitignored).
- **Git:** branch off `main` first (do not work on `main`); commit only on the user's go-ahead. Commit format `type(scope): description`, no `Co-Authored-By`, no "Generated with Claude Code" footer.
- **Preserve exactly:** every document shape (`shared/types.ts`, `shared/schemas.ts`), the draft/publish model, invoice numbering/locking/totals, `InvoiceDocument`, and the print route.

---

### Task 1: `SegmentedControl` primitive (`packages/ui`)

**Files:**
- Create: `packages/ui/src/components/SegmentedControl/SegmentedControl.tsx`
- Create: `packages/ui/src/components/SegmentedControl/index.ts`
- Create: `packages/ui/src/components/SegmentedControl/SegmentedControl.stories.tsx`
- Modify: `packages/ui/src/components/index.ts` (add re-export)

**Interfaces:**
- Produces: `SegmentedControl<T extends string>(props)`, `SegmentedControlProps<T>`, `SegmentedControlOption<T>`, `SegmentedControlSize`. Props: `{ options: { value: T; label: string }[]; value: T; onValueChange: (value: T) => void; size?: 'sm' | 'md'; 'aria-label'?: string; className?: string }`.
- Built on Ark UI `SegmentGroup` (v5.37.2, anatomy: `Root`, `Item`, `ItemText`, `ItemHiddenInput`). Active item carries `data-state="checked"`.

- [ ] **Step 1: Write the component**

`packages/ui/src/components/SegmentedControl/SegmentedControl.tsx`:

```tsx
import { SegmentGroup } from '@ark-ui/react';

export type SegmentedControlOption<T extends string> = { value: T; label: string };
export type SegmentedControlSize = 'sm' | 'md';

export type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  size?: SegmentedControlSize;
  'aria-label'?: string;
  className?: string;
};

const sizeClasses: Record<SegmentedControlSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-3.5 py-1.5 text-sm',
};

const itemClasses =
  'cursor-pointer rounded-[6px] font-sans font-medium text-[var(--text-muted)] ' +
  'transition-colors duration-[120ms] ' +
  'data-[state=checked]:bg-[var(--surface-card)] data-[state=checked]:font-semibold ' +
  'data-[state=checked]:text-[var(--text-strong)] data-[state=checked]:shadow-xs';

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = 'md',
  'aria-label': ariaLabel,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <SegmentGroup.Root
      value={value}
      onValueChange={(details) => {
        if (details.value) onValueChange(details.value as T);
      }}
      aria-label={ariaLabel}
      className={['inline-flex rounded-md bg-[var(--mf-gray-100)] p-0.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map((option) => (
        <SegmentGroup.Item
          key={option.value}
          value={option.value}
          className={[itemClasses, sizeClasses[size]].join(' ')}
        >
          <SegmentGroup.ItemText>{option.label}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  );
}
```

- [ ] **Step 2: Barrel the component**

`packages/ui/src/components/SegmentedControl/index.ts`:

```ts
export * from './SegmentedControl';
```

Add to `packages/ui/src/components/index.ts` (alphabetical, near `Select`):

```ts
export * from './SegmentedControl';
```

- [ ] **Step 3: Write the story**

`packages/ui/src/components/SegmentedControl/SegmentedControl.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
};
export default meta;

type Locale = 'en' | 'es' | 'pt';

export const Locales: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Locale>('en');
    return (
      <SegmentedControl<Locale>
        aria-label="Locale"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'en', label: 'EN' },
          { value: 'es', label: 'ES' },
          { value: 'pt', label: 'PT' },
        ]}
      />
    );
  },
};

export const Small: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Locale>('en');
    return (
      <SegmentedControl<Locale>
        size="sm"
        aria-label="Locale"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'en', label: 'EN' },
          { value: 'es', label: 'ES' },
          { value: 'pt', label: 'PT' },
        ]}
      />
    );
  },
};
```

- [ ] **Step 4: Typecheck**

Run: `cd packages/ui && fnm exec -- pnpm typecheck`
Expected: PASS (no errors).

- [ ] **Step 5: Verify active-segment styling in Storybook (manual)**

Run: `cd packages/ui && fnm exec -- pnpm storybook` and open `Components/SegmentedControl`.
Expected: the selected segment shows a white card background + shadow; clicking another segment moves the active style. If the active style does not apply, the Ark state attribute differs — adjust the `data-[state=checked]:` selector to match the rendered `data-state` value, then re-verify.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/SegmentedControl packages/ui/src/components/index.ts
git commit -m "feat(ui): add SegmentedControl primitive"
```

---

### Task 2: `buildDashboard` pure helper (`apps/admin`)

**Files:**
- Create: `apps/admin/src/shared/lib/dashboard.ts`
- Test: `apps/admin/src/shared/lib/dashboard.test.ts`

**Interfaces:**
- Consumes: `formatInvoiceNumber` from `@/shared/lib/format`; `DocumentStatus`, `Invoice` from `@/shared/types`.
- Produces: `buildDashboard(input: DashboardInput): DashboardData` and the exported types below. Later tasks (3, 8, 9) consume `DashboardData`, `AttentionItem`, `RecentInvoice`, `OutstandingTotal`, `AttentionType`.

- [ ] **Step 1: Write the failing test**

`apps/admin/src/shared/lib/dashboard.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildDashboard } from './dashboard';
import type { Invoice } from '@/shared/types';

function invoice(over: Partial<Invoice>): Invoice {
  return {
    _id: 'i1',
    _type: 'invoice',
    seq: 1,
    issuerSnapshot: { name: 'Me', email: 'me@x.com' },
    client: { _ref: 'c1', _type: 'reference' },
    clientSnapshot: { name: 'Acme', email: 'a@acme.com', currency: 'USD' },
    issueDate: '2026-01-01',
    currency: 'USD',
    lineItems: [],
    taxRate: 0,
    status: 'draft',
    totals: { subtotal: 0, vat: 0, total: 0 },
    ...over,
  } as Invoice;
}

describe('buildDashboard', () => {
  it('collects non-published docs across types with normalized names', () => {
    const data = buildDashboard({
      projects: [
        { _id: 'p1', _status: 'draft', name: 'Marea' },
        { _id: 'p2', _status: 'published', name: 'Live' },
      ],
      certifications: [{ _id: 'c1', _status: 'unpublished-changes', name: 'AWS' }],
      degrees: [{ _id: 'd1', _status: 'draft', name: { en: 'BSc CS' } }],
      clients: [{ _id: 'cl1', _status: 'published', name: 'Acme' }],
      invoices: [],
    });
    expect(data.attention).toEqual([
      { id: 'p1', type: 'project', typeLabel: 'Project', name: 'Marea', status: 'draft' },
      { id: 'c1', type: 'certification', typeLabel: 'Certificate', name: 'AWS', status: 'unpublished-changes' },
      { id: 'd1', type: 'degree', typeLabel: 'Degree', name: 'BSc CS', status: 'draft' },
    ]);
    expect(data.counts).toEqual({ projects: 2, certifications: 1, degrees: 1, clients: 1, invoices: 0 });
  });

  it('sums only sent invoices into the outstanding total', () => {
    const data = buildDashboard({
      projects: [], certifications: [], degrees: [], clients: [],
      invoices: [
        invoice({ _id: 'a', status: 'sent', currency: 'USD', totals: { subtotal: 100, vat: 0, total: 100 } }),
        invoice({ _id: 'b', status: 'paid', currency: 'USD', totals: { subtotal: 50, vat: 0, total: 50 } }),
        invoice({ _id: 'c', status: 'sent', currency: 'USD', totals: { subtotal: 25, vat: 0, total: 25 } }),
      ],
    });
    expect(data.outstandingTotal).toEqual({ amount: 125, currency: 'USD' });
  });

  it('flags mixed currencies and defaults empty to USD', () => {
    const mixed = buildDashboard({
      projects: [], certifications: [], degrees: [], clients: [],
      invoices: [
        invoice({ _id: 'a', status: 'sent', currency: 'USD', totals: { subtotal: 10, vat: 0, total: 10 } }),
        invoice({ _id: 'b', status: 'sent', currency: 'EUR', totals: { subtotal: 20, vat: 0, total: 20 } }),
      ],
    });
    expect(mixed.outstandingTotal).toEqual({ amount: 30, currency: 'mixed' });

    const empty = buildDashboard({
      projects: [], certifications: [], degrees: [], clients: [], invoices: [],
    });
    expect(empty.outstandingTotal).toEqual({ amount: 0, currency: 'USD' });
  });

  it('returns recent invoices newest-first, capped at 3, with formatted number', () => {
    const data = buildDashboard({
      projects: [], certifications: [], degrees: [], clients: [],
      invoices: [
        invoice({ _id: 'a', seq: 1, issueDate: '2026-01-01' }),
        invoice({ _id: 'b', seq: 2, issueDate: '2026-03-01' }),
        invoice({ _id: 'c', seq: 3, issueDate: '2026-02-01' }),
        invoice({ _id: 'd', seq: 4, issueDate: '2026-04-01' }),
      ],
    });
    expect(data.recentInvoices.map((r) => r.id)).toEqual(['d', 'b', 'c']);
    expect(data.recentInvoices[0].number).toBe('INV-2026-004');
    expect(data.recentInvoices[0].clientName).toBe('Acme');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/admin && fnm exec -- pnpm vitest run src/shared/lib/dashboard.test.ts`
Expected: FAIL with "Cannot find module './dashboard'" / `buildDashboard is not a function`.

- [ ] **Step 3: Implement the helper**

`apps/admin/src/shared/lib/dashboard.ts`:

```ts
import { formatInvoiceNumber } from '@/shared/lib/format';
import type { DocumentStatus, Invoice } from '@/shared/types';

export type AttentionType = 'project' | 'certification' | 'degree' | 'client';

export type AttentionItem = {
  id: string;
  type: AttentionType;
  typeLabel: string;
  name: string;
  status: DocumentStatus;
};

export type OutstandingTotal = { amount: number; currency: string | 'mixed' };

export type RecentInvoice = {
  id: string;
  number: string;
  clientName: string;
  total: number;
  currency: string;
  status: Invoice['status'];
  issueDate: string;
  dueDate?: string;
};

export type DashboardData = {
  attention: AttentionItem[];
  counts: {
    projects: number;
    certifications: number;
    degrees: number;
    clients: number;
    invoices: number;
  };
  outstandingTotal: OutstandingTotal;
  recentInvoices: RecentInvoice[];
};

type Statused<T> = T & { _id: string; _status: DocumentStatus };

export type DashboardInput = {
  projects: Array<Statused<{ name: string }>>;
  certifications: Array<Statused<{ name: string }>>;
  degrees: Array<Statused<{ name: { en: string } }>>;
  clients: Array<Statused<{ name: string }>>;
  invoices: Invoice[];
};

const TYPE_LABEL: Record<AttentionType, string> = {
  project: 'Project',
  certification: 'Certificate',
  degree: 'Degree',
  client: 'Client',
};

const RECENT_LIMIT = 3;

function collect<T extends { _id: string; _status: DocumentStatus }>(
  type: AttentionType,
  docs: T[],
  getName: (doc: T) => string,
): AttentionItem[] {
  return docs
    .filter((doc) => doc._status !== 'published')
    .map((doc) => ({
      id: doc._id,
      type,
      typeLabel: TYPE_LABEL[type],
      name: getName(doc),
      status: doc._status,
    }));
}

export function buildDashboard(input: DashboardInput): DashboardData {
  const attention: AttentionItem[] = [
    ...collect('project', input.projects, (d) => d.name),
    ...collect('certification', input.certifications, (d) => d.name),
    ...collect('degree', input.degrees, (d) => d.name.en),
    ...collect('client', input.clients, (d) => d.name),
  ];

  const sent = input.invoices.filter((i) => i.status === 'sent');
  const currencies = new Set(sent.map((i) => i.currency));
  const outstandingTotal: OutstandingTotal = {
    amount: sent.reduce((sum, i) => sum + i.totals.total, 0),
    currency: currencies.size > 1 ? 'mixed' : ([...currencies][0] ?? 'USD'),
  };

  const recentInvoices = [...input.invoices]
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    .slice(0, RECENT_LIMIT)
    .map((i) => ({
      id: i._id,
      number: formatInvoiceNumber(i),
      clientName: i.clientSnapshot.name,
      total: i.totals.total,
      currency: i.currency,
      status: i.status,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
    }));

  return {
    attention,
    counts: {
      projects: input.projects.length,
      certifications: input.certifications.length,
      degrees: input.degrees.length,
      clients: input.clients.length,
      invoices: input.invoices.length,
    },
    outstandingTotal,
    recentInvoices,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/admin && fnm exec -- pnpm vitest run src/shared/lib/dashboard.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/shared/lib/dashboard.ts apps/admin/src/shared/lib/dashboard.test.ts
git commit -m "feat(admin): add buildDashboard aggregation helper"
```

---

### Task 3: Dashboard seam + server function + query hook

**Files:**
- Create: `apps/admin/src/server/sanity/dashboard.ts`
- Test: `apps/admin/src/server/sanity/dashboard.test.ts`
- Create: `apps/admin/src/server/functions/dashboard.ts`
- Create: `apps/admin/src/features/dashboard/queries.ts`

**Interfaces:**
- Consumes: `listDocuments` from `@/server/sanity/queries`, `listInvoices` from `@/server/sanity/invoices`, `buildDashboard`/`DashboardData` from `@/shared/lib/dashboard`.
- Produces: `getDashboard(): Promise<DashboardData>`, `getDashboardFn` (GET server fn), `useDashboard()` (Query hook, key `['dashboard']`, returns `DashboardData`).

- [ ] **Step 1: Write the failing test**

`apps/admin/src/server/sanity/dashboard.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('./queries', () => ({ listDocuments: vi.fn() }));
vi.mock('./invoices', () => ({ listInvoices: vi.fn() }));

import { listDocuments } from './queries';
import { listInvoices } from './invoices';
import { getDashboard } from './dashboard';

describe('getDashboard', () => {
  it('aggregates the four draftable types and invoices', async () => {
    vi.mocked(listDocuments).mockImplementation(async (type: string) => {
      if (type === 'project') return [{ _id: 'p1', _status: 'draft', name: 'Marea' }] as never;
      return [] as never;
    });
    vi.mocked(listInvoices).mockResolvedValue([]);

    const data = await getDashboard();

    expect(vi.mocked(listDocuments).mock.calls.map((c) => c[0])).toEqual([
      'project',
      'certification',
      'degree',
      'client',
    ]);
    expect(listInvoices).toHaveBeenCalledTimes(1);
    expect(data.attention).toHaveLength(1);
    expect(data.attention[0]).toMatchObject({ id: 'p1', type: 'project', name: 'Marea' });
    expect(data.counts.projects).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/admin && fnm exec -- pnpm vitest run src/server/sanity/dashboard.test.ts`
Expected: FAIL with "Cannot find module './dashboard'".

- [ ] **Step 3: Implement the seam**

`apps/admin/src/server/sanity/dashboard.ts`:

```ts
import { buildDashboard, type DashboardData } from '@/shared/lib/dashboard';
import { listInvoices } from './invoices';
import { listDocuments } from './queries';

export async function getDashboard(): Promise<DashboardData> {
  const [projects, certifications, degrees, clients, invoices] = await Promise.all([
    listDocuments<{ name: string }>('project'),
    listDocuments<{ name: string }>('certification'),
    listDocuments<{ name: { en: string } }>('degree'),
    listDocuments<{ name: string }>('client'),
    listInvoices(),
  ]);
  return buildDashboard({ projects, certifications, degrees, clients, invoices });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/admin && fnm exec -- pnpm vitest run src/server/sanity/dashboard.test.ts`
Expected: PASS.

- [ ] **Step 5: Add the server function**

`apps/admin/src/server/functions/dashboard.ts`:

```ts
import { createServerFn } from '@tanstack/react-start';
import { getDashboard } from '@/server/sanity/dashboard';

export const getDashboardFn = createServerFn({ method: 'GET', strict: { output: false } }).handler(
  async () => getDashboard(),
);
```

- [ ] **Step 6: Add the query hook**

`apps/admin/src/features/dashboard/queries.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { getDashboardFn } from '@/server/functions/dashboard';
import type { DashboardData } from '@/shared/lib/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardFn() as Promise<DashboardData>,
  });
}
```

- [ ] **Step 7: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/server/sanity/dashboard.ts apps/admin/src/server/sanity/dashboard.test.ts \
  apps/admin/src/server/functions/dashboard.ts apps/admin/src/features/dashboard/queries.ts
git commit -m "feat(admin): add dashboard aggregation server function"
```

---

### Task 4: `PageHeader` widget

**Files:**
- Create: `apps/admin/src/widgets/PageHeader/PageHeader.tsx`

**Interfaces:**
- Produces: `PageHeader(props)`, `PageHeaderProps = { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode; backLink?: { label: string; onClick: () => void } }`. Consumed by every list page (Task 10) and `EditorLayout` (Task 5).

- [ ] **Step 1: Write the widget**

`apps/admin/src/widgets/PageHeader/PageHeader.tsx`:

```tsx
import type { ReactNode } from 'react';

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backLink?: { label: string; onClick: () => void };
};

export function PageHeader({ eyebrow, title, subtitle, action, backLink }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      {backLink && (
        <button
          type="button"
          onClick={backLink.onClick}
          className="mb-2 inline-flex w-fit items-center gap-1.5 font-sans text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-accent)]"
        >
          ← {backLink.label}
        </button>
      )}
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <div className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {eyebrow}
            </div>
          )}
          <h1 className="mt-2 font-sans text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 font-sans text-sm text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/widgets/PageHeader
git commit -m "feat(admin): add PageHeader widget"
```

---

### Task 5: `EditorLayout` widget

**Files:**
- Create: `apps/admin/src/widgets/EditorLayout/EditorLayout.tsx`

**Interfaces:**
- Consumes: `PageHeader` (Task 4).
- Produces: `EditorLayout(props)`, `EditorLayoutProps = { header: { eyebrow: string; title: string; backLink: { label: string; onClick: () => void } }; children: ReactNode; aside: ReactNode }`. `children` = main column; `aside` = sticky right rail. Consumed by all editor tasks (11-17).

- [ ] **Step 1: Write the widget**

`apps/admin/src/widgets/EditorLayout/EditorLayout.tsx`:

```tsx
import type { ReactNode } from 'react';
import { PageHeader } from '@/widgets/PageHeader/PageHeader';

export type EditorLayoutProps = {
  header: {
    eyebrow: string;
    title: string;
    backLink: { label: string; onClick: () => void };
  };
  children: ReactNode;
  aside: ReactNode;
};

export function EditorLayout({ header, children, aside }: EditorLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={header.eyebrow} title={header.title} backLink={header.backLink} />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
        <div className="flex flex-col gap-5 lg:sticky lg:top-6">{aside}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/widgets/EditorLayout
git commit -m "feat(admin): add EditorLayout widget"
```

---

### Task 6: `PublishingCard` widget (absorbs `DocumentToolbar`)

**Files:**
- Create: `apps/admin/src/widgets/PublishingCard/PublishingCard.tsx`

**Interfaces:**
- Consumes: `Badge`, `BadgeTone`, `Button`, `Card`, `Dialog`, `createToaster` from `@mfranceschit/ui`; `DocumentStatus` from `@/shared/types`.
- Produces: `PublishingCard(props)`, `PublishingCardProps` (below). Consumed by content editors (Tasks 11-15). `DocumentToolbar` is deleted in Task 17 after all editors migrate.

- [ ] **Step 1: Write the widget**

`apps/admin/src/widgets/PublishingCard/PublishingCard.tsx`:

```tsx
import { Badge, type BadgeTone, Button, Card, Dialog, type createToaster } from '@mfranceschit/ui';
import { useState } from 'react';
import type { DocumentStatus } from '@/shared/types';

export type PublishingCardProps = {
  status: DocumentStatus;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
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
  'unpublished-changes': 'Changed',
};

export function PublishingCard({
  status,
  dirty,
  saving,
  onSave,
  onPublish,
  onDiscard,
  toaster,
}: PublishingCardProps) {
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

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
      setDiscardDialogOpen(false);
    }
  }

  return (
    <Card padding="20px 24px" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Publishing</h2>
        <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      </div>
      <div className="flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3.5">
        <Button fullWidth onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save draft'}
        </Button>
        <Button
          variant="outline"
          fullWidth
          onClick={handlePublish}
          disabled={publishing || (status === 'published' && !dirty)}
        >
          {publishing ? 'Publishing…' : 'Publish'}
        </Button>
        <Dialog
          open={discardDialogOpen}
          onOpenChange={setDiscardDialogOpen}
          title="Discard draft?"
          description="This will permanently delete your unpublished changes."
          trigger={
            <button
              type="button"
              disabled={status === 'published'}
              className="self-center p-1 font-sans text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Discard draft
            </button>
          }
        >
          <Button variant="accent" size="sm" onClick={handleDiscard} disabled={discarding}>
            {discarding ? 'Discarding…' : 'Confirm discard'}
          </Button>
        </Dialog>
      </div>
      <p className="font-sans text-xs leading-relaxed text-[var(--text-muted)]">
        Publishing replaces the live document on the portfolio.
      </p>
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/widgets/PublishingCard
git commit -m "feat(admin): add PublishingCard widget"
```

---

### Task 7: `InvoiceSummaryCard` widget

**Files:**
- Create: `apps/admin/src/widgets/InvoiceSummaryCard/InvoiceSummaryCard.tsx`

**Interfaces:**
- Consumes: `Button`, `Card` from `@mfranceschit/ui`; `InvoiceStatus` from `@/shared/types`; `formatMoney` from `@/shared/lib/format`.
- Produces: `InvoiceSummaryCard(props)`, `InvoiceSummaryCardProps` (below). Consumed by the invoice editor (Task 17).

- [ ] **Step 1: Write the widget**

`apps/admin/src/widgets/InvoiceSummaryCard/InvoiceSummaryCard.tsx`:

```tsx
import { Button, Card } from '@mfranceschit/ui';
import { formatMoney } from '@/shared/lib/format';
import type { InvoiceStatus } from '@/shared/types';

export type InvoiceSummaryCardProps = {
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  vat: number;
  total: number;
  taxRate: number;
  locked: boolean;
  saving: boolean;
  onSave: () => void;
  onMarkSent: () => void;
  issuer?: { name: string; email: string; taxId?: string };
  onEditIssuer: () => void;
};

const STEPS: InvoiceStatus[] = ['draft', 'sent', 'paid'];
const STEP_LABEL: Record<InvoiceStatus, string> = { draft: 'Draft', sent: 'Sent', paid: 'Paid' };

export function InvoiceSummaryCard({
  status,
  currency,
  subtotal,
  vat,
  total,
  taxRate,
  locked,
  saving,
  onSave,
  onMarkSent,
  issuer,
  onEditIssuer,
}: InvoiceSummaryCardProps) {
  const activeIndex = STEPS.indexOf(status);
  return (
    <>
      <Card padding="20px 24px" className="flex flex-col gap-4">
        <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Summary</h2>
        <div className="flex items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background:
                      i <= activeIndex ? 'var(--mf-very-berry)' : 'var(--mf-gray-300)',
                  }}
                />
                <span
                  className="font-sans text-[13px]"
                  style={{
                    color: i <= activeIndex ? 'var(--text-strong)' : 'var(--text-muted)',
                    fontWeight: i === activeIndex ? 600 : 400,
                  }}
                >
                  {STEP_LABEL[step]}
                </span>
              </div>
              {i < STEPS.length - 1 && <span className="text-[var(--mf-gray-300)]">→</span>}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3">
          <div className="flex justify-between font-sans text-sm text-[var(--text-body)]">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between font-sans text-sm text-[var(--text-body)]">
            <span>VAT ({taxRate}%)</span>
            <span>{formatMoney(vat, currency)}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-2.5">
            <span className="font-sans text-sm font-semibold text-[var(--text-strong)]">Total</span>
            <span className="font-sans text-[22px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
              {formatMoney(total, currency)}
            </span>
          </div>
        </div>
        {!locked && (
          <div className="flex flex-col gap-2">
            <Button fullWidth onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
            <Button variant="outline" fullWidth onClick={onMarkSent}>
              Mark as sent
            </Button>
          </div>
        )}
        <p className="font-sans text-xs leading-relaxed text-[var(--text-muted)]">
          Once marked as sent, line items and totals lock permanently.
        </p>
      </Card>
      {issuer && (
        <Card
          interactive
          hoverLift={false}
          onClick={onEditIssuer}
          padding="16px 20px"
          className="!border-[var(--mf-sand-200)] !bg-[var(--mf-sand-50)]"
        >
          <div className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mf-bark)]">
            Issuer
          </div>
          <div className="mt-1.5 font-sans text-sm font-medium text-[var(--text-strong)]">
            {issuer.name}
          </div>
          <div className="mt-0.5 font-sans text-[13px] text-[var(--text-muted)]">
            {issuer.email}
            {issuer.taxId ? ` · ${issuer.taxId}` : ''}
          </div>
        </Card>
      )}
    </>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/widgets/InvoiceSummaryCard
git commit -m "feat(admin): add InvoiceSummaryCard widget"
```

---

### Task 8: Dashboard widgets (`DashboardHero`, `AttentionCard`, `BillingCard`)

**Files:**
- Create: `apps/admin/src/widgets/dashboard/DashboardHero.tsx`
- Create: `apps/admin/src/widgets/dashboard/AttentionCard.tsx`
- Create: `apps/admin/src/widgets/dashboard/BillingCard.tsx`

**Interfaces:**
- Consumes: `Badge`, `BadgeTone`, `Button`, `Card` from `@mfranceschit/ui`; `AttentionItem`, `RecentInvoice`, `OutstandingTotal` from `@/shared/lib/dashboard`; `formatMoney` from `@/shared/lib/format`; `DocumentStatus`, `InvoiceStatus` from `@/shared/types`.
- Produces: `DashboardHero`, `AttentionCard`, `BillingCard`. Consumed by the dashboard route (Task 9).
- Monogram asset: `apps/admin/public/` — verify a monogram SVG exists (Step 1). The hero references `/monogram-beige.svg`.

- [ ] **Step 1: Confirm the monogram asset**

Run: `ls apps/admin/public`
If a beige/light monogram SVG exists, use its filename in `DashboardHero`. If none exists, omit the `<img>` watermark line from `DashboardHero` (the gradient alone is acceptable) rather than referencing a missing file.

- [ ] **Step 2: Write `DashboardHero`**

`apps/admin/src/widgets/dashboard/DashboardHero.tsx`:

```tsx
import { Button } from '@mfranceschit/ui';

export type DashboardHeroProps = {
  summary: string;
  onNewProject: () => void;
  onNewInvoice: () => void;
  onEditAbout: () => void;
};

export function DashboardHero({
  summary,
  onNewProject,
  onNewInvoice,
  onEditAbout,
}: DashboardHeroProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl px-10 py-9 text-white"
      style={{
        background: 'linear-gradient(135deg, var(--mf-blue-700) 0%, var(--mf-blue-900) 100%)',
      }}
    >
      <div className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mf-sand)]">
        mfranceschit · studio
      </div>
      <h1 className="mb-1.5 mt-2.5 font-sans text-[30px] font-bold tracking-[-0.015em] text-white">
        Welcome back, Marco
      </h1>
      <p className="m-0 max-w-[520px] font-sans text-[15px] text-white/80">{summary}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="accent" size="sm" onClick={onNewProject}>
          New project
        </Button>
        <Button variant="glass" size="sm" onClick={onNewInvoice}>
          New invoice
        </Button>
        <Button variant="glass" size="sm" onClick={onEditAbout}>
          Edit about
        </Button>
      </div>
    </div>
  );
}
```

If Step 1 found a monogram, add — as the first child of the outer `div` — the watermark:

```tsx
      <img
        src="/monogram-beige.svg"
        alt=""
        className="pointer-events-none absolute right-[-30px] top-1/2 h-[220px] -translate-y-1/2 opacity-[0.14]"
      />
```

- [ ] **Step 3: Write `AttentionCard`**

`apps/admin/src/widgets/dashboard/AttentionCard.tsx`:

```tsx
import { Badge, type BadgeTone, Card } from '@mfranceschit/ui';
import type { AttentionItem } from '@/shared/lib/dashboard';
import type { DocumentStatus } from '@/shared/types';

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

const STATUS_LABEL: Record<DocumentStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  'unpublished-changes': 'Changed',
};

export type AttentionCardProps = {
  items: AttentionItem[];
  onOpen: (item: AttentionItem) => void;
};

export function AttentionCard({ items, onOpen }: AttentionCardProps) {
  return (
    <Card padding="0">
      <div className="flex items-baseline justify-between px-6 pt-5">
        <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
          Needs attention
        </h2>
        <span className="font-sans text-[13px] text-[var(--text-muted)]">
          {items.length} documents
        </span>
      </div>
      <div className="flex flex-col p-2 pt-3">
        {items.length === 0 && (
          <div className="px-4 py-6 text-center font-sans text-sm text-[var(--text-muted)]">
            All caught up.
          </div>
        )}
        {items.map((item) => (
          <button
            key={`${item.type}:${item.id}`}
            type="button"
            onClick={() => onOpen(item)}
            className="flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-left transition-colors hover:bg-[var(--mf-blue-50)]"
          >
            <div className="min-w-0">
              <div className="truncate font-sans text-sm font-medium text-[var(--text-strong)]">
                {item.name}
              </div>
              <div className="mt-px font-sans text-xs text-[var(--text-muted)]">
                {item.typeLabel}
              </div>
            </div>
            <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
          </button>
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 4: Write `BillingCard`**

`apps/admin/src/widgets/dashboard/BillingCard.tsx`:

```tsx
import { Badge, type BadgeTone, Card } from '@mfranceschit/ui';
import { formatMoney } from '@/shared/lib/format';
import type { OutstandingTotal, RecentInvoice } from '@/shared/lib/dashboard';
import type { InvoiceStatus } from '@/shared/types';

const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'blue',
  paid: 'blue',
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
};

export type BillingCardProps = {
  outstanding: OutstandingTotal;
  invoices: RecentInvoice[];
  onOpen: (invoice: RecentInvoice) => void;
  onViewAll: () => void;
};

export function BillingCard({ outstanding, invoices, onOpen, onViewAll }: BillingCardProps) {
  const outstandingLabel =
    outstanding.currency === 'mixed'
      ? `${outstanding.amount.toLocaleString('en-US')} (mixed)`
      : formatMoney(outstanding.amount, outstanding.currency);

  return (
    <Card padding="0">
      <div className="flex items-baseline justify-between px-6 pt-5">
        <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Billing</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="font-sans text-[13px] text-[var(--text-link)] transition-colors hover:text-[var(--text-accent)]"
        >
          All invoices →
        </button>
      </div>
      <div className="px-6 pt-4">
        <div className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Outstanding
        </div>
        <div className="mt-1 font-sans text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
          {outstandingLabel}
        </div>
      </div>
      <div className="flex flex-col p-2 pt-3">
        {invoices.map((inv) => (
          <button
            key={inv.id}
            type="button"
            onClick={() => onOpen(inv)}
            className="flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-left transition-colors hover:bg-[var(--mf-blue-50)]"
          >
            <div>
              <div className="font-sans text-sm font-medium text-[var(--text-strong)]">
                {inv.number}
              </div>
              <div className="mt-px font-sans text-xs text-[var(--text-muted)]">
                {inv.clientName}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm font-medium text-[var(--text-body)]">
                {formatMoney(inv.total, inv.currency)}
              </span>
              <Badge tone={STATUS_TONE[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/widgets/dashboard
git commit -m "feat(admin): add dashboard widgets"
```

---

### Task 9: NavShell restyle + root shell + dashboard route

**Files:**
- Modify: `apps/admin/src/widgets/NavShell/NavShell.tsx` (full rewrite)
- Modify: `apps/admin/src/routes/index.tsx` (full rewrite)

**Interfaces:**
- Consumes: `useDashboard` (Task 3), `DashboardHero`/`AttentionCard`/`BillingCard` (Task 8), `Logo` from `@mfranceschit/ui`, `Link`/`useNavigate`/`useRouterState` from `@tanstack/react-router`, `AttentionType` from `@/shared/lib/dashboard`.
- Note: NavShell no longer wraps children in a `Card`; each route now owns its surfaces inside the centered container that `<main>` provides.

- [ ] **Step 1: Rewrite `NavShell`**

`apps/admin/src/widgets/NavShell/NavShell.tsx`:

```tsx
import { Logo } from '@mfranceschit/ui';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useDashboard } from '@/features/dashboard/queries';

type CountKey = 'projects' | 'certifications' | 'degrees' | 'clients' | 'invoices';

type NavLink = { to: string; label: string; countKey?: CountKey };
type NavGroup = { label: string; links: NavLink[] };

const NAV_GROUPS: NavGroup[] = [
  { label: 'Studio', links: [{ to: '/', label: 'Dashboard' }] },
  {
    label: 'Certifications',
    links: [
      { to: '/degrees', label: 'Degrees', countKey: 'degrees' },
      { to: '/certifications', label: 'Certificates', countKey: 'certifications' },
    ],
  },
  { label: 'Work', links: [{ to: '/projects', label: 'Projects', countKey: 'projects' }] },
  { label: 'Site', links: [{ to: '/about', label: 'About' }] },
  {
    label: 'Billing',
    links: [
      { to: '/clients', label: 'Clients', countKey: 'clients' },
      { to: '/invoices', label: 'Invoices', countKey: 'invoices' },
      { to: '/settings/business-profile', label: 'Business Profile' },
    ],
  },
];

const linkBase =
  'flex items-center justify-between rounded-lg border border-transparent px-2.5 py-2 ' +
  'font-sans text-sm text-[var(--mf-gray-600)] transition-colors hover:bg-white/75';
const linkActive =
  'border-[var(--border-subtle)] bg-[var(--surface-card)] font-semibold ' +
  'text-[var(--text-strong)] shadow-xs';

export function NavShell({ children }: { children: ReactNode }) {
  const { data } = useDashboard();
  const counts = data?.counts;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[264px] shrink-0 flex-col overflow-y-auto border-r border-[var(--mf-sand-200)] bg-[var(--mf-sand-50)] px-5 pb-5 pt-7 print:hidden">
        <div className="px-2">
          <Logo variant="navy" height={34} />
        </div>
        <nav className="mt-8 flex flex-col gap-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-1.5 px-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mf-gray-500)]">
                {group.label}
              </div>
              <div className="flex flex-col gap-0.5">
                {group.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    activeOptions={{ exact: link.to === '/' }}
                    className={linkBase}
                    activeProps={{ className: linkActive }}
                  >
                    <span>{link.label}</span>
                    {link.countKey && counts && (
                      <span className="font-sans text-xs text-[var(--mf-gray-400)]">
                        {counts[link.countKey]}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto border-t border-[var(--mf-sand-200)] px-2 pt-5">
          <a
            href="https://mfranceschit.com"
            className="font-sans text-[13px] text-[var(--mf-gray-500)]"
          >
            mfranceschit.com ↗
          </a>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-[var(--surface-page)]">
        <div className="mx-auto max-w-[1100px] px-12 pb-16 pt-10">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite the dashboard route**

`apps/admin/src/routes/index.tsx`:

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDashboard } from '@/features/dashboard/queries';
import type { AttentionType } from '@/shared/lib/dashboard';
import { AttentionCard } from '@/widgets/dashboard/AttentionCard';
import { BillingCard } from '@/widgets/dashboard/BillingCard';
import { DashboardHero } from '@/widgets/dashboard/DashboardHero';

export const Route = createFileRoute('/')({
  component: HomePage,
});

const EDITOR_ROUTE: Record<AttentionType, string> = {
  project: '/projects/$id',
  certification: '/certifications/$id',
  degree: '/degrees/$id',
  client: '/clients/$id',
};

function summarize(draftCount: number, outstandingSent: number): string {
  const drafts =
    draftCount === 0
      ? 'Everything is published'
      : `${draftCount} document${draftCount === 1 ? '' : 's'} need${draftCount === 1 ? 's' : ''} attention`;
  const bills =
    outstandingSent === 0
      ? 'no invoices are outstanding'
      : `${outstandingSent} invoice${outstandingSent === 1 ? ' is' : 's are'} out for payment`;
  return `${drafts} and ${bills}.`;
}

function HomePage() {
  const { data, isLoading } = useDashboard();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return <p className="font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  const outstandingSentCount = data.recentInvoices.filter((i) => i.status === 'sent').length;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        summary={summarize(data.attention.length, outstandingSentCount)}
        onNewProject={() => navigate({ to: '/projects/$id', params: { id: 'new' } })}
        onNewInvoice={() => navigate({ to: '/invoices/$id', params: { id: 'new' } })}
        onEditAbout={() => navigate({ to: '/about' })}
      />
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <AttentionCard
          items={data.attention}
          onOpen={(item) =>
            navigate({ to: EDITOR_ROUTE[item.type], params: { id: item.id } })
          }
        />
        <BillingCard
          outstanding={data.outstandingTotal}
          invoices={data.recentInvoices}
          onOpen={(inv) => navigate({ to: '/invoices/$id', params: { id: inv.id } })}
          onViewAll={() => navigate({ to: '/invoices' })}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS. (If `Button variant="glass"` warns in the hero context, it is a valid variant per `Button.tsx` — no change needed.)

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/widgets/NavShell/NavShell.tsx apps/admin/src/routes/index.tsx
git commit -m "feat(admin): redesign nav shell and dashboard"
```

---

### Task 10: List pages reflow (projects, certifications, degrees, clients, invoices)

**Files:**
- Modify: `apps/admin/src/routes/projects/index.tsx`
- Modify: `apps/admin/src/routes/certifications/index.tsx`
- Modify: `apps/admin/src/routes/degrees/index.tsx`
- Modify: `apps/admin/src/routes/clients/index.tsx`
- Modify: `apps/admin/src/routes/invoices/index.tsx`

**Interfaces:**
- Consumes: `PageHeader` (Task 4), `Card`, `Table`, `Badge` from `@mfranceschit/ui`.
- Pattern: replace the old `<div className="p-6">` + `h1` + bare `Table` with `PageHeader` (eyebrow/title/subtitle + `New …` action) followed by `<Card padding="0" className="overflow-hidden">` wrapping the existing `Table`, and (invoices only) a footer summary row.

- [ ] **Step 1: Read each current list route**

Run: `sed -n '1,60p' apps/admin/src/routes/certifications/index.tsx apps/admin/src/routes/degrees/index.tsx apps/admin/src/routes/clients/index.tsx apps/admin/src/routes/invoices/index.tsx`
Note each file's existing query hook, columns, row-click target, and `Table` type parameter — all of that is preserved; only the surrounding header/card wrapper changes.

- [ ] **Step 2: Rewrite `projects/index.tsx`**

Replace the `ProjectsListPage` component body (keep the imports for `Badge`, `BadgeTone`, `Table`, the route/hook imports, and `STATUS_TONE`; add `PageHeader`, `Card`; drop the standalone `Button` import only if unused — it is used in the action, so keep it):

```tsx
import { Badge, type BadgeTone, Button, Card, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '@/features/content/queries';
import type { DocumentStatus, Project } from '@/shared/types';
import { PageHeader } from '@/widgets/PageHeader/PageHeader';

export const Route = createFileRoute('/projects/')({
  component: ProjectsListPage,
});

type ProjectRow = Project & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

const STATUS_LABEL: Record<DocumentStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  'unpublished-changes': 'Changed',
};

function ProjectsListPage() {
  const { data, isLoading } = useDocumentList<ProjectRow>('project');
  const navigate = useNavigate();
  const rows = data ?? [];
  const published = rows.filter((r) => r._status === 'published').length;
  const pending = rows.length - published;

  if (isLoading) {
    return <p className="font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Work"
        title="Projects"
        subtitle={`${rows.length} projects · ${published} published · ${pending} with pending changes`}
        action={
          <Button onClick={() => navigate({ to: '/projects/$id', params: { id: 'new' } })}>
            New project
          </Button>
        }
      />
      <Card padding="0" className="overflow-hidden">
        <Table<ProjectRow>
          rows={rows}
          getRowKey={(row) => row._id}
          onRowClick={(row) => navigate({ to: '/projects/$id', params: { id: row._id } })}
          columns={[
            { header: 'Name', render: (row) => row.name },
            { header: 'Technologies', render: (row) => row.technologies.join(', ') },
            {
              header: 'Status',
              align: 'right',
              render: (row) => <Badge tone={STATUS_TONE[row._status]}>{STATUS_LABEL[row._status]}</Badge>,
            },
          ]}
        />
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite `certifications/index.tsx`**

Apply the same shape. Header: `eyebrow="Certifications"`, `title="Certificates"`, subtitle `` `${rows.length} certificates · ${published} published · ${pending} with pending changes` ``, action `New certificate` → `/certifications/$id` id `new`. Keep the file's existing `Table` columns (Name, Date, Status), its `useDocumentList<...>('certification')` hook, and row-click to `/certifications/$id`. Wrap the `Table` in `<Card padding="0" className="overflow-hidden">`. Add `STATUS_LABEL` (as above) and render `<Badge tone={STATUS_TONE[row._status]}>{STATUS_LABEL[row._status]}</Badge>` for the status column. Import `Button`, `Card`, `PageHeader`.

- [ ] **Step 4: Rewrite `degrees/index.tsx`**

Same shape. Header: `eyebrow="Certifications"`, `title="Degrees"`, subtitle `` `${rows.length} degrees · ${published} published · ${draft} draft` `` where `draft = rows.filter((r) => r._status !== 'published').length`, action `New degree` → `/degrees/$id` id `new`. Preserve existing columns (Name, Issued by, Status), the `useDocumentList<...>('degree')` hook, and row-click target. Wrap `Table` in the `Card`. Use `STATUS_LABEL` for the badge text.

- [ ] **Step 5: Rewrite `clients/index.tsx`**

Same shape. Header: `eyebrow="Billing"`, `title="Clients"`, subtitle `` `${rows.length} clients` ``, action `New client` → `/clients/$id` id `new`. Preserve existing columns (Name, Email, Currency, Status), hook, and row-click. Wrap `Table` in the `Card`. Use `STATUS_LABEL` for the badge.

- [ ] **Step 6: Rewrite `invoices/index.tsx`**

Same shape, plus a footer summary row. Header: `eyebrow="Billing"`, `title="Invoices"`, subtitle `` `${rows.length} invoices` ``, action `New invoice` → `/invoices/$id` id `new`. Preserve the existing invoice columns, hook (`useInvoiceList`), and row-click. Wrap `Table` in `<Card padding="0" className="overflow-hidden">` and, **after** the `Table` but inside the `Card`, add a footer showing outstanding, using the existing status/total fields:

```tsx
        <div className="border-t border-[var(--border-subtle)] bg-[var(--mf-gray-50)] px-6 py-3 font-sans text-[13px] text-[var(--text-muted)]">
          {sentCount === 0
            ? 'No outstanding invoices'
            : `${formatMoney(outstanding, outstandingCurrency)} outstanding across ${sentCount} sent invoice${sentCount === 1 ? '' : 's'}`}
        </div>
```

Compute above the return, from the loaded rows:

```tsx
  const sent = rows.filter((i) => i.status === 'sent');
  const sentCount = sent.length;
  const outstanding = sent.reduce((sum, i) => sum + i.totals.total, 0);
  const outstandingCurrency = sent[0]?.currency ?? 'USD';
```

Import `formatMoney` from `@/shared/lib/format`. (If invoices use multiple currencies the footer shows the first currency's symbol — acceptable for the single-user footer; the dashboard already flags `mixed`.)

- [ ] **Step 7: Typecheck**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/routes/projects/index.tsx apps/admin/src/routes/certifications/index.tsx \
  apps/admin/src/routes/degrees/index.tsx apps/admin/src/routes/clients/index.tsx \
  apps/admin/src/routes/invoices/index.tsx
git commit -m "feat(admin): redesign list pages with PageHeader"
```

---

### Task 11: Project editor reflow

**Files:**
- Modify: `apps/admin/src/routes/projects/$id.tsx`

**Interfaces:**
- Consumes: `EditorLayout` (Task 5), `PublishingCard` (Task 6), `SegmentedControl` (Task 1), `Card` from `@mfranceschit/ui`.
- Preserve unchanged: `formSchema`, `toFormValues`, `ProjectFormValues`, `PortableTextValue`, `onSubmit`, `handleUpload`, `useForm`/`useDocument`/mutation setup. Only the `return` markup and imports change. Replace the `Tabs`-based description switcher with `SegmentedControl` + a single controlled `RichTextEditor` per active locale.

- [ ] **Step 1: Update imports**

Replace the `@mfranceschit/ui` import and add widget imports; remove `Tabs`, add `Card`, `SegmentedControl`, `useState` (already imported), `EditorLayout`, `PublishingCard`:

```tsx
import {
  Button,
  Card,
  FormField,
  ImageUploader,
  Input,
  RichTextEditor,
  type RichTextEditorProps,
  SegmentedControl,
} from '@mfranceschit/ui';
```

And after the existing `@/` imports:

```tsx
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';
import { PublishingCard } from '@/widgets/PublishingCard/PublishingCard';
```

Remove the `DocumentToolbar` import.

- [ ] **Step 2: Add a locale-tab state and derived save state**

Inside `ProjectEditPage`, after the `useForm(...)` block, add:

```tsx
  const [descLocale, setDescLocale] = useState<'en' | 'es' | 'pt'>('en');
  const saving = createDraft.isPending || patchDraft.isPending;
```

- [ ] **Step 3: Replace the `return` markup**

```tsx
  return (
    <EditorLayout
      header={{
        eyebrow: 'Work · Project',
        title: isNew ? 'New project' : (project?.name ?? 'Project'),
        backLink: { label: 'Projects', onClick: () => navigate({ to: '/projects' }) },
      }}
      aside={
        isNew ? null : (
          <PublishingCard
            status={project?._status ?? 'draft'}
            dirty={isDirty}
            saving={saving}
            onSave={handleSubmit(onSubmit)}
            onPublish={async () => {
              await publish.mutateAsync({ id });
            }}
            onDiscard={async () => {
              await discard.mutateAsync({ id });
            }}
            toaster={toaster}
          />
        )
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Slug" required error={errors.slug?.message}>
              <Input {...register('slug')} />
            </FormField>
            <FormField label="URL" error={errors.url?.message}>
              <Input {...register('url')} />
            </FormField>
            <FormField label="Repository" error={errors.repository?.message}>
              <Input {...register('repository')} />
            </FormField>
          </div>
          <FormField label="Technologies" hint="Comma-separated" error={errors.technologies?.message}>
            <Input {...register('technologies')} />
          </FormField>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Media</h2>
          <FormField label="Image">
            <Controller
              control={control}
              name="imageAlt"
              render={({ field }) => (
                <ImageUploader
                  imageUrl={
                    project?.image.asset._ref ? sanityImageUrl(project.image.asset._ref) : undefined
                  }
                  alt={field.value}
                  onAltChange={field.onChange}
                  onUpload={handleUpload}
                />
              )}
            />
          </FormField>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
              Description
            </h2>
            <SegmentedControl
              size="sm"
              aria-label="Description locale"
              value={descLocale}
              onValueChange={setDescLocale}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
                { value: 'pt', label: 'PT' },
              ]}
            />
          </div>
          {descLocale === 'en' && (
            <Controller
              control={control}
              name="descriptionEn"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {descLocale === 'es' && (
            <Controller
              control={control}
              name="descriptionEs"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {descLocale === 'pt' && (
            <Controller
              control={control}
              name="descriptionPt"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {isNew && (
            <Button type="submit" className="self-start">
              Save draft
            </Button>
          )}
        </Card>
      </form>
    </EditorLayout>
  );
```

Note: the `form` uses `className="contents"` so the grid columns from `EditorLayout` are unaffected; `PublishingCard`'s `onSave` calls the same `handleSubmit(onSubmit)`. For a new (unsaved) doc there is no rail, so a `Save draft` submit button appears in the main column.

- [ ] **Step 4: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/routes/projects/\$id.tsx
git commit -m "feat(admin): reflow project editor into EditorLayout"
```

---

### Task 12: Certification editor reflow

**Files:**
- Modify: `apps/admin/src/routes/certifications/$id.tsx`

**Interfaces:** Consumes `EditorLayout`, `PublishingCard`, `SegmentedControl`, `Card`. Preserve `formSchema`, `toFormValues`, `onSubmit`, `handleUpload`, `useWatch` issued values, all hooks. The `issued` locale field switches from `LocaleField` to `SegmentedControl` + a single `Input` bound to the active locale.

- [ ] **Step 1: Update imports**

```tsx
import {
  Button,
  Card,
  DatePicker,
  FormField,
  ImageUploader,
  Input,
  SegmentedControl,
} from '@mfranceschit/ui';
```

Add after `@/` imports: `EditorLayout`, `PublishingCard`; remove the `DocumentToolbar` and `LocaleField` imports.

- [ ] **Step 2: Add locale state + save flag**

After `useWatch(...)` add:

```tsx
  const [issuedLocale, setIssuedLocale] = useState<'en' | 'es' | 'pt'>('en');
  const saving = createDraft.isPending || patchDraft.isPending;
  const issuedValues = { en: issuedEn, es: issuedEs, pt: issuedPt };
  const issuedFields = { en: 'issuedEn', es: 'issuedEs', pt: 'issuedPt' } as const;
```

- [ ] **Step 3: Replace the `return`**

```tsx
  return (
    <EditorLayout
      header={{
        eyebrow: 'Certifications · Certificate',
        title: isNew ? 'New certificate' : (certification?.name ?? 'Certificate'),
        backLink: { label: 'Certificates', onClick: () => navigate({ to: '/certifications' }) },
      }}
      aside={
        isNew ? null : (
          <PublishingCard
            status={certification?._status ?? 'draft'}
            dirty={isDirty}
            saving={saving}
            onSave={handleSubmit(onSubmit)}
            onPublish={async () => {
              await publish.mutateAsync({ id });
            }}
            onDiscard={async () => {
              await discard.mutateAsync({ id });
            }}
            toaster={toaster}
          />
        )
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Details</h2>
          <FormField label="Name" required error={errors.name?.message}>
            <Input {...register('name')} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Date" required error={errors.date?.message}>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker value={field.value} onValueChange={field.onChange} />
                )}
              />
            </FormField>
            <FormField label="Credential URL" error={errors.url?.message}>
              <Input {...register('url')} />
            </FormField>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-medium text-[var(--text-body)]">Issued by</span>
              <SegmentedControl
                size="sm"
                aria-label="Issued-by locale"
                value={issuedLocale}
                onValueChange={setIssuedLocale}
                options={[
                  { value: 'en', label: 'EN' },
                  { value: 'es', label: 'ES' },
                  { value: 'pt', label: 'PT' },
                ]}
              />
            </div>
            <Input
              value={issuedValues[issuedLocale]}
              onChange={(event) =>
                setValue(issuedFields[issuedLocale], event.target.value, { shouldDirty: true })
              }
            />
          </div>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Media</h2>
          <FormField label="Image">
            <Controller
              control={control}
              name="imageAlt"
              render={({ field }) => (
                <ImageUploader
                  imageUrl={
                    certification?.image.asset._ref
                      ? sanityImageUrl(certification.image.asset._ref)
                      : undefined
                  }
                  alt={field.value}
                  onAltChange={field.onChange}
                  onUpload={handleUpload}
                />
              )}
            />
          </FormField>
          {isNew && (
            <Button type="submit" className="self-start">
              Save draft
            </Button>
          )}
        </Card>
      </form>
    </EditorLayout>
  );
```

- [ ] **Step 4: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/routes/certifications/\$id.tsx
git commit -m "feat(admin): reflow certification editor into EditorLayout"
```

---

### Task 13: Degree editor reflow

**Files:**
- Modify: `apps/admin/src/routes/degrees/$id.tsx`

**Interfaces:** Consumes `EditorLayout`, `PublishingCard`, `SegmentedControl`, `Card`. Preserve all form logic. Both `name` and `issued` are per-locale; the mockup uses a single locale switch in the "Details" header that drives both fields.

- [ ] **Step 1: Update imports**

```tsx
import { Button, Card, FormField, ImageUploader, Input, SegmentedControl } from '@mfranceschit/ui';
```

Add `EditorLayout`, `PublishingCard` after `@/` imports; remove `LocaleField` and `DocumentToolbar`.

- [ ] **Step 2: Add locale state + helpers**

After the two `useWatch(...)` blocks:

```tsx
  const [locale, setLocale] = useState<'en' | 'es' | 'pt'>('en');
  const saving = createDraft.isPending || patchDraft.isPending;
  const nameValues = { en: nameEn, es: nameEs, pt: namePt };
  const nameFields = { en: 'nameEn', es: 'nameEs', pt: 'namePt' } as const;
  const issuedValues = { en: issuedEn, es: issuedEs, pt: issuedPt };
  const issuedFields = { en: 'issuedEn', es: 'issuedEs', pt: 'issuedPt' } as const;
```

- [ ] **Step 3: Replace the `return`**

```tsx
  return (
    <EditorLayout
      header={{
        eyebrow: 'Certifications · Degree',
        title: isNew ? 'New degree' : (degree?.name.en ?? 'Degree'),
        backLink: { label: 'Degrees', onClick: () => navigate({ to: '/degrees' }) },
      }}
      aside={
        isNew ? null : (
          <PublishingCard
            status={degree?._status ?? 'draft'}
            dirty={isDirty}
            saving={saving}
            onSave={handleSubmit(onSubmit)}
            onPublish={async () => {
              await publish.mutateAsync({ id });
            }}
            onDiscard={async () => {
              await discard.mutateAsync({ id });
            }}
            toaster={toaster}
          />
        )
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Details</h2>
            <SegmentedControl
              size="sm"
              aria-label="Locale"
              value={locale}
              onValueChange={setLocale}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
                { value: 'pt', label: 'PT' },
              ]}
            />
          </div>
          <FormField label="Name" required error={errors.nameEn?.message}>
            <Input
              value={nameValues[locale]}
              onChange={(event) =>
                setValue(nameFields[locale], event.target.value, { shouldDirty: true })
              }
            />
          </FormField>
          <FormField label="Issued by" hint="Name and issuer follow the selected language">
            <Input
              value={issuedValues[locale]}
              onChange={(event) =>
                setValue(issuedFields[locale], event.target.value, { shouldDirty: true })
              }
            />
          </FormField>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Media</h2>
          <FormField label="Image">
            <Controller
              control={control}
              name="imageAlt"
              render={({ field }) => (
                <ImageUploader
                  imageUrl={
                    degree?.image.asset._ref ? sanityImageUrl(degree.image.asset._ref) : undefined
                  }
                  alt={field.value}
                  onAltChange={field.onChange}
                  onUpload={handleUpload}
                />
              )}
            />
          </FormField>
          {isNew && (
            <Button type="submit" className="self-start">
              Save draft
            </Button>
          )}
        </Card>
      </form>
    </EditorLayout>
  );
```

- [ ] **Step 4: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/routes/degrees/\$id.tsx
git commit -m "feat(admin): reflow degree editor into EditorLayout"
```

---

### Task 14: Client editor reflow

**Files:**
- Modify: `apps/admin/src/routes/clients/$id.tsx`

**Interfaces:** Consumes `EditorLayout`, `PublishingCard`, `Card`. Preserve `formSchema`, `toFormValues`, `onSubmit`, `CURRENCIES`, `Select`/`NumberInput` controllers. No locale fields here.

- [ ] **Step 1: Update imports**

```tsx
import { Button, Card, FormField, Input, NumberInput, Select } from '@mfranceschit/ui';
```

Add `EditorLayout`, `PublishingCard` after `@/` imports; remove `DocumentToolbar`.

- [ ] **Step 2: Add save flag**

After `useForm(...)`:

```tsx
  const saving = createDraft.isPending || patchDraft.isPending;
```

- [ ] **Step 3: Replace the `return`**

```tsx
  return (
    <EditorLayout
      header={{
        eyebrow: 'Billing · Client',
        title: isNew ? 'New client' : (client?.name ?? 'Client'),
        backLink: { label: 'Clients', onClick: () => navigate({ to: '/clients' }) },
      }}
      aside={
        isNew ? null : (
          <PublishingCard
            status={client?._status ?? 'draft'}
            dirty={isDirty}
            saving={saving}
            onSave={handleSubmit(onSubmit)}
            onPublish={async () => {
              await publish.mutateAsync({ id });
            }}
            onDiscard={async () => {
              await discard.mutateAsync({ id });
            }}
            toaster={toaster}
          />
        )
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Contact</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input {...register('email')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            <FormField label="Tax ID" error={errors.taxId?.message}>
              <Input {...register('taxId')} />
            </FormField>
          </div>
          <FormField label="Address" error={errors.address?.message}>
            <Input as="textarea" {...register('address')} />
          </FormField>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
            Billing defaults
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Currency" required error={errors.currency?.message}>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select
                    items={CURRENCIES}
                    itemToString={(item: string) => item}
                    itemToValue={(item: string) => item}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0] ?? '')}
                  />
                )}
              />
            </FormField>
            <FormField
              label="Default rate"
              hint="Optional, per-hour or per-project"
              error={errors.defaultRate?.message}
            >
              <Controller
                control={control}
                name="defaultRate"
                render={({ field }) => (
                  <NumberInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(Number.isNaN(value) ? '' : String(value))}
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </FormField>
          </div>
          {isNew && (
            <Button type="submit" className="self-start">
              Save draft
            </Button>
          )}
        </Card>
      </form>
    </EditorLayout>
  );
```

- [ ] **Step 4: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/routes/clients/\$id.tsx
git commit -m "feat(admin): reflow client editor into EditorLayout"
```

---

### Task 15: About editor reflow

**Files:**
- Modify: `apps/admin/src/routes/about.tsx`

**Interfaces:** Consumes `EditorLayout`, `PublishingCard`, `SegmentedControl`, `Card`. Preserve `formSchema`, `toFormValues`, `onSubmit` (upsert), title `useWatch`. Title switches from `LocaleField` to `SegmentedControl` + `Input`; body switches from `Tabs` to `SegmentedControl` + a single `RichTextEditor`. About has no `isNew` (singleton) — the rail always shows. Save uses `upsert.isPending` and toasts "About saved" (already in `onSubmit`).

- [ ] **Step 1: Update imports**

```tsx
import {
  Card,
  FormField,
  Input,
  RichTextEditor,
  type RichTextEditorProps,
  SegmentedControl,
} from '@mfranceschit/ui';
```

Add after `@/` imports: `EditorLayout`, `PublishingCard`; remove `Button`, `LocaleField`, `Tabs`, `DocumentToolbar`.

- [ ] **Step 2: Add locale state + save flag**

After the title `useWatch(...)`:

```tsx
  const [titleLocale, setTitleLocale] = useState<'en' | 'es' | 'pt'>('en');
  const [bodyLocale, setBodyLocale] = useState<'en' | 'es' | 'pt'>('en');
  const saving = upsert.isPending;
  const titleValues = { en: titleEn, es: titleEs, pt: titlePt };
  const titleFields = { en: 'titleEn', es: 'titleEs', pt: 'titlePt' } as const;
```

Add `useState` to the `react` import: `import { useState } from 'react';`.

- [ ] **Step 3: Replace the `return`**

```tsx
  return (
    <EditorLayout
      header={{
        eyebrow: 'Site',
        title: 'About',
        backLink: { label: 'Dashboard', onClick: () => Route.navigate({ to: '/' }) },
      }}
      aside={
        <PublishingCard
          status={about?._status ?? 'draft'}
          dirty={isDirty}
          saving={saving}
          onSave={handleSubmit(onSubmit)}
          onPublish={async () => {
            await publish.mutateAsync({ id: 'about' });
          }}
          onDiscard={async () => {
            await discard.mutateAsync({ id: 'about' });
          }}
          toaster={toaster}
        />
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
              Title &amp; stack
            </h2>
            <SegmentedControl
              size="sm"
              aria-label="Title locale"
              value={titleLocale}
              onValueChange={setTitleLocale}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
                { value: 'pt', label: 'PT' },
              ]}
            />
          </div>
          <FormField label="Title" required error={errors.titleEn?.message}>
            <Input
              value={titleValues[titleLocale]}
              onChange={(event) =>
                setValue(titleFields[titleLocale], event.target.value, { shouldDirty: true })
              }
            />
          </FormField>
          <FormField label="Stack" hint="Comma-separated" error={errors.stack?.message}>
            <Input {...register('stack')} />
          </FormField>
        </Card>

        <Card padding="24px" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Body</h2>
            <SegmentedControl
              size="sm"
              aria-label="Body locale"
              value={bodyLocale}
              onValueChange={setBodyLocale}
              options={[
                { value: 'en', label: 'EN' },
                { value: 'es', label: 'ES' },
                { value: 'pt', label: 'PT' },
              ]}
            />
          </div>
          {bodyLocale === 'en' && (
            <Controller
              control={control}
              name="bodyEn"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {bodyLocale === 'es' && (
            <Controller
              control={control}
              name="bodyEs"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
          {bodyLocale === 'pt' && (
            <Controller
              control={control}
              name="bodyPt"
              render={({ field }) => (
                <RichTextEditor value={field.value} onValueChange={field.onChange} />
              )}
            />
          )}
        </Card>
      </form>
    </EditorLayout>
  );
```

Note: `Route.navigate` is available on the file route; if TS complains, use the `useNavigate()` hook (add `const navigate = useNavigate();` and import it) instead.

- [ ] **Step 4: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/routes/about.tsx
git commit -m "feat(admin): reflow about editor into EditorLayout"
```

---

### Task 16: Business Profile editor reflow

**Files:**
- Modify: `apps/admin/src/routes/settings/business-profile.tsx`

**Interfaces:** Consumes `EditorLayout`, `Button`, `Card`. This is a direct-write singleton (no draft/publish, no status) — the rail is a plain **Save** card, not `PublishingCard`. Preserve `formSchema`, `toFormValues`, `onSubmit`.

- [ ] **Step 1: Rewrite the file**

`apps/admin/src/routes/settings/business-profile.tsx`:

```tsx
import { Button, Card, FormField, Input } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useBusinessProfile, useUpsertBusinessProfile } from '@/features/invoices/queries';
import type { BusinessProfile } from '@/shared/types';
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';

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
  const navigate = useNavigate();

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
    <EditorLayout
      header={{
        eyebrow: 'Billing · Settings',
        title: 'Business Profile',
        backLink: { label: 'Dashboard', onClick: () => navigate({ to: '/' }) },
      }}
      aside={
        <Card padding="20px 24px" className="flex flex-col gap-3.5">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Profile</h2>
          <p className="font-sans text-[13px] text-[var(--text-muted)]">
            Reused as the issuer on every new invoice.
          </p>
          <Button fullWidth onClick={handleSubmit(onSubmit)} disabled={upsert.isPending}>
            {upsert.isPending ? 'Saving…' : 'Save'}
          </Button>
        </Card>
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <div>
            <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">
              Issuer details
            </h2>
            <p className="mt-1 font-sans text-[13px] text-[var(--text-muted)]">
              Reused as the issuer on every new invoice.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Tax ID" error={errors.taxId?.message}>
              <Input {...register('taxId')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input {...register('email')} />
            </FormField>
          </div>
          <FormField label="Address" error={errors.address?.message}>
            <Input as="textarea" {...register('address')} />
          </FormField>
        </Card>
      </form>
    </EditorLayout>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS.

```bash
git add apps/admin/src/routes/settings/business-profile.tsx
git commit -m "feat(admin): reflow business profile into EditorLayout"
```

---

### Task 17: Invoice editor reflow + delete `DocumentToolbar`

**Files:**
- Modify: `apps/admin/src/routes/invoices/$id.tsx`
- Delete: `apps/admin/src/widgets/DocumentToolbar/DocumentToolbar.tsx` (and its directory)

**Interfaces:** Consumes `EditorLayout`, `InvoiceSummaryCard` (Task 7), `Card`. Preserve `formSchema`, `toFormValues`, `locked`, `useFieldArray`, `liveTotals`, `onSubmit`, `markAs`. Move totals + actions into `InvoiceSummaryCard`; regroup Billing fields and Line items into cards.

- [ ] **Step 1: Confirm `DocumentToolbar` has no remaining importers**

Run: `grep -rn "DocumentToolbar" apps/admin/src`
Expected: after Tasks 11-15 only `widgets/DocumentToolbar/DocumentToolbar.tsx` itself matches. If any route still imports it, that route's task was skipped — complete it first.

- [ ] **Step 2: Update imports**

```tsx
import { Button, Card, Combobox, DatePicker, FormField, Input, NumberInput, Select } from '@mfranceschit/ui';
```

Add after `@/` imports:

```tsx
import { EditorLayout } from '@/widgets/EditorLayout/EditorLayout';
import { InvoiceSummaryCard } from '@/widgets/InvoiceSummaryCard/InvoiceSummaryCard';
```

Remove the `Badge` import (status now lives in the summary card) and `formatMoney`/`formatInvoiceNumber` usages that move into the card — but keep `formatInvoiceNumber` (used for the title) and drop `formatMoney` (now inside `InvoiceSummaryCard`). Final format import: `import { formatInvoiceNumber } from '@/shared/lib/format';`.

- [ ] **Step 3: Add save flag**

After `liveTotals`:

```tsx
  const saving = createInvoice.isPending || patchInvoice.isPending;
```

- [ ] **Step 4: Replace the `return`**

```tsx
  return (
    <EditorLayout
      header={{
        eyebrow: 'Billing · Invoice',
        title: isNew ? 'New invoice' : invoice ? formatInvoiceNumber(invoice) : 'Invoice',
        backLink: { label: 'Invoices', onClick: () => navigate({ to: '/invoices' }) },
      }}
      aside={
        <InvoiceSummaryCard
          status={invoice?.status ?? 'draft'}
          currency={watchedCurrency || 'USD'}
          subtotal={liveTotals.subtotal}
          vat={liveTotals.vat}
          total={liveTotals.total}
          taxRate={Number(watchedTaxRate) || 0}
          locked={locked}
          saving={saving}
          onSave={handleSubmit(onSubmit)}
          onMarkSent={() => markAs('sent')}
          issuer={
            businessProfile
              ? {
                  name: businessProfile.name,
                  email: businessProfile.email,
                  taxId: businessProfile.taxId,
                }
              : undefined
          }
          onEditIssuer={() => navigate({ to: '/settings/business-profile' })}
        />
      }
    >
      <form className="contents" onSubmit={handleSubmit(onSubmit)}>
        <Card padding="24px" className="flex flex-col gap-4">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Billing</h2>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Issue date" required error={errors.issueDate?.message}>
              <Controller
                control={control}
                name="issueDate"
                render={({ field }) => (
                  <DatePicker value={field.value} onValueChange={field.onChange} disabled={locked} />
                )}
              />
            </FormField>
            <FormField label="Due date" error={errors.dueDate?.message}>
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
                    items={CURRENCIES}
                    itemToString={(item: string) => item}
                    itemToValue={(item: string) => item}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0] ?? '')}
                    disabled={locked}
                  />
                )}
              />
            </FormField>
            <FormField label="Tax rate (%)" error={errors.taxRate?.message}>
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
          </div>
        </Card>

        <Card padding="24px" className="flex flex-col gap-3">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Line items</h2>
          {fields.map((item, index) => (
            <div key={item.id} className="flex items-start gap-2">
              <div className="w-20">
                <Controller
                  control={control}
                  name={`lineItems.${index}.quantity`}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value}
                      onValueChange={(value) => field.onChange(Number.isNaN(value) ? '' : String(value))}
                      min={0}
                      disabled={locked}
                    />
                  )}
                />
              </div>
              <Input
                {...register(`lineItems.${index}.description`)}
                className="flex-1"
                placeholder="Description"
                disabled={locked}
              />
              <div className="w-28">
                <Controller
                  control={control}
                  name={`lineItems.${index}.unitPrice`}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value}
                      onValueChange={(value) => field.onChange(Number.isNaN(value) ? '' : String(value))}
                      min={0}
                      step={0.01}
                      disabled={locked}
                    />
                  )}
                />
              </div>
              {!locked && (
                <Button variant="outline" size="sm" type="button" onClick={() => remove(index)}>
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
              className="self-start"
            >
              + Add line item
            </Button>
          )}
        </Card>

        <Card padding="24px" className="flex flex-col gap-3">
          <h2 className="font-sans text-base font-semibold text-[var(--text-strong)]">Notes</h2>
          <FormField label="Notes" error={errors.notes?.message}>
            <Input as="textarea" {...register('notes')} disabled={locked} />
          </FormField>
        </Card>
      </form>
    </EditorLayout>
  );
```

- [ ] **Step 5: Delete `DocumentToolbar`**

Run: `rm -r apps/admin/src/widgets/DocumentToolbar`

- [ ] **Step 6: Typecheck**

Run: `cd apps/admin && fnm exec -- pnpm typecheck`
Expected: PASS (no dangling `DocumentToolbar` import).

- [ ] **Step 7: Full test run**

Run: `cd apps/admin && fnm exec -- pnpm test`
Expected: PASS (existing suites + new `dashboard` tests).

- [ ] **Step 8: Commit**

```bash
git add apps/admin/src/routes/invoices/\$id.tsx
git rm -r --cached apps/admin/src/widgets/DocumentToolbar 2>/dev/null; true
git add -A apps/admin/src/widgets
git commit -m "feat(admin): reflow invoice editor and remove DocumentToolbar"
```

---

### Task 18: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Repo-wide typecheck**

Run: `fnm exec -- pnpm typecheck`
Expected: PASS across `@mfranceschit/ui` and `@mfranceschit/admin`.

- [ ] **Step 2: Manual walkthrough (user, dev server)**

The user runs the dev server and verifies against the mockup: sand nav with counts + active pill + Dashboard link; dashboard hero + attention/billing cards with live data; each list page header + card + (invoices) footer; each editor's two-column layout, locale segmented controls, and rail (Publishing / Summary / Save) — including invoice locking once `status !== 'draft'`. Report any visual deltas for follow-up.

---

## Self-Review Notes

- **Spec coverage:** SegmentedControl (T1); buildDashboard + one aggregation server fn (T2-T3); PageHeader/EditorLayout/PublishingCard/InvoiceSummaryCard/dashboard widgets (T4-T8); NavShell + root reshape + dashboard (T9); list pages (T10); all seven editors (T11-T17); DocumentToolbar removed (T17). Nav counts sourced from `useDashboard` (T9). All spec sections map to tasks.
- **Type consistency:** `DashboardData`/`AttentionItem`/`RecentInvoice`/`OutstandingTotal`/`AttentionType` defined in T2, consumed unchanged in T3/T8/T9. `PublishingCardProps.onSave`/`saving` and `InvoiceSummaryCardProps` match their T11-T17 call sites. `SegmentedControlProps` matches editor usage.
- **Preservation:** every editor keeps its existing zod schema, `toFormValues`, `onSubmit`, mutations, and (invoice) `locked` logic; only markup/imports change.
