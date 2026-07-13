# Admin Content Parity — Certifications + Degrees Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship list + edit routes for `certification` and `degree`, completing Phase 5 (content
parity) of the spec. Reuses `DocumentToolbar`, `NavShell`, `queries.ts`, and `LocaleField`
unchanged — no new infrastructure, just two more content types following the pattern proven by
Projects.

**Architecture:** Identical shape to the Projects plan: `routes/certifications/index.tsx` +
`routes/certifications/$id.tsx`, `routes/degrees/index.tsx` + `routes/degrees/$id.tsx`. Both use
`useDocumentList`/`useDocument`/`useCreateDraft`/`usePatchDraft`/`usePublish`/`useDiscard` from
`features/content/queries.ts` with `type: 'certification'`/`'degree'`, and `DocumentToolbar` for
publish/discard — both already generic, no changes needed. `issued` (both types) and `name`
(degree only) are `localeString` fields — use `LocaleField` directly (unlike Projects'
`description`, which is `localeContent` and needed a hand-built `Tabs`+`RichTextEditor` switcher,
`localeString` fields are exactly what `LocaleField` was built for).

**Tech Stack:** No new dependencies — everything needed already exists from prior plans.

## Global Constraints

- All colors/UI components live in `packages/ui`; `apps/admin` imports only (root `CLAUDE.md`
  HARD RULE).
- Document shapes (already encoded as `certificationSchema`/`degreeSchema` in
  `apps/admin/src/shared/schemas.ts`): `certification` — `name` (string), `date` (string date),
  `image` (SanityImage), `url`, `issued` (localeString). `degree` — `name` (localeString),
  `image` (SanityImage), `issued` (localeString).
- Languages: `en` (default), `es`, `pt`.
- Known carry-forward gap from the Projects plan: the `ImageUploader`'s `imageUrl`/upload-preview
  URL is a non-functional placeholder (`https://cdn.sanity.io/images/placeholder/${ref}`),
  TODO-marked in `routes/projects/$id.tsx`. **This plan repeats the same placeholder pattern for
  consistency** rather than fixing real Sanity CDN URL resolution in isolation for one content
  type — that fix belongs in a follow-up that touches all three content types' image handling at
  once (or the shared image-URL construction gets extracted into `shared/lib/` at that point).
  Mark each new call site with the same TODO comment used in the Projects route.
- Biome formatting (single quotes, trailing commas `all`, 2-space indent, 100 col) — do not run
  `pnpm check`/`pnpm format`, just write clean code.
- Do not run `pnpm dev` or `pnpm build` (or start any server). `pnpm typecheck` is the primary
  verification tool for this plan (no new pure-logic code needs vitest tests — these are route
  components following an already-tested infrastructure layer).
- Never commit unless explicitly instructed.

---

## File Structure

```
apps/admin/src/routes/
  certifications/
    index.tsx    (list route)
    $id.tsx      (edit route)
  degrees/
    index.tsx    (list route)
    $id.tsx      (edit route)
```

---

### Task 1: Certifications — list route

**Files:**
- Create: `apps/admin/src/routes/certifications/index.tsx`

**Interfaces:**
- Consumes: `useDocumentList` from `../../features/content/queries` with `type: 'certification'`;
  `Table`, `Badge`, `Button` from `@mfranceschit/ui`; `Certification` type from
  `../../shared/types`.
- Produces: a route rendering a `Table<Certification & { _status: DocumentStatus }>` with name,
  date, and status columns, row-click navigates to `/certifications/$id`, "New certification"
  button navigates to `/certifications/new`.

- [ ] **Step 1: Write `apps/admin/src/routes/certifications/index.tsx`**

```tsx
import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '../../features/content/queries';
import type { Certification, DocumentStatus } from '../../shared/types';

export const Route = createFileRoute('/certifications/')({
  component: CertificationsListPage,
});

type CertificationRow = Certification & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

function CertificationsListPage() {
  const { data, isLoading } = useDocumentList<CertificationRow>('certification');
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          Certifications
        </h1>
        <Button
          size="sm"
          onClick={() => navigate({ to: '/certifications/$id', params: { id: 'new' } })}
        >
          New certification
        </Button>
      </div>
      <Table<CertificationRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: '/certifications/$id', params: { id: row._id } })}
        columns={[
          { header: 'Name', render: (row) => row.name },
          { header: 'Date', render: (row) => row.date },
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

`BadgeTone`'s real union was already confirmed in a prior plan
(`'neutral' | 'blue' | 'berry' | 'sand' | 'solid' | 'glass' | 'tint-accent'`) —
`'blue' | 'neutral' | 'berry'` are all valid, no adjustment needed.

- [ ] **Step 2: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register `/certifications/` following the exact same pattern used for `/projects/` in the
Projects plan — read the current stub to see that pattern before editing.

- [ ] **Step 3: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/routes/certifications/index.tsx
git commit -m "feat(admin): add certifications list route"
```

---

### Task 2: Certifications — edit route

**Files:**
- Create: `apps/admin/src/routes/certifications/$id.tsx`

**Interfaces:**
- Consumes: `useDocument`, `useCreateDraft`, `usePatchDraft`, `usePublish`, `useDiscard` from
  `../../features/content/queries`; `Input`, `FormField`, `ImageUploader`, `LocaleField`,
  `DatePicker`, `Button` from `@mfranceschit/ui`; `DocumentToolbar` from
  `../../widgets/DocumentToolbar/DocumentToolbar`; `uploadImageAssetFn` from
  `../../server/functions/upload`.
- Produces: a route at `/certifications/$id` (id `'new'` = create mode) with react-hook-form
  bound to a form-level zod schema, `ImageUploader` for `image`, `DatePicker` for `date`,
  `LocaleField` for `issued` (a plain `localeString` — unlike Projects' `description`, no custom
  `Tabs`+`RichTextEditor` switcher needed here), and `DocumentToolbar`.

- [ ] **Step 1: Write `apps/admin/src/routes/certifications/$id.tsx`**

```tsx
import { Button, DatePicker, FormField, ImageUploader, Input, LocaleField } from '@mfranceschit/ui';
import type { SupportedLocale } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import {
  useCreateDraft,
  useDiscard,
  useDocument,
  usePatchDraft,
  usePublish,
} from '../../features/content/queries';
import { uploadImageAssetFn } from '../../server/functions/upload';
import type { Certification, DocumentStatus } from '../../shared/types';
import { DocumentToolbar } from '../../widgets/DocumentToolbar/DocumentToolbar';

export const Route = createFileRoute('/certifications/$id')({
  component: CertificationEditPage,
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  issuedEn: z.string(),
  issuedEs: z.string(),
  issuedPt: z.string(),
  imageAlt: z.string(),
});

type CertificationFormValues = z.infer<typeof formSchema>;

function toFormValues(certification?: Certification | null): CertificationFormValues {
  return {
    name: certification?.name ?? '',
    date: certification?.date ?? '',
    url: certification?.url ?? '',
    issuedEn: certification?.issued.en ?? '',
    issuedEs: certification?.issued.es ?? '',
    issuedPt: certification?.issued.pt ?? '',
    imageAlt: certification?.image.alt ?? '',
  };
}

function CertificationEditPage() {
  const { id } = Route.useParams();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: certification } = useDocument<Certification & { _status: DocumentStatus }>(
    'certification',
    isNew ? '' : id,
  );
  const createDraft = useCreateDraft<Certification>('certification');
  const patchDraft = usePatchDraft<Certification>();
  const publish = usePublish();
  const discard = useDiscard();
  const [uploadedAsset, setUploadedAsset] = useState<Certification['image']['asset'] | undefined>(
    undefined,
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<CertificationFormValues>({
    values: toFormValues(certification),
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: CertificationFormValues) {
    const doc = {
      name: values.name,
      date: values.date,
      url: values.url,
      issued: { en: values.issuedEn, es: values.issuedEs, pt: values.issuedPt },
      image: {
        _type: 'image' as const,
        asset: uploadedAsset ??
          certification?.image.asset ?? { _ref: '', _type: 'reference' as const },
        alt: values.imageAlt,
      },
    };

    if (isNew) {
      const created = await createDraft.mutateAsync(doc);
      navigate({ to: '/certifications/$id', params: { id: created._id } });
    } else {
      await patchDraft.mutateAsync({ id, patch: doc });
    }
  }

  async function handleUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.set('file', file);
    const asset = await uploadImageAssetFn({ data: formData });
    setUploadedAsset(asset);
    // TODO: Placeholder Sanity CDN URL — image preview will not render until real URL
    // resolution (e.g. @sanity/image-url) is implemented. See routes/projects/$id.tsx.
    return `https://cdn.sanity.io/images/placeholder/${asset._ref}`;
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          {isNew ? 'New certification' : certification?.name}
        </h1>
        {!isNew && (
          <DocumentToolbar
            status={certification?._status ?? 'draft'}
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

      <FormField label="Date" required error={errors.date?.message}>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker value={field.value} onValueChange={field.onChange} />
          )}
        />
      </FormField>

      <FormField label="URL" error={errors.url?.message}>
        <Input {...register('url')} />
      </FormField>

      <FormField label="Image">
        <Controller
          control={control}
          name="imageAlt"
          render={({ field }) => (
            <ImageUploader
              // TODO: Placeholder Sanity CDN URL — see routes/projects/$id.tsx.
              imageUrl={
                certification?.image.asset._ref
                  ? `https://cdn.sanity.io/images/placeholder/${certification.image.asset._ref}`
                  : undefined
              }
              alt={field.value}
              onAltChange={field.onChange}
              onUpload={handleUpload}
            />
          )}
        />
      </FormField>

      <FormField label="Issued">
        <Controller
          control={control}
          name="issuedEn"
          render={() => (
            <LocaleField
              value={{
                en: control._formValues.issuedEn,
                es: control._formValues.issuedEs,
                pt: control._formValues.issuedPt,
              }}
              onValueChange={(locale: SupportedLocale, value: string) => {
                control._formValues[`issued${locale[0].toUpperCase()}${locale.slice(1)}`] = value;
              }}
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

**This step's `LocaleField` wiring above is deliberately wrong — fix it.** Reading
`control._formValues` directly and mutating it is not how react-hook-form works; it won't
trigger re-renders or register the change. Instead, use three separate `Controller`s (one per
locale field, `issuedEn`/`issuedEs`/`issuedPt`) OR compose `LocaleField` manually with `watch()`
+ `setValue()` from `useForm`. The cleanest approach: since `LocaleField`'s
`value`/`onValueChange` operate on all three locales as one unit, use `watch(['issuedEn',
'issuedEs', 'issuedPt'])` to read current values and `setValue(fieldName, value, { shouldDirty:
true })` to write them:

```tsx
const [issuedEn, issuedEs, issuedPt] = useWatch({
  control,
  name: ['issuedEn', 'issuedEs', 'issuedPt'],
});

// ...inside the FormField:
<LocaleField
  value={{ en: issuedEn, es: issuedEs, pt: issuedPt }}
  onValueChange={(locale, value) => {
    setValue(`issued${locale[0].toUpperCase()}${locale.slice(1)}` as
      'issuedEn' | 'issuedEs' | 'issuedPt', value, { shouldDirty: true });
  }}
/>
```

Add `useWatch` to the `react-hook-form` import and `setValue` to the `useForm` destructuring.
Verify this actually typechecks and makes logical sense — `useWatch`'s array-of-names overload
returns a tuple in the same order as the names array, confirm this against the installed
`react-hook-form` version's types before assuming the shape.

- [ ] **Step 2: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register `/certifications/$id`, following the same pattern as `/projects/$id`.

- [ ] **Step 3: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/routes/certifications/\$id.tsx
git commit -m "feat(admin): add certifications edit route with draft/publish"
```

---

### Task 3: Degrees — list route

**Files:**
- Create: `apps/admin/src/routes/degrees/index.tsx`

**Interfaces:**
- Consumes: `useDocumentList` from `../../features/content/queries` with `type: 'degree'`;
  `Table`, `Badge`, `Button` from `@mfranceschit/ui`; `Degree` type from `../../shared/types`.
  Note `Degree.name` is a `localeString` object (`{ en, es, pt }`), not a plain string — the list
  column must render `row.name.en`.
- Produces: a route rendering a `Table<Degree & { _status: DocumentStatus }>` with name (English)
  and status columns, row-click navigates to `/degrees/$id`, "New degree" button navigates to
  `/degrees/new`.

- [ ] **Step 1: Write `apps/admin/src/routes/degrees/index.tsx`**

```tsx
import { Badge, type BadgeTone, Button, Table } from '@mfranceschit/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDocumentList } from '../../features/content/queries';
import type { Degree, DocumentStatus } from '../../shared/types';

export const Route = createFileRoute('/degrees/')({
  component: DegreesListPage,
});

type DegreeRow = Degree & { _status: DocumentStatus };

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  published: 'blue',
  draft: 'neutral',
  'unpublished-changes': 'berry',
};

function DegreesListPage() {
  const { data, isLoading } = useDocumentList<DegreeRow>('degree');
  const navigate = useNavigate();

  if (isLoading) {
    return <p className="p-6 font-sans text-sm text-[var(--text-muted)]">Loading…</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">Degrees</h1>
        <Button size="sm" onClick={() => navigate({ to: '/degrees/$id', params: { id: 'new' } })}>
          New degree
        </Button>
      </div>
      <Table<DegreeRow>
        rows={data ?? []}
        getRowKey={(row) => row._id}
        onRowClick={(row) => navigate({ to: '/degrees/$id', params: { id: row._id } })}
        columns={[
          { header: 'Name', render: (row) => row.name.en },
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

- [ ] **Step 2: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register `/degrees/`.

- [ ] **Step 3: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/routes/degrees/index.tsx
git commit -m "feat(admin): add degrees list route"
```

---

### Task 4: Degrees — edit route

**Files:**
- Create: `apps/admin/src/routes/degrees/$id.tsx`

**Interfaces:**
- Consumes: `useDocument`, `useCreateDraft`, `usePatchDraft`, `usePublish`, `useDiscard` from
  `../../features/content/queries`; `FormField`, `ImageUploader`, `LocaleField`, `Button` from
  `@mfranceschit/ui`; `DocumentToolbar`; `uploadImageAssetFn`.
- Produces: a route at `/degrees/$id` (id `'new'` = create mode). BOTH `name` and `issued` are
  `localeString` — use two `LocaleField`s, each wired via the `useWatch`/`setValue` pattern
  established (and corrected) in Task 2. No plain-string `name` field like Certification/Project
  have — reuse Task 2's corrected `LocaleField` wiring pattern for both fields here.

- [ ] **Step 1: Write `apps/admin/src/routes/degrees/$id.tsx`**

Follow Task 2's structure exactly, adapted for Degree's shape:

```tsx
import { Button, FormField, ImageUploader, LocaleField } from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import {
  useCreateDraft,
  useDiscard,
  useDocument,
  usePatchDraft,
  usePublish,
} from '../../features/content/queries';
import { uploadImageAssetFn } from '../../server/functions/upload';
import type { Degree, DocumentStatus } from '../../shared/types';
import { DocumentToolbar } from '../../widgets/DocumentToolbar/DocumentToolbar';

export const Route = createFileRoute('/degrees/$id')({
  component: DegreeEditPage,
});

const formSchema = z.object({
  nameEn: z.string().min(1, 'English name is required'),
  nameEs: z.string(),
  namePt: z.string(),
  issuedEn: z.string(),
  issuedEs: z.string(),
  issuedPt: z.string(),
  imageAlt: z.string(),
});

type DegreeFormValues = z.infer<typeof formSchema>;

function toFormValues(degree?: Degree | null): DegreeFormValues {
  return {
    nameEn: degree?.name.en ?? '',
    nameEs: degree?.name.es ?? '',
    namePt: degree?.name.pt ?? '',
    issuedEn: degree?.issued.en ?? '',
    issuedEs: degree?.issued.es ?? '',
    issuedPt: degree?.issued.pt ?? '',
    imageAlt: degree?.image.alt ?? '',
  };
}

function DegreeEditPage() {
  const { id } = Route.useParams();
  const { toaster } = Route.useRouteContext();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: degree } = useDocument<Degree & { _status: DocumentStatus }>(
    'degree',
    isNew ? '' : id,
  );
  const createDraft = useCreateDraft<Degree>('degree');
  const patchDraft = usePatchDraft<Degree>();
  const publish = usePublish();
  const discard = useDiscard();
  const [uploadedAsset, setUploadedAsset] = useState<Degree['image']['asset'] | undefined>(
    undefined,
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<DegreeFormValues>({
    values: toFormValues(degree),
    resolver: zodResolver(formSchema),
  });

  const [nameEn, nameEs, namePt] = useWatch({ control, name: ['nameEn', 'nameEs', 'namePt'] });
  const [issuedEn, issuedEs, issuedPt] = useWatch({
    control,
    name: ['issuedEn', 'issuedEs', 'issuedPt'],
  });

  async function onSubmit(values: DegreeFormValues) {
    const doc = {
      name: { en: values.nameEn, es: values.nameEs, pt: values.namePt },
      issued: { en: values.issuedEn, es: values.issuedEs, pt: values.issuedPt },
      image: {
        _type: 'image' as const,
        asset: uploadedAsset ?? degree?.image.asset ?? { _ref: '', _type: 'reference' as const },
        alt: values.imageAlt,
      },
    };

    if (isNew) {
      const created = await createDraft.mutateAsync(doc);
      navigate({ to: '/degrees/$id', params: { id: created._id } });
    } else {
      await patchDraft.mutateAsync({ id, patch: doc });
    }
  }

  async function handleUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.set('file', file);
    const asset = await uploadImageAssetFn({ data: formData });
    setUploadedAsset(asset);
    // TODO: Placeholder Sanity CDN URL — see routes/projects/$id.tsx.
    return `https://cdn.sanity.io/images/placeholder/${asset._ref}`;
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">
          {isNew ? 'New degree' : degree?.name.en}
        </h1>
        {!isNew && (
          <DocumentToolbar
            status={degree?._status ?? 'draft'}
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

      <FormField label="Name" required error={errors.nameEn?.message}>
        <LocaleField
          value={{ en: nameEn, es: nameEs, pt: namePt }}
          onValueChange={(locale, value) => {
            const field = `name${locale[0].toUpperCase()}${locale.slice(1)}` as
              | 'nameEn'
              | 'nameEs'
              | 'namePt';
            setValue(field, value, { shouldDirty: true });
          }}
        />
      </FormField>

      <FormField label="Image">
        <ImageUploader
          // TODO: Placeholder Sanity CDN URL — see routes/projects/$id.tsx.
          imageUrl={
            degree?.image.asset._ref
              ? `https://cdn.sanity.io/images/placeholder/${degree.image.asset._ref}`
              : undefined
          }
          alt={register('imageAlt').name ? '' : ''}
          onAltChange={() => {}}
          onUpload={handleUpload}
        />
      </FormField>

      <FormField label="Issued">
        <LocaleField
          value={{ en: issuedEn, es: issuedEs, pt: issuedPt }}
          onValueChange={(locale, value) => {
            const field = `issued${locale[0].toUpperCase()}${locale.slice(1)}` as
              | 'issuedEn'
              | 'issuedEs'
              | 'issuedPt';
            setValue(field, value, { shouldDirty: true });
          }}
        />
      </FormField>

      <Button type="submit" className="self-start">
        Save draft
      </Button>
    </form>
  );
}
```

**This step's `ImageUploader`'s `alt`/`onAltChange` wiring above (`register('imageAlt').name ?
''  : ''`) is a placeholder mistake — fix it.** `imageAlt` is a plain string field with no
special controlled-component needs, so wire it with `Controller` the same way Task 2 (and the
Projects plan) does: `alt={field.value}`, `onAltChange={field.onChange}`, wrapped in
`<Controller control={control} name="imageAlt" render={({ field }) => (...)} />`. Copy the exact
pattern from Task 2's `ImageUploader` usage (which itself copies the Projects plan's pattern) —
do not invent a new approach.

- [ ] **Step 2: Extend `apps/admin/src/routeTree.gen.ts` (local, gitignored stub)**

Register `/degrees/$id`.

- [ ] **Step 3: Verify typecheck**

```bash
fnm exec -- pnpm --filter @mfranceschit/admin typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/routes/degrees/\$id.tsx
git commit -m "feat(admin): add degrees edit route with draft/publish"
```

---

## Self-Review Notes

- **Spec coverage:** Phase 5 (content parity) is now fully covered across this plan and the
  Projects plan: all three existing content types (`project`, `certification`, `degree`) have
  list + edit routes with i18n fields, images, and draft/publish. Desk structure parity from the
  spec (Certifications group → Degrees, Certificates; Work group → Projects) was already wired
  into `NavShell` in the Projects plan and needs no changes here — the nav links to
  `/degrees`/`/certifications` already exist and will now resolve to real routes.
- **Placeholder scan:** Task 2 and Task 4 both deliberately embed a wrong first draft of the
  `LocaleField`/`ImageUploader` wiring that the SAME task's steps immediately flag and correct —
  this is intentional (mirrors the real difficulty of getting react-hook-form + a multi-value
  custom component like `LocaleField` to interoperate correctly, which has no established
  precedent in this codebase yet since Projects' only locale-field usage was the hand-built
  `Tabs`+`RichTextEditor` switcher, not `LocaleField` itself) — not an unresolved TBD. The
  implementer must land on the corrected version, not both.
- **Type consistency:** `Certification`/`Degree` (from `shared/types.ts`, prior plan) are
  consumed consistently. `DocumentToolbar`'s unchanged generic interface is reused for both
  content types exactly as designed. The image-upload/placeholder-URL pattern is intentionally
  duplicated from the Projects plan for consistency, with the TODO carried forward at each site.

## Next Plans

- `docs/superpowers/plans/<date>-admin-clients-invoices.md` — Phase 6-7 (clients CRUD, invoice
  schema/form/numbering/list, `InvoiceDocument`, print route). This is also the natural place to
  finally resolve the placeholder image-URL TODO across all content types, since invoices will
  need correct image handling too (issuer/client don't have images, but if a future logo field is
  added, the same gap would recur) — flagged for consideration, not mandated.
