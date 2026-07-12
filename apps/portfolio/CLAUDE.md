# apps/portfolio — Astro Site

The public portfolio site (`@mfranceschit/portfolio`). Astro with `output: 'static'`, Svelte islands for interactivity/animation, and Sanity as the CMS. Repo-wide rules and the design-system HARD rule live in the root `CLAUDE.md`.

## Layout

```
src/
  pages/[locale]/          Astro routes, locale-prefixed (see i18n)
  layouts/BaseLayout.astro Shared shell (head, nav, transitions)
  components/              App-only Astro components (e.g. LanguagePicker)
  components/islands/      Svelte islands (canvas/animation: HeaderWave, TramaBackground, HeroWave)
  lib/                     sanity.ts, transitions.ts, canvas/ (wave math + loop)
  i18n/                    ui.ts (strings), utils.ts (helpers)
  styles/global.css        Imports tailwind + @mfranceschit/ui tokens
```

## Scripts

```bash
pnpm dev          # astro dev
pnpm build        # astro build
pnpm preview      # astro preview
pnpm typecheck    # astro check
```

## Rendering model

- Astro is `output: 'static'`. Pages are `.astro`.
- **React exists only to render `@mfranceschit/ui` components** — do not build app UI in React here.
- **Svelte islands** are for interactive/animated pieces (canvas waves, background trama). Keep them in `components/islands/`.
- Consume the UI library from its barrel: `import { Button, Card, Badge } from '@mfranceschit/ui'`. Never deep-import.
- Alias: `@/` -> `apps/portfolio/src`. Never use `../../`.

## i18n

- Locales: `en`, `es`, `pt`; default `en`. Every page lives under `pages/[locale]/`.
- `/` redirects to `/en/` (configured in `astro.config.mjs`).
- Helpers in `i18n/utils.ts`: `getLangFromUrl`, `useTranslations`, `useTranslatedPath`, `getStaticLocalePaths`. New pages export `getStaticPaths` returning `getStaticLocalePaths()`.
- Strings live in `i18n/ui.ts` keyed like `nav.home`, `contact.send`. **Add every new string to all three locale maps (`en`, `es`, `pt`)** — `useTranslations` falls back to `en` if a key is missing.

## Sanity CMS

- All data access goes through `lib/sanity.ts`: typed `groq` queries plus the exported TS interfaces (`Project`, `ProjectDetail`, `Certificate`, `Degree`).
- The Sanity **schema is fixed** (`project`, `certification`, `degree`, and locale-keyed fields) — do not change it; write queries against it.
- Localized content is fetched by passing the current `locale` into the query (e.g. `description[$locale]`, `issued[$locale]`).
- Server-only secrets come from `process.env`, NOT `import.meta.env` — Vite replaces non-`PUBLIC` server vars with `void 0` in SSR chunks. See the comment in `sanity.ts`.
- Use `renderBlocks()` to flatten Sanity block content to strings.
