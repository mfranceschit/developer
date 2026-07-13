# Admin Clients CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship list + edit routes for `client` (the invoice "BILL TO" party), completing Phase 6
of the spec. Simpler than the content-parity types: no image, no locale fields, no
`routeTree.gen.ts`-typing chicken-and-egg problem since there's no prior list route pointing at
this edit route yet — the type-widening dance from earlier plans isn't needed if both routes are
added in a way that avoids the ordering issue (see Task 1's note).

**Architecture:** Identical shape to Projects/Certifications/Degrees:
`routes/clients/index.tsx` + `routes/clients/$id.tsx`, reusing `useDocumentList`/`useDocument`/
`useCreateDraft`/`usePatchDraft`/`usePublish`/`useDiscard` with `type: 'client'`, and
`DocumentToolbar` unchanged. `currency` is a `Select` (a fixed short list: USD/EUR/GBP, matching
the spec's "default USD" plus the currencies a freelancer commonly bills in — extend later if
needed, this isn't a Sanity-enforced enum).

**Tech Stack:** No new dependencies.

## Global Constraints

- All colors/UI components live in `packages/ui`; `apps/admin` imports only (HARD RULE).
- Document shape (already encoded as `clientSchema` in `apps/admin/src/shared/schemas.ts`):
  `name` (string), `email` (string, email format), `phone` (string), `address` (string),
  `taxId` (string, optional), `currency` (string, default `'USD'`), `defaultRate` (number,
  optional).
- `client` follows the SAME draft/publish model as content types — the spec only exempts
  `invoice` from draft/publish, not `client`.
- Biome formatting (single quotes, trailing commas `all`, 2-space indent, 100 col).
- Do not run `pnpm dev` or `pnpm build` (or start any server). `pnpm typecheck` is the primary
  verification tool — no new pure-logic code needs vitest tests.
- Never commit unless explicitly instructed.

---

## File Structure

```
apps/admin/src/routes/clients/
  index.tsx    (list route)
  $id.tsx      (edit route)
```

---

### Task 1: Clients — list route AND edit route (single task)

**Rationale for combining into one task (unlike the content-parity plans, which split list/edit
across two tasks each):** the earlier plans split list/edit because the list route existed first
and needed a type-widening workaround until the edit route's task landed later. That workaround
exists purely to avoid a chicken-and-egg TypeScript problem across two separate commits. Since
`client` has no such split need — the two routes are trivially independent to write together —
combining them into one task avoids introducing (and then having to remove) an unnecessary
workaround. **Write both files in this one task, register both in `routeTree.gen.ts` together,
and the list route can use the properly-typed literal `navigate` form from the start.**

**Files:**
- Create: `apps/admin/src/routes/clients/index.tsx`
- Create: `apps/admin/src/routes/clients/$id.tsx`

**Interfaces:**
- Consumes: `useDocumentList`, `useDocument`, `useCreateDraft`, `usePatchDraft`, `usePublish`,
  `useDiscard` from `../../features/content/queries` with `type: 'client'`; `Table`, `Badge`,
  `Button`, `Input`, `FormField`, `Select` from `@mfranceschit/ui`; `DocumentToolbar` from
  `../../widgets/DocumentToolbar/DocumentToolbar`; `Client`, `DocumentStatus` types from
  `../../shared/types`.
- Produces: `/clients` (list) and `/clients/$id` (edit, `id === 'new'` = create mode).

- [ ] **Step 1: Write `apps/admin/src/routes/clients/index.tsx`**

```tsx
import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '../../features/content/queries';
import type { Client, DocumentStatus } from '../../shared/types';

export const Route = createFileRoute('/clients/')({
  component: ClientsListPage,
});

type ClientRow = Client & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

function ClientsListPage() {
  const { data, isLoading } = useDocumentList<ClientRow>('client');
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">Clients</h1>
        <Button size="sm" onClick={() => navigate({ to: '/clients/$id', params: { id: 'new' } })}>
          New client
        </Button>
      </div>
      <Table<ClientRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: '/clients/$id', params: { id: row._id } })}
        columns={[
          { header: 'Name', render: (row) => row.name },
          { header: 'Email', render: (row) => row.email },
          { header: 'Currency', render: (row) => row.currency },
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

- [ ] **Step 2: Write `apps/admin/src/routes/clients/$id.tsx`**

```tsx
import { Button, FormField, Input, NumberInput, Select } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useCreateDraft,
  useDiscard,
  useDocument,
  usePatchDraft,
  usePublish,
} from '../../features/content/queries';
import type { Client, DocumentStatus } from '../../shared/types';
import { DocumentToolbar } from '../../widgets/DocumentToolbar/DocumentToolbar';

export const Route = createFileRoute('/clients/$id')({
  component: ClientEditPage,
});

const CURRENCIES = ['USD', 'EUR', 'GBP'];

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Must be a valid email'),
  phone: z.string(),
  address: z.string(),
  taxId: z.string(),
  currency: z.string().min(1, 'Currency is required'),
  defaultRate: z.string(),
});

type ClientFormValues = z.infer<typeof formSchema>;

function toFormValues(client?: Client | null): ClientFormValues {
  return {
    name: client?.name ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    address: client?.address ?? '',
    taxId: client?.taxId ?? '',
    currency: client?.currency ?? 'USD',
    defaultRate: client?.defaultRate !== undefined ? String(client.defaultRate) : '',
  };
}

function ClientEditPage() {
  const { id } = Route.useParams();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: client } = useDocument<Client & { _status: DocumentStatus }>(
    'client',
    isNew ? '' : id,
  );
  const createDraft = useCreateDraft<Client>('client');
  const patchDraft = usePatchDraft<Client>();
  const publish = usePublish();
  const discard = useDiscard();

  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<ClientFormValues>({
    values: toFormValues(client),
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: ClientFormValues) {
    const doc = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      taxId: values.taxId || undefined,
      currency: values.currency,
      defaultRate: values.defaultRate ? Number(values.defaultRate) : undefined,
    };

    if (isNew) {
      const created = await createDraft.mutateAsync(doc);
      navigate({ to: '/clients/$id', params: { id: created._id } });
    } else {
      await patchDraft.mutateAsync({ id, patch: doc });
    }
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          {isNew ? 'New client' : client?.name}
        </h1>
        {!isNew && (
          <DocumentToolbar
            status={client?._status ?? 'draft'}
            dirty={isDirty}
            onPublish={async () => {
              await publish.mutateAsync({ id });
            }}
            onDiscard={async () => {
              await discard.mutateAsync({ id });
            }}
            toaster={toaster}
          />
        )}
      </div>

      <FormField label="Name" required error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="Email" required error={errors.email?.message}>
        <Input {...register('email')} />
      </FormField>

      <FormField label="Phone" error={errors.phone?.message}>
        <Input {...register('phone')} />
      </FormField>

      <FormField label="Address" error={errors.address?.message}>
        <Input as="textarea" {...register('address')} />
      </FormField>

      <FormField label="Tax ID" error={errors.taxId?.message}>
        <Input {...register('taxId')} />
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
            />
          )}
        />
      </FormField>

      <FormField label="Default rate" hint="Optional, per-hour or per-project" error={errors.defaultRate?.message}>
        <Controller
          control={control}
          name="defaultRate"
          render={({ field }) => (
            <NumberInput
              value={field.value}
              onValueChange={(value) => field.onChange(String(value))}
              min={0}
              step={0.01}
            />
          )}
        />
      </FormField>

      <Button type="submit" className="self-start">
        Save draft
      </Button>
    </form>
  );
}
```

Check `Select`'s real `SelectProps<T>` generic-call shape (it's used with an explicit `<T>`-free
call above relying on inference from `items: string[]` — confirm this actually infers correctly
against `packages/ui/src/components/Select/Select.tsx`'s signature; if inference fails, add an
explicit `Select<string>` type argument matching the pattern from that component's own Storybook
story).

- [ ] **Step 3: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register both `/clients/` and `/clients/$id`, following the pattern already established for
`/projects/`+`/projects/$id`, `/certifications/`+`/certifications/$id`, and
`/degrees/`+`/degrees/$id`.

- [ ] **Step 4: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/routes/clients
git commit -m "feat(admin): add clients list and edit routes with draft/publish"
```

---

## Self-Review Notes

- **Spec coverage:** Phase 6 (`client` CRUD) is fully covered — list + edit with draft/publish,
  matching the established pattern from content parity. `NavShell` doesn't yet link to
  `/clients` — that's a gap worth flagging (see below), since the spec's desk-structure parity
  section only covers Certifications/Work groups (legacy Studio structure), not the new
  `client`/`invoice` types, which didn't exist in the old Studio. A follow-up should add a
  "Billing" nav group (Clients, Invoices) once the invoice routes exist too — doing it now for
  Clients alone would mean revisiting `NavShell` again for Invoices; better to do both nav
  additions together in the invoices plan.
- **Placeholder scan:** none.
- **Type consistency:** `Client`/`DocumentStatus` (prior plan) consumed consistently.
  `defaultRate` round-trips through a string form field (react-hook-form's `NumberInput`
  `Controller` binding needs a string per its established `value?: string` prop from a prior
  plan) to a `number | undefined` in the submitted document, matching `clientSchema`.

## Next Plans

- `docs/superpowers/plans/<date>-admin-invoices.md` — Phase 7: invoice schema/form/numbering/
  list, `InvoiceDocument`, print route. Also the natural place to add a "Billing" `NavShell`
  group (Clients + Invoices) in one pass.
