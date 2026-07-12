# mfranceschit/developer — AI Coding Rules

Personal portfolio monorepo: an Astro site, a shared React UI library, and a design system.

## Repository Layout

```
apps/
  portfolio/            Astro site (static) — Svelte islands, Sanity CMS, i18n
packages/
  ui/                   Shared React component library (Ark UI + Storybook + tokens)
  typescript-config/    Shared tsconfig bases
```

- **Tooling**: pnpm workspaces + Turborepo. Node >=24, pnpm >=11 (`packageManager: pnpm@11.8.0`).
- **Package names**: `@mfranceschit/portfolio`, `@mfranceschit/ui`, `@mfranceschit/typescript-config`. Workspace deps use `workspace:*`.
- Each package has its own `CLAUDE.md` with area-specific conventions:
  - `apps/portfolio/CLAUDE.md` — routing, i18n, Sanity, Astro/Svelte rendering model.
  - `packages/ui/CLAUDE.md` — component recipe, design tokens, Ark UI patterns.

## Design System — HARD RULE

**All colors and all UI components live in `packages/ui`. Apps consume them by import only.**

- Every visual primitive (buttons, badges, cards, inputs, form fields, avatars, nav) belongs in `packages/ui/src/components/`.
- Every color value is a token in `packages/ui`: a `--mf-*` CSS variable in `src/styles/tokens.css`, and/or an entry in `src/tokens/colors.ts` for JS/canvas/Svelte use.
- Apps must NEVER hand-roll bespoke component markup, use raw `style="..."` attributes, or write ad-hoc hex/rgba values.
- If a design needs something an existing component can't do, **extend the component or add a token in `packages/ui`** — never work around it in app code. This is non-negotiable, even when a bespoke app-level shortcut would be faster.

## Commands

```bash
# Root (Turborepo — runs across all packages)
pnpm dev          # Run all dev servers
pnpm build        # Build all packages
pnpm typecheck    # Type-check all packages
pnpm check        # Biome check (lint) .
pnpm format       # Biome format --write .
```

Per-package scripts are documented in each package's `CLAUDE.md`.

- Do NOT run lint/format commands unprompted — they run automatically in the user's environment. Just write clean code.
- Never attempt to run the project (`pnpm dev`/`build`); the user runs it and reports issues.

## Code Style (Biome-enforced)

- **Single quotes**, trailing commas `all`, 2-space indent, line width 100.
- `import type` for type-only imports.
- External imports first, blank line, then project imports. Biome organizes imports on save.
- No emojis in code or comments. Comments only when the WHY is non-obvious.
- Max 300 lines per file, one component per file.

## Git

- **NEVER commit without explicit user instruction.**
- Do not work on `main` directly; branch first.
- Rebase onto `main` — never merge commits. Never force-push without `--force-with-lease`.
- Commit format: `type(scope): description` (e.g. `feat(portfolio): ...`, `fix(ui): ...`).
- No `Co-Authored-By` lines and no "Generated with Claude Code" footers.
- PR body: Summary (bullets) + Test plan (checklist). Never merge PRs yourself.

## Working Style

- **Minimal changes only** — make exactly what's requested, no "while I'm here" extras.
- **Ask, don't assume** when something is ambiguous.
- **Stop and report** after a task; wait for the next instruction.
