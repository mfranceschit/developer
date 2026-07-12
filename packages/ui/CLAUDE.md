# packages/ui — Design System

The shared React component library and design tokens (`@mfranceschit/ui`), built with Ark UI + Tailwind and documented in Storybook. This is the **only** place colors and UI components may live (see the HARD RULE in the root `CLAUDE.md`).

## Layout

```
src/
  components/[Name]/
    [Name].tsx           Component (Ark UI primitive + Tailwind + tokens)
    [Name].stories.tsx   Storybook story (required for every component)
    index.ts             Barrel
  components/index.ts     Re-exports every component AND its prop/variant types
  tokens/colors.ts        Brand color ramps as a typed `const` object
  tokens/index.ts         Barrel
  styles/tokens.css       :root CSS variables (--mf-*)
  styles/tailwind.css
  foundations/*.stories.tsx  Colors, Typography, Spacing, Brand docs
  index.ts                Public API: export * from components + tokens
```

## Scripts

```bash
pnpm storybook        # Storybook dev on :6006
pnpm build-storybook
pnpm typecheck        # tsc --noEmit
```

## Component recipe

To add or change a component:

1. Create `src/components/[Name]/` with `[Name].tsx`, `[Name].stories.tsx`, `index.ts`.
2. Write the component as a **named function declaration**: `export function Button(props: ButtonProps) { ... }` — not an arrow const.
3. Use **Ark UI** (`@ark-ui/react`) for any interactive primitive (menus, dialogs, etc.).
4. Export the component **and its prop/variant types** from `components/index.ts`.
5. Add a Storybook story covering the meaningful variants/states.

**Styling pattern** (see `Button.tsx` as the reference):
- Define variants as `const variantClasses: Record<Variant, string>` of Tailwind class strings; same for sizes.
- Keep a `base` string of shared classes, then compose: `[base, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ')`.
- Reference design-system values through tokens as Tailwind arbitrary values: `bg-[var(--surface-btn-accent)]`, `shadow-[var(--shadow-glow-accent-cta)]`.
- Accept `className` for consumer overrides and pass through `data-*` attributes; do not spread arbitrary props onto DOM elements.
- Comment only non-obvious WHY (e.g. why a `glass`/`gradient` variant exists).

## Tokens

Two token surfaces, kept in sync:

- **`styles/tokens.css`** — `:root` CSS variables named `--mf-*` (brand primitives + ramps like `--mf-blue-700`, `--mf-berry-600`, plus semantic tokens like `--surface-*`, `--border-*`, `--gradient-*`, `--shadow-*`). This is what components and app CSS reference.
- **`tokens/colors.ts`** — the same brand palette as a typed `const` object (`colors.bellwetherBlue`, `colors.blue[700]`, ...), exported for JS consumers that can't read CSS vars: canvas/animation math and Svelte islands.

Rules:
- **A new color is a token first.** Add it to `tokens.css` (and `colors.ts` if JS needs it) before using it anywhere. Never introduce a raw hex/rgba in a component or app.
- Follow the existing ramp naming (`50 … 900/950`) and the `--mf-` prefix.
- Semantic/component tokens (surfaces, borders, shadows, gradients) belong in `tokens.css`; reference those from components rather than raw brand ramps where a semantic name exists.
