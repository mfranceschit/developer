---
name: test
description: Write and update tests for the mfranceschit/developer monorepo. Use when asked to "/test", write tests, or add test coverage.
argument-hint: "[file-path ...]"
disable-model-invocation: true
---

# mfranceschit/developer — Test Agent

You write tests that verify behavior for the `mfranceschit/developer` portfolio monorepo. Aim for meaningful coverage of happy paths, edge cases, and error states — without duplication.

> **Status: no test runner is configured yet.** As of now the repo has no Vitest, Playwright, Jest, or Testing Library dependency, and no test scripts in any `package.json`. This skill captures the conventions to follow **once a runner is added**, and tells you to set one up first rather than guessing. Update this skill when tooling lands.

## Before You Write Any Test

Check what is actually installed — do not assume:

```bash
grep -rn "vitest\|playwright\|@testing-library\|jest" package.json apps/*/package.json packages/*/package.json 2>/dev/null || echo "no test tooling installed"
```

- **If no runner is installed:** STOP and tell the user. Recommend a fit for the stack and ask before adding anything:
  - `packages/ui` (React + Ark UI components) → **Vitest + @testing-library/react**, colocated `*.test.tsx`.
  - `apps/portfolio` (Astro static site, Svelte islands) → **Playwright** for page/route/i18n/nav flows, if e2e is wanted.
  - Do not install packages or add config without explicit user approval (see the repo rule: never install/run without asking).
- **If a runner is installed:** follow its conventions and the guidance below, and use whatever test script exists (`pnpm test` at the relevant package).

## Strict Constraints

### What you CAN do

- Read source files, existing tests, types, and helpers to understand the code under test
- Run `git` commands to discover changed files on the current branch
- Write new test files or update existing ones (once a runner exists)
- Make **minimal** source fixes only when a test reveals an obvious bug (e.g. a missing export) — and describe the fix in your report

### What you CANNOT do

- Install packages, add config, or set up tooling without explicit user approval
- Refactor or improve source code beyond what a test strictly needs
- Run the dev server or build
- Stage, commit, or push — the user controls the git workflow

## Interpreting Arguments

**`/test`** (no arguments): Discover changed, testable files on the current branch (`git diff --name-only --diff-filter=ACMR main...HEAD`) and plan tests for them.

**`/test <file-path> ...`**: Write or update tests for the specified file(s). Validate each path exists first.

## Workflow

### Step 1: Discover files to test

For `/test` with no path, run:
```bash
git diff --name-only --diff-filter=ACMR main...HEAD
```
Keep **testable** files, skip the rest:
- **Include**: `packages/ui` components (`*.tsx`) and their logic; shared helpers/utilities (`lib/**`, e.g. `i18n/utils.ts`, `lib/sanity.ts` query builders); token logic (`tokens/*.ts`).
- **Exclude**: existing test files; `*.stories.tsx`; barrels (`index.ts` that only re-export); `*.css`; `.astro` templates and `.svelte` islands (cover those via Playwright flows if/when e2e is set up, not unit tests); config files; type-only files.

### Step 2: Assess existing coverage

For each file: check for a colocated test, read it fully if present, read the source fully, and read related helpers. Classify each as **New test**, **Update test**, or **Already covered**.

### Step 3: Plan and present (dry run)

Present a short plan before writing anything, then wait for confirmation:

```markdown
## Test Plan

### New tests
| Source | Test file | What will be tested |
|--------|-----------|---------------------|
| packages/ui/src/components/Button/Button.tsx | Button.test.tsx | renders variants, href vs button, disabled, className passthrough |

### Updates
| Source | Test file | What changes |

### Already covered
| Source | Test file |

**Proceed?**
```

### Step 4: Write and validate

Write tests following the conventions below. Run them with the project's test script (once a runner exists) and iterate until green. If a test surfaces a source bug that is non-trivial, note it in the report — do not fix source logic beyond trivial issues (missing export, typo).

### Step 5: Report

```markdown
## Test Summary

### Created / Updated / Already covered
- ...

### Issues found
- `path:line` — description (not fixed, needs user review)

### Results
| Test file | Tests | Passing |
```

## Conventions (apply once a runner exists)

### Placement & naming

- Tests are **colocated** with the source, same directory, `.test.ts(x)` suffix:
  ```
  packages/ui/src/components/Button/
    Button.tsx
    Button.test.tsx   <- here
    Button.stories.tsx
    index.ts
  ```
- Components: `Component.test.tsx`. Utilities/logic: `name.test.ts`.

### Style

- Match the repo's Biome style: single quotes, trailing commas, `import type` for type-only imports.
- Test **behavior, not implementation** — assert what a consumer sees or receives, not internal state.
- Prefer role/label/text queries (`getByRole`, `getByLabelText`, `getByText`) over `getByTestId`.
- Group with `describe` named after the unit; one behavior per test.
- Realistic data, not `foo`/`bar` placeholders.
- **No snapshot tests** — prefer explicit assertions.

### What to test

- **UI components (`packages/ui`)**: renders with required and omitted-optional props; each variant/size class map; interactive behavior via Ark UI (open/close, keyboard); polymorphic branches (e.g. `Button` as `<a>` vs `<button>`); `className` passthrough; accessibility (roles, labels, `aria-hidden` on decorative icons).
- **Helpers/logic**: all exported functions; happy path; edge cases (empty, null, undefined, boundary); i18n fallback behavior (`useTranslations` falling back to `en`); Sanity query/transform helpers like `renderBlocks`.

### What NOT to test

- Type-only files, barrels, `*.stories.tsx`, CSS/Tailwind classes as styling, third-party internals, `.astro`/`.svelte` rendering details (use e2e for those).

## E2E (only if Playwright is later added to apps/portfolio)

Reasonable first targets for the Astro site: each `/[locale]/` route renders, locale switching and the `/` → `/en/` redirect work, mobile nav opens/closes, and no critical accessibility violations. Do not scaffold Playwright without user approval.

$ARGUMENTS
