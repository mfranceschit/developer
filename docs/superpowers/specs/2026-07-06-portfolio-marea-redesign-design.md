# Portfolio Redesign — Hero "Marea v2" (2a) + Interior Pages (6a–6d)

**Date:** 2026-07-06
**App:** `apps/portfolio` (Astro + Svelte islands, Tailwind v4, tokens from `@mfranceschit/ui`, Sanity, Biome)
**Source of truth:** `docs/design_handoff_portfolio_redesign/README.md` and the `class Component` script at the bottom of `docs/design_handoff_portfolio_redesign/Rediseño mfranceschit.dc.html`.

## Goal

Recreate the approved dark-navy "liquid sound" redesign inside the existing monorepo, following repo conventions (Tailwind v4, tokens, Biome, Svelte islands, Sanity wiring). Five specced screens: Home/Hero (2a), Projects list (6a), Project detail (6b), Certifications (6c), Contact (6d). Visuals are final and must be reproduced faithfully, scaling fluidly to real viewport widths (the 1240×760 / 390×844 frames are references, not fixed sizes).

## Scope

**In scope**
- Convert the whole shell (`BaseLayout.astro`) to the dark design. Per owner decision this includes darkening `about` (which is otherwise not in the mock) so the site is visually consistent.
- Rebuild the five specced pages with bespoke dark markup (Tailwind arbitrary values mapping to tokens where they exist).
- Port these canonical methods to plain TS inside Svelte islands: `hero2`, `trama`, `hdrWave`, `makePluck`, `makeScrollRef`, `beatEnv` (plus the small shared helpers `gauss`, `rgba`, `accents`, and the `initCanvas` setup logic).
- Wire projects/certifications to the existing Sanity queries (unchanged).
- Reuse existing i18n keys (`nav.*`, `home.title`/`home.subtitle`, `contact.*`, `projects.*`, `certifications.*`).

**Out of scope (explicit)**
- `pageWave` (the decorative bottom-of-page footer tide) — the README's interior background is the trama; `pageWave` is not in the port list. The scroll-progress **header** wave (`hdrWave`) IS in scope.
- Legacy reference methods `marea`, `marea2`, `espectro`, `pulso`, `cuerda`, `staff`, `reson`, `depth`, `uline` (superseded exploration turns 1, 3–5).
- Mobile-specific hero variant (`heromob`) as a separate island — the single `HeroWave` scales fluidly; the `sc` mobile-scale branch of `hero2` is not needed because we compute geometry from the real canvas height. (Responsive behavior is achieved with CSS + fluid canvas sizing, matching the "scale to viewport" instruction.)
- New i18n keys. The "72 BPM · ANDANTE" caption and the "↗ Live site" / "★ Repository" button labels stay literal exactly as the current code / mock present them (no keys exist for them).
- Automated tests: the portfolio app has no test runner configured. Verification is `astro check` (typecheck) + manual visual review. Pure math helpers are isolated in a standalone module so a runner can be added later without refactor.

## Design tokens & color map

All colors come from `@mfranceschit/ui` tokens where they exist; otherwise arbitrary Tailwind values reproduce the exact spec value.

| Spec hex | Token | Notes |
| --- | --- | --- |
| `#0E1733` | `--mf-blue-900` | page gradient top, header, card base |
| `#0B1226` | (arbitrary) | page gradient bottom |
| `#142142` | `--mf-blue-800` | detail cover gradient |
| `#1B2B5B` | `--mf-blue-700` | brand primary |
| `#AE2B53` | `--mf-very-berry` / `--mf-berry-600` | berry line, active underline, primary btn |
| `#C03E66` | `--mf-berry-500` | primary gradient partner |
| `#3067F6` | `--mf-silver-birch` | birch line, focus ring, hover borders |
| `#D3CFC7` | `--mf-sand` | cert badge fill |
| `#7FA3FF`, `#9DB9FF`, `#CFE0FF`, `#F4F6FB`, `#EEF1F7`, `#D98AA1`, text rgba | (arbitrary) | not in token set — arbitrary values |

Type: Inter only (already loaded via `rsms.me/inter`). H1 44px/700/−0.015em (40px on detail), h2–h3 22px/600, card title 17px/600, body 16px/1.7, UI 13–14px, chips 12–13px/500, wordmark 600 + 0.3em, eyebrow 600 12px uppercase +0.16em. Radii 8/6/4px. Hover transitions 200ms ease-out.

## Architecture

Dependency-clean layering: pages (Astro) render server content + mount islands; islands own all canvas state; a shared math module holds pure functions; a shared loop helper holds the DOM/RAF plumbing.

```
apps/portfolio/src/
  lib/canvas/
    wave-math.ts        pure: beatEnv, gauss, rgba, accents(mode)
    canvas-loop.ts      DPR sizing, resize, IntersectionObserver, hidden-pause, rAF+dt+reduceMotion
  components/
    islands/
      HeroWave.svelte       ports hero2 (+ drives #hero-logo / #hero-content)
      TramaBackground.svelte ports trama
      HeaderWave.svelte      ports hdrWave + makeScrollRef(window) + makePluck(delegation)
    LanguagePicker.astro  (existing — restyled dark)
  layouts/BaseLayout.astro  (dark shell, variant prop)
  pages/[locale]/...        (rebuilt pages)
  public/monogram-beige.svg (added), monogram-navy.svg (existing)
```

### Shared math — `lib/canvas/wave-math.ts`

Ported verbatim from the reference:
- `beatEnv(t)`: `period = 60/72; phase = ((t % period)+period)%period / period; return exp(-4·phase)`.
- `gauss(x, c, s)`: `d=(x-c)/s; return exp(-d·d)`.
- `rgba(hex, a)`: parse `#RRGGBB` → `rgba(r,g,b,a)`.
- `accents(mode)`: `birch`→`['#3067F6','#3067F6']`, `berry`→`['#AE2B53','#AE2B53']`, else `['#3067F6','#AE2B53']`.

These are the only pure, unit-testable pieces; keep them free of DOM.

### Shared loop — `lib/canvas/canvas-loop.ts`

A helper (`createCanvasScene({ canvas, kind, draw, reduceMotion })`) that reproduces `initCanvas` + `drawAll`'s per-item plumbing for a single canvas:
- Size canvas to `clientWidth/Height × dpr` (dpr = 1.5 desktop / 2 mobile), `ctx.scale(dpr,dpr)`. Re-run on `ResizeObserver`.
- Neutralize `ctx.shadowBlur` (setter no-op) — glows are faked with layered low-alpha strokes, per the mock's perf note. (Islands set `shadowColor`/`shadowBlur` in ported code; the no-op setter keeps the ported math byte-for-byte while disabling the real blur.)
- `IntersectionObserver` (rootMargin 120px) → `visible`; skip drawing when `!visible` or `document.hidden`.
- rAF loop computing `dt = min(0.2, elapsed/1000)`; `t += reduceMotion ? dt*0.15 : dt`; `clearRect`; call `draw(ctx, { t, w, h, px, py })`.
- Pointer tracking (`px/py` in canvas space) on the host element; `pointerleave` resets to `-9999`.
- Returns a `destroy()` for Svelte `onDestroy`.

`reduceMotion` default = `matchMedia('(prefers-reduced-motion: reduce)').matches`, overridable by prop. Reduced motion slows time ×0.15 (matches the mock; full pause is an acceptable alternative but we follow the mock).

### Islands

Common props (all islands): `waveSpeed = 1`, `waveEnergy = 0.75`, `accentMode: 'dual'|'birch'|'berry' = 'dual'`, `reduceMotion?: boolean`.

**`HeroWave.svelte`** (`client:load`) — 2a
- Fixed full-viewport background `<canvas>` (z0), pointer-events none for the canvas but the section listens for pointermove (cursor lift) and pointerdown (restart: `t=0`, clear plucks).
- Ports `hero2(it, E)` exactly: `y0 = h·0.71`; entrance timeline `lineA = min(1, t/0.35)`, `sepRaw`/`eased` layer separation (0.9–1.5s), front-line strike ripple `exp(-2.8(t-0.5))·sin((t-0.5)·32)·36·gauss(x,cx,w/4)` (0.5–1.9s), 4 layers (L1 = berry, others = birch) with gradient fill + stroke, steady-state beat swell `s` every 4 beats, radial berry water glow.
- Drives DOM by id (content stays server-rendered): `#hero-logo` → `filter` drop-shadow blue + berry-on-beat and `transform: scale(1 + 0.045·s)`; `#hero-content` → opacity/`translateY` rise `(t-0.95)/0.55` smoothstep. Uses `sc = 1` (desktop geometry) and scales via real `h`.

**`TramaBackground.svelte`** (`client:visible`) — 6a–6d background
- Fixed full-viewport `<canvas>` (z0). Loads `/monogram-beige.svg` as an `Image`; bails until loaded.
- Ports `trama(it, E)`: deterministic seeded tiles (cell 118px desktop / 96px mobile via `matchMedia`), ~22% skipped, sizes `{20,30,44}`/`{16,24,34}`, rotation ×90°, random phase, seed `abs(sin(ri·127.1 + w))`. Idle bob `sin(0.7t+ph)·1.6·E` at alpha 0.05; cursor oscillation within 200px (`sin(6t)·5·g`, alpha boost); click "drop" rings (max 5, `r += 5.5`, `a ×= 0.972`) displacing tiles radially up to 13px, alpha capped at 0.2. Regenerate tiles on resize.

**`HeaderWave.svelte`** (`client:load`) — all interior pages
- Fixed 40px `<canvas>` strip at the header's bottom edge (top 44px, full width, pointer-events none, z40).
- Ports `hdrWave(it, E, key)`: idle sine (`sin(0.025x+3.2t·sp)+0.45·sin(0.052x−4.4t·sp)`), scroll-progress fill clipped to `frac·w` with birch→berry gradient + berry radial glow (r22) at the leading edge, velocity-driven amplitude `(1.1 + min(9, vel·0.22) + done?2.5·env:0)·E`, completion (`frac>0.97`) berry pulse, plucks `exp(-3·age)·sin(28·age)·9·gauss(x,px,90)` living 2.5s.
- **Scroll** (adapted `makeScrollRef` → `window`): on `scroll`, `frac = scrollY / (scrollHeight − innerHeight)`; `vel = min(60, vel + |Δ|·0.6)`; `vel ×= 0.93` per frame.
- **Pluck** (adapted `makePluck` → delegation): document-level `pointerover` and `focusin`; if `e.target.closest('[data-pluck]')`, push `{ x: elementCenterX·(w/rect.width), t0: t }`.

### Shell — `BaseLayout.astro`

Dark by default. New prop `variant?: 'hero' | 'interior'` (default `'interior'`).
- Body: `min-h-screen`, background `linear-gradient(180deg,#0E1733 0%,#0B1226 100%)` fixed; base text light.
- Header (64px, sticky, z30):
  - `hero`: `rgba(14,23,51,0.45)` + `backdrop-filter: blur(14px)` + `border-bottom: 1px solid rgba(255,255,255,0.08)`.
  - `interior`: `rgba(14,23,51,0.94)`, no blur.
  - Wordmark `mfranceschit` Inter 600 15px, `letter-spacing: 0.3em`, `#FFFFFF`.
  - Nav gap 26px, 13.5px: inactive `rgba(211,207,199,0.62)` → hover `#FFFFFF`; active `#FFFFFF` 600 + `border-bottom: 2px solid #AE2B53` pad `4px 0`. Each link gets `data-pluck`.
  - `LanguagePicker.astro` restyled: inactive `rgba(211,207,199,0.7)` → hover `#FFFFFF`; active `#FFFFFF`.
- `interior` variant mounts `<HeaderWave client:load />` (z40) and `<TramaBackground client:visible />` (z0); `<main>` content sits at z10. `hero` variant mounts neither (the page mounts `HeroWave`).

### Pages

- **`index.astro` (2a, `variant="hero"`)**: centered content column below header, `gap 22px`, shifted up. Stack: `#hero-logo` = `monogram-beige.svg` h80 blue drop-shadow; wordmark Inter 700 42px 0.14em white; `h1` `home.title` 25px + subtitle `home.subtitle` 17px; `#hero-content` wraps the text + button row so the island can fade/rise it. Buttons (bespoke): ghost **Proyectos** (`nav.projects`, `rgba(255,255,255,0.07)` + hairline + blur8, `#EEF1F7`) and primary **¡Hablemos!** (`contact.cta`, `linear-gradient(135deg,#C03E66,#AE2B53)` + berry glow, white). Bottom-right caption `72 BPM · ANDANTE` Inter 500 12px 0.16em `rgba(211,207,199,0.45)`. Mount `<HeroWave client:load />`.
- **`projects/index.astro` (6a, interior)**: 720px column, `padding 56px 24px 120px`. H1 `projects.title` 44px. Card list (gap 16px), bespoke: `padding 22px 24px`, radius 8px, `rgba(14,23,51,0.55)`, hairline, hover `border rgba(48,103,246,0.55)` + blue glow + `translateY(-2px)`. Left: name 17px `#F4F6FB` + tech chips (`rgba(255,255,255,0.07)` neutral); right: `Ver →` (`projects.view`) `#7FA3FF`. Cards `data-pluck`. Data: `getProjects()`.
- **`projects/[slug].astro` (6b, interior)**: 720px column, `padding 48px 24px 120px`. Back link `← {projects.title}` `data-pluck`. H1 40px/1.15. Cover panel h220 `linear-gradient(135deg,#142142,#0E1733)` + hairline, centered `monogram-beige.svg` 68px @0.85 blue drop-shadow (replaced by `project.image` when present). `Resumen`/`Tecnologías` sections; blue chips (`rgba(48,103,246,0.16)` + `rgba(48,103,246,0.35)` border, `#9DB9FF`, `data-pluck`). Action buttons (bespoke, `data-pluck`): `↗ Live site` (blue) and `★ Repository` (white-ish). Data: `getProject(slug, locale)` + `renderBlocks`.
- **`certifications.astro` (6c, interior)**: 720px column, `padding 56px 24px 120px`. H1 `certifications.title` 44px. Two groups `certifications.certificates` / `certifications.degrees` (h2 22px, 38px apart). Row card: flex, `padding 16px 18px`, radius 8px, `rgba(14,23,51,0.55)`, hover blue border + `data-pluck`. Leading 48×48 sand badge with `monogram-navy.svg` 28px (or `cert.image`). Title 14px + issuer 12px. Certificates only: trailing year (tabular-nums) + `Ver →` `#7FA3FF`. Data: `getCertifications`/`getDegrees`.
- **`contact.astro` (6d, interior)**: 540px column, `padding 56px 24px 120px`. H1 `contact.title` 44px + subtitle `contact.description` 16px. Form gap 18px. Inputs bespoke dark: `padding 11px 16px`, radius 8px, `rgba(14,23,51,0.6)`, `border rgba(255,255,255,0.14)`, `#EEF1F7`; focus `border #3067F6` + `box-shadow 0 0 0 3px rgba(48,103,246,0.25)`. Fields Nombre*/Email*/Asunto/Mensaje* (`contact.name/email/subject/message`), required mark `#D98AA1`, each field `data-pluck` (focus plucks the header wave). Submit `¡Hablemos!` gradient btn. Keep existing Formspree submit script + success view (restyled dark).
- **`about.astro` (interior, dark restyle only)**: keep structure/content; swap text/surface colors to dark-legible values. Not held to a pixel spec (no mock frame).

### Assets

- Copy `docs/design_handoff_portfolio_redesign/assets/monogram-beige.svg` → `apps/portfolio/public/monogram-beige.svg`.
- `monogram-navy.svg` already in `public/`.
- Trama/hero/detail-cover reference `/monogram-beige.svg`; cert badge references `/monogram-navy.svg`.

## Data flow

- Sanity queries unchanged (`getProjects`, `getProject`, `getCertifications`, `getDegrees`); pages remain static (`output: 'static'`). Animations are purely presentational and consume no Sanity data.
- Scroll → HeaderWave via `window` scroll listener (frac + velocity).
- Hover/focus → HeaderWave via document `pointerover`/`focusin` delegation on `[data-pluck]`.
- Hero content animation → `HeroWave` writes styles to `#hero-logo` / `#hero-content` each frame.

## Error handling / robustness

- Trama waits for the monogram `Image` to load before drawing (no crash on cold cache).
- All islands pause on `document.hidden` and when off-screen (IntersectionObserver).
- `ResizeObserver` re-sizes canvases and regenerates trama tiles so fluid viewport scaling stays crisp.
- `prefers-reduced-motion` honored (time ×0.15) with a prop override.
- Canvas coordinate mapping uses `getBoundingClientRect` ratios so pointer/pluck positions stay correct under CSS scaling.

## Verification

- `astro check` (typecheck) passes.
- Biome clean (linters run in the user's environment; write conforming code).
- Manual visual pass against the mock for each of the five screens: hero entrance + beat swell + cursor lift + click restart; trama idle/cursor/drop; header wave idle + scroll fill + velocity + completion + pluck on nav/cards/chips/buttons/form focus.

## Task decomposition (for the implementation plan)

1. Add `monogram-beige.svg` to `public/`.
2. `lib/canvas/wave-math.ts` (pure helpers).
3. `lib/canvas/canvas-loop.ts` (shared plumbing).
4. `HeaderWave.svelte` (scroll + pluck + hdrWave).
5. `TramaBackground.svelte` (trama).
6. `HeroWave.svelte` (hero2 + DOM drive).
7. `BaseLayout.astro` dark shell + `variant` + island mounts + dark LanguagePicker.
8. `index.astro` hero (2a).
9. `projects/index.astro` (6a).
10. `projects/[slug].astro` (6b).
11. `certifications.astro` (6c).
12. `contact.astro` (6d) + dark success view.
13. `about.astro` dark restyle.
14. `astro check` + visual verification.
