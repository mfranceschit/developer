# Editable About Page — Design

**Date:** 2026-07-13
**Status:** Approved (design)

## Problem

The portfolio About page (`apps/portfolio/src/pages/[locale]/about.astro`) is the only
main content page that is **not** Sanity-backed. Its content is hard-coded in the app:

- **Body paragraphs** — `aboutDescriptions` in `apps/portfolio/src/i18n/ui.ts` (array of
  strings per locale).
- **Tech stack chips** — a hard-coded 12-item array literal inside `about.astro`.
- **Eyebrow / title** — i18n translation keys (`about.eyebrow`, `about.title`).

Certifications, Degrees, and Projects ("Work") are already Sanity-backed and editable from
the custom admin studio (`apps/admin`). The goal is to make the About page editable from the
admin **the same way** those content types are.

## Scope

**In scope (editable from admin):**

- Body paragraphs
- Tech stack chips
- Eyebrow + title

**Out of scope (stays on i18n):**

- SEO meta (`meta.about.title`, `meta.about.description`)
- The "Technologies" section heading (`projects.stack`) — a static label, not content.

## Approach

Model `about` as a **draft/publish singleton** (fixed id `about` / `drafts.about`),
matching the Certifications/Work content model rather than the direct-write `businessProfile`
singleton.

Rationale: About is public-facing portfolio content, so it should get preview-before-publish
and the same `DocumentToolbar` (Publish / Discard / status) behavior as the other content
types the user asked to mirror. The direct-write alternative (like `businessProfile`) is
simpler but inconsistent with "like Certifications/Work" and skips publish control.

The existing seam already supports this with almost no new plumbing:

- `publishDocument(id)` / `discardDraft(id)` derive `drafts.about` / `about` from the id via
  `toDraftId` / `toPublishedId` — they work for a singleton unchanged.
- `getDocument('about', 'about')` resolves `_status` and prefers the draft — works for a
  singleton.
- The only gap is the **draft write**: the generic `createDraft` mints a random UUID (wrong
  for a fixed-id singleton). The singleton needs an upsert onto `drafts.about` — the
  `businessProfile` mechanic pointed at the draft id.

## Data model

New Sanity document type `about` (singleton).

`apps/admin/src/shared/schemas.ts` — `aboutSchema`:

```
about {
  _id: 'about' | 'drafts.about'
  _type: 'about'
  eyebrow: localeString    // { en, es, pt } — e.g. "Build · Test · Automate"
  title:   localeString    // "Me" / "Yo" / "Eu"
  body:    localeContent   // per-locale portable text (the bio paragraphs)
  stack:   string[]        // tech chips
}
```

Reuses `localeStringSchema` and `localeContentSchema`. `apps/admin/src/shared/types.ts`
exports `About = z.infer<typeof aboutSchema>`.

Eyebrow text is currently identical across locales, but it is modeled as `localeString` for
consistency with the pattern and to keep it flexible; `es`/`pt` default to `''` per the
existing locale schemas.

## Admin implementation

### Seam (`server/`)

- `server/sanity/about.ts`
  - `getAbout()` — delegates to the existing `getDocument('about', 'about')` so `_status`
    resolves the same way as other content.
  - `upsertAboutDraft(doc)` — `draftSanityClient.createOrReplace` onto `drafts.about` with
    `_type: 'about'` (businessProfile-style upsert, but at the draft id).
- `server/functions/about.ts`
  - `getAboutFn` (`GET`, `strict: { output: false }`).
  - `upsertAboutDraftFn` (`POST`, `strict: { output: false }`).
  - Publish/Discard **reuse** the existing generic `publishDocumentFn` / `discardDraftFn`
    with `id: 'about'`. No new publish plumbing.

### Query hooks (`features/content/queries.ts`)

- `useAbout()` — `useQuery` over `getAboutFn`, query key `['content', 'about', 'detail']`.
- `useUpsertAboutDraft()` — `useMutation` over `upsertAboutDraftFn`, invalidates
  `['content']` on success.
- Publish/Discard reuse the existing `usePublish()` / `useDiscard()` with `id: 'about'`.

### Route (`routes/about.tsx`)

Singleton edit page — no list route (like `settings/business-profile`), but **with**
`DocumentToolbar` for Publish/Discard/status. react-hook-form + zod form-level schema
(distinct from the document schema), following the existing edit-route conventions:

- **Eyebrow** + **Title** → `LocaleField` (certifications-route pattern: `useWatch` +
  `setValue(..., { shouldDirty: true })`).
- **Body** → `Tabs` + `RichTextEditor` per locale (projects-route `description` pattern),
  stored as `localeContent`.
- **Stack** → comma-separated `Input` (hint "Comma-separated"), split on `,` / trim / filter
  empties on submit, joined back for the form value (projects-route `technologies` pattern).
- Submit calls `useUpsertAboutDraft`. Toolbar wires `usePublish` / `useDiscard` with
  `id: 'about'`. Toast on save, matching the other routes.

### Navigation (`widgets/NavShell/NavShell.tsx`)

Add a new nav group **"Site"** with a single link **"About"** → `/about`.

## Portfolio implementation

### `apps/portfolio/src/lib/sanity.ts`

Add an `About` interface and `getAbout(locale)` GROQ query returning the localized `eyebrow`,
`title`, the localized `body` blocks, and `stack`. Body blocks run through the existing
`renderBlocks` helper (same as project descriptions) to produce paragraph strings.

### `apps/portfolio/src/pages/[locale]/about.astro`

- Source eyebrow, title, paragraphs, and stack from `getAbout(locale)` instead of
  `aboutDescriptions` and the hard-coded array.
- SEO meta (`t('meta.about.*')`) and the "Technologies" heading (`t('projects.stack')`) stay
  on i18n.
- Handle a null/absent `about` doc gracefully (render empty sections) so a static build never
  breaks if the doc is missing.

### i18n cleanup (`apps/portfolio/src/i18n/ui.ts`)

Remove the now-dead `aboutDescriptions` export and the `about.eyebrow` / `about.title` keys,
after grep-confirming no other references. Keep `meta.about.*` and `projects.stack`.

## Rollout / no-regression

The portfolio reads **published** documents only (`sanityClient`, no token). So a one-time
step **seeds and publishes** the `about` document from the current tri-lingual i18n values
(eyebrow, title, the four paragraphs per locale as portable-text blocks, and the current
12-item stack). This ensures the live page shows the same content immediately after the
switch. `about.astro`'s null-handling is the safety net if the doc is ever missing.

## Testing

Follow the existing admin test conventions (vitest, colocated `*.test.ts`):

- `server/sanity/about.test.ts` — `getAbout` delegation and `upsertAboutDraft` upsert onto
  `drafts.about` with the right `_type`.
- `shared/schemas.test.ts` — extend with `aboutSchema` parse/defaults coverage.
- The route reuses already-tested generic publish/discard, so no new publish tests are
  needed.

## Files touched

**apps/admin**

- `src/shared/schemas.ts` (add `aboutSchema`)
- `src/shared/types.ts` (add `About`)
- `src/server/sanity/about.ts` (new)
- `src/server/sanity/about.test.ts` (new)
- `src/server/functions/about.ts` (new)
- `src/features/content/queries.ts` (add `useAbout`, `useUpsertAboutDraft`)
- `src/routes/about.tsx` (new)
- `src/widgets/NavShell/NavShell.tsx` (add "Site" group)
- `src/shared/schemas.test.ts` (extend)

**apps/portfolio**

- `src/lib/sanity.ts` (add `About` + `getAbout`)
- `src/pages/[locale]/about.astro` (read from Sanity)
- `src/i18n/ui.ts` (remove dead entries)

Plus a one-time seed of the published `about` document.
