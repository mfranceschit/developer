# Editable About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio About page editable from the admin studio, mirroring how Certifications and Work (Projects) are edited.

**Architecture:** Introduce a new `about` Sanity singleton that follows the draft/publish content model. The admin gets a single-document edit route (eyebrow/title as locale strings, body as per-locale portable text, tech stack as a comma-separated list) reusing the existing seam and `DocumentToolbar`. The portfolio About page is rewired to read the published `about` document instead of static i18n. A one-time seed publishes the current i18n content so nothing regresses.

**Tech Stack:** TanStack Start/Router, react-hook-form + zod, `@sanity/client`, `@mfranceschit/ui`, vitest, Astro.

## Global Constraints

- Node >=24, pnpm. `node`/`pnpm` are not on Claude Code's PATH — run every node command as `fnm exec -- <command>` (e.g. `fnm exec -- pnpm --filter @mfranceschit/admin test`).
- Biome style: single quotes, trailing commas `all`, 2-space indent, line width 100. `import type` for type-only imports. External imports first, blank line, then `@/` imports. No emojis. Comments only when the WHY is non-obvious. Do NOT run lint/format commands — they run automatically in the user's environment.
- Admin imports: alias `@/` → `apps/admin/src`; never use `../`/`../../` for cross-directory imports. Consume UI from the barrel `@mfranceschit/ui`; never deep-import.
- Design-system HARD rule: all components/colors come from `@mfranceschit/ui`; app code never hand-rolls primitives or writes raw hex/rgba. Layout-only Tailwind (flex/grid/spacing) is fine.
- The seam: browser never touches Sanity. `routes/`/`features/`/`widgets/` may import only `server/functions/*`, never `@sanity/client` or `server/sanity/*`. Server-only secrets come from `process.env`, NOT `import.meta.env`.
- Do NOT edit or commit `apps/admin/src/routeTree.gen.ts` (generated + gitignored).
- Do NOT change existing Sanity document shapes; `about` is a brand-new type.
- Never commit unless executing under the user's direction; the user controls commits. Commit steps below are the standard TDD cadence for the executor.

---

### Task 1: `about` schema + type

**Files:**
- Modify: `apps/admin/src/shared/schemas.ts`
- Modify: `apps/admin/src/shared/types.ts`
- Test: `apps/admin/src/shared/schemas.test.ts`

**Interfaces:**
- Produces: `aboutSchema` (zod) and `About = z.infer<typeof aboutSchema>` with fields `_id: 'about' | 'drafts.about'`, `_type: 'about'`, `eyebrow: LocaleString`, `title: LocaleString`, `body: LocaleContent`, `stack: string[]`.

- [ ] **Step 1: Write the failing test**

Add to `apps/admin/src/shared/schemas.test.ts` (add `aboutSchema` to the existing import from `./schemas`):

```typescript
describe('aboutSchema', () => {
  it('parses a full about document', () => {
    const result = aboutSchema.parse({
      _id: 'about',
      _type: 'about',
      eyebrow: { en: 'Build', es: 'Build', pt: 'Build' },
      title: { en: 'Me', es: 'Yo', pt: 'Eu' },
      body: { en: [{ _type: 'block', children: [{ text: 'hi' }] }], es: [], pt: [] },
      stack: ['TypeScript', 'React'],
    });
    expect(result.title.en).toBe('Me');
    expect(result.stack).toEqual(['TypeScript', 'React']);
  });

  it('defaults es/pt locale strings and empty stack', () => {
    const result = aboutSchema.parse({
      _id: 'drafts.about',
      _type: 'about',
      eyebrow: { en: 'Build' },
      title: { en: 'Me' },
      body: { en: [] },
      stack: [],
    });
    expect(result.eyebrow.es).toBe('');
    expect(result.title.pt).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin test schemas`
Expected: FAIL — `aboutSchema` is not exported from `./schemas`.

- [ ] **Step 3: Add the schema**

In `apps/admin/src/shared/schemas.ts`, after `degreeSchema`, add:

```typescript
export const aboutSchema = z.object({
  _id: z.union([z.literal('about'), z.literal('drafts.about')]),
  _type: z.literal('about'),
  eyebrow: localeStringSchema,
  title: localeStringSchema,
  body: localeContentSchema,
  stack: z.array(z.string()),
});
```

- [ ] **Step 4: Add the type**

In `apps/admin/src/shared/types.ts`, add `aboutSchema` to the type-import list from `./schemas` (keep alphabetical) and add near the other document types:

```typescript
export type About = z.infer<typeof aboutSchema>;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin test schemas`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/shared/schemas.ts apps/admin/src/shared/types.ts apps/admin/src/shared/schemas.test.ts
git commit -m "feat(admin): add about document schema and type"
```

---

### Task 2: `about` singleton draft write (server seam)

**Files:**
- Create: `apps/admin/src/server/sanity/about.ts`
- Test: `apps/admin/src/server/sanity/about.test.ts`

**Interfaces:**
- Consumes: `About` from `@/shared/types`; `draftSanityClient` from `./client`.
- Produces: `upsertAboutDraft(doc: Omit<About, '_id' | '_type'>): Promise<About>` — `createOrReplace` onto `drafts.about`.

- [ ] **Step 1: Write the failing test**

Create `apps/admin/src/server/sanity/about.test.ts`:

```typescript
import { describe, expect, it, vi } from 'vitest';

vi.mock('./client', () => ({
  draftSanityClient: {
    createOrReplace: vi.fn(),
  },
}));

import { draftSanityClient } from './client';
import { upsertAboutDraft } from './about';

describe('upsertAboutDraft', () => {
  it('createOrReplaces onto the fixed draft id', async () => {
    vi.mocked(draftSanityClient.createOrReplace).mockImplementation(async (doc) => doc as never);
    const result = await upsertAboutDraft({
      eyebrow: { en: 'Build', es: '', pt: '' },
      title: { en: 'Me', es: 'Yo', pt: 'Eu' },
      body: { en: [], es: [], pt: [] },
      stack: ['TypeScript'],
    });
    expect(draftSanityClient.createOrReplace).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'drafts.about', _type: 'about' }),
    );
    expect(result.title.en).toBe('Me');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin test about`
Expected: FAIL — `./about` module not found.

- [ ] **Step 3: Implement**

Create `apps/admin/src/server/sanity/about.ts`:

```typescript
import type { About } from '@/shared/types';
import { draftSanityClient } from './client';

export async function upsertAboutDraft(doc: Omit<About, '_id' | '_type'>): Promise<About> {
  const result = await draftSanityClient.createOrReplace({
    ...doc,
    _id: 'drafts.about',
    _type: 'about',
  });
  return result as unknown as About;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin test about`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/server/sanity/about.ts apps/admin/src/server/sanity/about.test.ts
git commit -m "feat(admin): add about singleton draft upsert"
```

---

### Task 3: Server function + query hooks

**Files:**
- Create: `apps/admin/src/server/functions/about.ts`
- Modify: `apps/admin/src/features/content/queries.ts`

**Interfaces:**
- Consumes: `upsertAboutDraft` from `@/server/sanity/about`; existing `getDocumentFn` from `@/server/functions/content`; existing `usePublish`/`useDiscard` from this file; `About`/`DocumentStatus` from `@/shared/types`.
- Produces:
  - `upsertAboutDraftFn` — server function, `POST`, `strict: { output: false }`.
  - `useAbout()` — `useQuery` returning `Promise<(About & { _status: DocumentStatus }) | null>`, key `['content', 'about', 'detail']`.
  - `useUpsertAboutDraft()` — `useMutation` over `upsertAboutDraftFn`, invalidates `['content']`.

- [ ] **Step 1: Create the server function**

Create `apps/admin/src/server/functions/about.ts`:

```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { upsertAboutDraft } from '@/server/sanity/about';

export const upsertAboutDraftFn = createServerFn({ method: 'POST', strict: { output: false } })
  .validator(z.record(z.string(), z.unknown()))
  .handler(async ({ data }) => upsertAboutDraft(data as never));
```

- [ ] **Step 2: Add the query hooks**

In `apps/admin/src/features/content/queries.ts`, add `getDocumentFn` to the existing import from `@/server/functions/content`, add a new import for the about function, and a type import:

```typescript
import { upsertAboutDraftFn } from '@/server/functions/about';
import type { About, DocumentStatus } from '@/shared/types';
```

Append these hooks at the end of the file:

```typescript
export function useAbout() {
  return useQuery({
    queryKey: ['content', 'about', 'detail'],
    queryFn: () =>
      getDocumentFn({ data: { type: 'about', id: 'about' } }) as Promise<
        (About & { _status: DocumentStatus }) | null
      >,
  });
}

export function useUpsertAboutDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (doc: Record<string, unknown>) =>
      upsertAboutDraftFn({ data: doc }) as Promise<About>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}
```

- [ ] **Step 3: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin typecheck`
Expected: PASS (no errors).

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/server/functions/about.ts apps/admin/src/features/content/queries.ts
git commit -m "feat(admin): add about server function and query hooks"
```

---

### Task 4: Admin About edit route + navigation

**Files:**
- Create: `apps/admin/src/routes/about.tsx`
- Modify: `apps/admin/src/widgets/NavShell/NavShell.tsx`

**Interfaces:**
- Consumes: `useAbout`, `useUpsertAboutDraft`, `usePublish`, `useDiscard` from `@/features/content/queries`; `About`, `DocumentStatus` from `@/shared/types`; `DocumentToolbar` widget; UI barrel components.

- [ ] **Step 1: Create the route**

Create `apps/admin/src/routes/about.tsx`. This mirrors the projects edit route (`Tabs` + `RichTextEditor` for per-locale body, comma-separated `Input` for stack) and the certifications route (`LocaleField` for eyebrow/title), but as a singleton (always upsert the draft — no `new` mode):

```typescript
import {
  Button,
  FormField,
  Input,
  LocaleField,
  RichTextEditor,
  type RichTextEditorProps,
  Tabs,
} from '@mfranceschit/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  useAbout,
  useDiscard,
  usePublish,
  useUpsertAboutDraft,
} from '@/features/content/queries';
import type { About } from '@/shared/types';
import { DocumentToolbar } from '@/widgets/DocumentToolbar/DocumentToolbar';

export const Route = createFileRoute('/about')({
  component: AboutEditPage,
});

type PortableTextValue = RichTextEditorProps['value'];

const formSchema = z.object({
  eyebrowEn: z.string(),
  eyebrowEs: z.string(),
  eyebrowPt: z.string(),
  titleEn: z.string().min(1, 'Title is required'),
  titleEs: z.string(),
  titlePt: z.string(),
  bodyEn: z.custom<PortableTextValue>(),
  bodyEs: z.custom<PortableTextValue>(),
  bodyPt: z.custom<PortableTextValue>(),
  stack: z.string(),
});

type AboutFormValues = z.infer<typeof formSchema>;

function toFormValues(about?: About | null): AboutFormValues {
  return {
    eyebrowEn: about?.eyebrow.en ?? '',
    eyebrowEs: about?.eyebrow.es ?? '',
    eyebrowPt: about?.eyebrow.pt ?? '',
    titleEn: about?.title.en ?? '',
    titleEs: about?.title.es ?? '',
    titlePt: about?.title.pt ?? '',
    bodyEn: (about?.body.en as PortableTextValue | undefined) ?? [],
    bodyEs: (about?.body.es as PortableTextValue | undefined) ?? [],
    bodyPt: (about?.body.pt as PortableTextValue | undefined) ?? [],
    stack: about?.stack?.join(', ') ?? '',
  };
}

function AboutEditPage() {
  const { toaster } = Route.useRouteContext();
  const { data: about } = useAbout();
  const upsert = useUpsertAboutDraft();
  const publish = usePublish();
  const discard = useDiscard();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, errors },
  } = useForm<AboutFormValues>({
    values: toFormValues(about),
    resolver: zodResolver(formSchema),
  });

  const [eyebrowEn, eyebrowEs, eyebrowPt, titleEn, titleEs, titlePt] = useWatch({
    control,
    name: ['eyebrowEn', 'eyebrowEs', 'eyebrowPt', 'titleEn', 'titleEs', 'titlePt'],
  });

  async function onSubmit(values: AboutFormValues) {
    await upsert.mutateAsync({
      eyebrow: { en: values.eyebrowEn, es: values.eyebrowEs, pt: values.eyebrowPt },
      title: { en: values.titleEn, es: values.titleEs, pt: values.titlePt },
      body: { en: values.bodyEn, es: values.bodyEs, pt: values.bodyPt },
      stack: values.stack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    toaster.create({ title: 'About saved', type: 'success' });
  }

  return (
    <form className="flex flex-col gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <h1 className="font-sans text-xl font-semibold text-[var(--text-strong)]">About</h1>
        <DocumentToolbar
          status={about?._status ?? 'draft'}
          dirty={isDirty}
          onPublish={async () => {
            await publish.mutateAsync({ id: 'about' });
          }}
          onDiscard={async () => {
            await discard.mutateAsync({ id: 'about' });
          }}
          toaster={toaster}
        />
      </div>

      <FormField label="Eyebrow">
        <LocaleField
          value={{ en: eyebrowEn, es: eyebrowEs, pt: eyebrowPt }}
          onValueChange={(locale, value) => {
            setValue(
              `eyebrow${locale[0].toUpperCase()}${locale.slice(1)}` as
                | 'eyebrowEn'
                | 'eyebrowEs'
                | 'eyebrowPt',
              value,
              { shouldDirty: true },
            );
          }}
        />
      </FormField>

      <FormField label="Title" required error={errors.titleEn?.message}>
        <LocaleField
          value={{ en: titleEn, es: titleEs, pt: titlePt }}
          onValueChange={(locale, value) => {
            setValue(
              `title${locale[0].toUpperCase()}${locale.slice(1)}` as
                | 'titleEn'
                | 'titleEs'
                | 'titlePt',
              value,
              { shouldDirty: true },
            );
          }}
        />
      </FormField>

      <FormField label="Stack" hint="Comma-separated" error={errors.stack?.message}>
        <Input {...register('stack')} />
      </FormField>

      <FormField label="Body">
        <Tabs
          items={[
            {
              value: 'en',
              label: 'English',
              content: (
                <Controller
                  control={control}
                  name="bodyEn"
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
                  name="bodyEs"
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
                  name="bodyPt"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onValueChange={field.onChange} />
                  )}
                />
              ),
            },
          ]}
        />
      </FormField>

      <Button type="submit" className="self-start">
        Save draft
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Add the nav entry**

In `apps/admin/src/widgets/NavShell/NavShell.tsx`, add a new group to `NAV_GROUPS` (place it before `Billing`):

```typescript
  {
    label: 'Site',
    links: [{ to: '/about', label: 'About' }],
  },
```

- [ ] **Step 3: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/admin typecheck`
Expected: PASS. (The router plugin regenerates `routeTree.gen.ts` on dev/build; if typecheck complains the `/about` route is unknown, run `fnm exec -- pnpm --filter @mfranceschit/admin build` once to regenerate, but never commit that file.)

- [ ] **Step 4: Commit**

```bash
git add apps/admin/src/routes/about.tsx apps/admin/src/widgets/NavShell/NavShell.tsx
git commit -m "feat(admin): add about edit route and Site nav group"
```

---

### Task 5: Seed + publish the About document

Seeds the published `about` document from the current i18n values so the live page shows identical content after the switch. This is a one-off script run once with the admin's write token.

**Files:**
- Create: `apps/admin/scripts/seedAbout.ts`

- [ ] **Step 1: Write the seed script**

Create `apps/admin/scripts/seedAbout.ts`. Copy the four `en`/`es`/`pt` paragraph strings verbatim from `apps/portfolio/src/i18n/ui.ts` (`aboutDescriptions`) into the arrays below, and the stack from `about.astro`. The script writes directly to the **published** `about` id (an initial publish):

```typescript
import { randomUUID } from 'node:crypto';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION ?? '2023-12-08',
  token: process.env.SANITY_TOKEN,
  useCdn: false,
});

function toBlocks(paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: 'block',
    _key: randomUUID(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: randomUUID(), text, marks: [] }],
  }));
}

// Copy verbatim from apps/portfolio/src/i18n/ui.ts -> aboutDescriptions.en
const bodyEn: string[] = [
  'PARAGRAPH 1 EN',
  'PARAGRAPH 2 EN',
  'PARAGRAPH 3 EN',
  'PARAGRAPH 4 EN',
];
const bodyEs: string[] = [
  'PARAGRAPH 1 ES',
  'PARAGRAPH 2 ES',
  'PARAGRAPH 3 ES',
  'PARAGRAPH 4 ES',
];
const bodyPt: string[] = [
  'PARAGRAPH 1 PT',
  'PARAGRAPH 2 PT',
  'PARAGRAPH 3 PT',
  'PARAGRAPH 4 PT',
];

const doc = {
  _id: 'about',
  _type: 'about',
  eyebrow: {
    en: 'Build · Test · Automate',
    es: 'Build · Test · Automate',
    pt: 'Build · Test · Automate',
  },
  title: { en: 'Me', es: 'Yo', pt: 'Eu' },
  body: { en: toBlocks(bodyEn), es: toBlocks(bodyEs), pt: toBlocks(bodyPt) },
  stack: [
    'JavaScript',
    'TypeScript',
    'Python',
    'React',
    'Node.js',
    'Astro',
    'AWS',
    'GCP',
    'Azure',
    'Terraform',
    'Docker',
    'New Relic',
  ],
};

async function main() {
  await client.createOrReplace(doc);
  console.log('Seeded published about document.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Replace every `PARAGRAPH N XX` placeholder with the exact string from `aboutDescriptions` in `apps/portfolio/src/i18n/ui.ts` before running. (These are the only intentional fill-ins in this plan — they are exact copies of in-repo content, sourced from the named file.)

- [ ] **Step 2: Run the seed script**

Loads the admin's env (`apps/admin/.env`) so `SANITY_TOKEN` etc. are available, then runs the script with tsx:

Run: `cd apps/admin && fnm exec -- pnpm dlx dotenv-cli -e .env -- pnpm dlx tsx scripts/seedAbout.ts`
Expected: prints `Seeded published about document.` with no error.

- [ ] **Step 3: Verify in the admin**

Start the admin dev server (user does this in their own process) and open `/about`. Confirm the form loads the seeded eyebrow, title, four body paragraphs per locale, and the 12 stack chips, and that `DocumentToolbar` shows status "published".

- [ ] **Step 4: Commit**

```bash
git add apps/admin/scripts/seedAbout.ts
git commit -m "chore(admin): add one-off about seed script"
```

---

### Task 6: Portfolio `getAbout` query

**Files:**
- Modify: `apps/portfolio/src/lib/sanity.ts`

**Interfaces:**
- Consumes: existing `sanityClient`, `groq`, `SanityBlock`, `renderBlocks` in this file.
- Produces: `About` interface (`eyebrow: string; title: string; body: SanityBlock[]; stack: string[]`) and `getAbout(locale?: string): Promise<About | null>`.

- [ ] **Step 1: Add the interface and query**

In `apps/portfolio/src/lib/sanity.ts`, after the `Degree` interface add:

```typescript
export interface About {
  eyebrow: string;
  title: string;
  body: SanityBlock[];
  stack: string[];
}
```

And after `getDegrees`, add:

```typescript
export async function getAbout(locale = 'en'): Promise<About | null> {
  return sanityClient.fetch(
    groq`*[_type == "about"][0]{
      "eyebrow": eyebrow[$locale],
      "title": title[$locale],
      "body": body[$locale],
      stack
    }`,
    { locale },
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/portfolio/src/lib/sanity.ts
git commit -m "feat(portfolio): add getAbout sanity query"
```

---

### Task 7: Rewire About page + i18n cleanup

**Files:**
- Modify: `apps/portfolio/src/pages/[locale]/about.astro`
- Modify: `apps/portfolio/src/i18n/ui.ts`

**Interfaces:**
- Consumes: `getAbout`, `renderBlocks` from `@/lib/sanity`.

- [ ] **Step 1: Rewire the page**

Replace the frontmatter and body of `apps/portfolio/src/pages/[locale]/about.astro`. Remove the `aboutDescriptions` import and the hard-coded `stack` array; source eyebrow/title/paragraphs/stack from `getAbout`. Keep SEO meta (`t('meta.about.*')`) and the "Technologies" heading (`t('projects.stack')`) on i18n:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { Badge } from '@mfranceschit/ui';
import { useTranslations, getStaticLocalePaths } from '@/i18n/utils';
import type { Locale } from '@/i18n/utils';
import { getAbout, renderBlocks } from '@/lib/sanity';

export function getStaticPaths() {
  return getStaticLocalePaths();
}

const { locale } = Astro.params as { locale: Locale };
const t = useTranslations(locale);
const about = await getAbout(locale);
const eyebrow = about?.eyebrow ?? '';
const title = about?.title ?? '';
const paragraphs = about ? renderBlocks(about.body) : [];
const stack = about?.stack ?? [];
---

<BaseLayout title={t('meta.about.title')} description={t('meta.about.description')} lang={locale} currentPath="/about">
  <section class="mx-auto max-w-[720px] px-6 pb-[120px] pt-[56px]">
    {eyebrow && <p class="mf-eyebrow mb-3">{eyebrow}</p>}
    <h1 class="mb-[30px] text-[44px] font-bold tracking-tight text-white">
      {title}
    </h1>
    <div class="flex flex-col gap-4 text-[16px] leading-[1.7] text-[var(--text-body)]">
      {paragraphs.map((paragraph) => <p>{paragraph}</p>)}
    </div>
    <h3 class="mb-3.5 mt-10 text-[22px] font-semibold text-[var(--text-heading)]">{t('projects.stack')}</h3>
    <div class="flex flex-wrap gap-2">
      {
        stack.map((tech) => (
          <Badge tone="tint-accent" pill={false}>
            {tech}
          </Badge>
        ))
      }
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Confirm no other references to the dead i18n entries**

Run: `cd apps/portfolio && grep -rn "aboutDescriptions\|about\.eyebrow\|about\.title" src`
Expected: only matches inside `src/i18n/ui.ts` (definitions). If anything else references them, stop and reconcile before deleting.

- [ ] **Step 3: Remove the dead i18n entries**

In `apps/portfolio/src/i18n/ui.ts`, remove the entire `aboutDescriptions` export (all three locale arrays) and the `'about.eyebrow'` and `'about.title'` keys from each of the `en`/`es`/`pt` translation objects. Keep `meta.about.title`, `meta.about.description`, and `projects.stack`.

- [ ] **Step 4: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: PASS.

- [ ] **Step 5: Verify the rendered page**

The user runs the portfolio dev server (their own process). Load `/en/about`, `/es/about`, `/pt/about` and confirm eyebrow, title, the four paragraphs, and the 12 stack chips render identically to before the change, sourced from Sanity.

- [ ] **Step 6: Commit**

```bash
git add apps/portfolio/src/pages/'[locale]'/about.astro apps/portfolio/src/i18n/ui.ts
git commit -m "feat(portfolio): render about page from sanity"
```

---

## Self-Review

**Spec coverage:**
- Data model (`about` singleton, eyebrow/title/body/stack) → Task 1. ✓
- Admin seam (draft upsert, server function, publish/discard reuse) → Tasks 2-3. ✓
- Admin route + "Site" nav → Task 4. ✓
- Portfolio `getAbout` + `about.astro` rewire → Tasks 6-7. ✓
- i18n cleanup → Task 7. ✓
- Rollout/no-regression seed → Task 5. ✓
- Testing (schema, server seam; UI via typecheck, matching the codebase's untested UI convention) → Tasks 1-2 have unit tests; UI tasks typecheck. ✓
- SEO meta / "Technologies" heading stay on i18n → Task 7 keeps `t('meta.about.*')` and `t('projects.stack')`. ✓

**Deviation from spec (intentional, leaner):** the spec described a `getAbout()` wrapper in `server/sanity/about.ts`; the plan instead reads through the existing generic `getDocumentFn('about','about')` seam (Task 3 `useAbout`), so `server/sanity/about.ts` only holds the write. This reuses more of the existing seam and still resolves `_status` identically.

**Type consistency:** `About` fields (`eyebrow`/`title`/`body`/`stack`) are used consistently across schema (Task 1), server upsert (Task 2), hooks (Task 3), route form assembly (Task 4), and the portfolio interface (Task 6). Publish/discard use the literal id `'about'` everywhere (Task 4). Form field names (`eyebrowEn`… `bodyEn`… `stack`) match between `formSchema`, `toFormValues`, `useWatch`, and `onSubmit`.

**Placeholder scan:** the only fill-ins are the `PARAGRAPH N XX` seed strings (Task 5), which are exact copies of existing in-repo content from a named file — flagged explicitly, not open-ended.
