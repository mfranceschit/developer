# HeaderWave Ambient Pulse — Design

**Date:** 2026-07-10
**Status:** Approved
**Component:** `apps/portfolio/src/components/islands/HeaderWave.svelte`

## Problem

HeaderWave ties its visual interest to scroll progress (fill width, velocity-driven
amplitude, end-of-page beat state). Most interior pages are shorter than ~1.5
viewports, so the scroll effect rarely engages and the header reads as inaccurate
or inert. The wave should feel alive on every page without depending on scroll.

## Decision

Replace scroll coupling with a self-contained ambient loop: a **drifting berry
current** — a soft berry-tinted region that travels along the silver-birch line
in a continuous cycle. Chosen over a heartbeat swell and a breathing gradient
via live mockup comparison; tuned to the "lively" temperament (~6s loop, tight
region, strong tint, subtle glow).

## Behaviour

- **Base layer (unchanged):** faint silver-birch line, `rgba(birch, 0.2)`,
  1.2px, two-sine wave shape.
- **Wave amplitude:** constant `~1.6 * waveEnergy` (replaces scroll-velocity
  amplitude). Same two-sine frequencies and speeds as today.
- **Drift current:** a center point `cx` loops left→right with period **6s**,
  travelling from off-screen left (`-span`) to off-screen right (`w + span`) so
  each pass has a quiet interval before re-entering.
- **Segment colouring:** the main line is stroked in 5px segments. Each segment
  computes `k = exp(-((x - cx) / span)^2)` with `span = 0.2 * w`, then:
  - colour: linear mix birch→berry by `k` (full berry at center)
  - alpha: `0.5 + 0.35 * k`
- **Glow:** `canvas-loop.ts` no-ops `shadowBlur` for performance. Emulate glow
  with a second, wider (~4px) berry stroke at low alpha (`~0.18 * k`), drawn
  only for segments where `k > 0.05`.
- **Plucks (unchanged):** hover/focus ripples on `[data-pluck]` elements keep
  adding displacement to the wave shape.
- **Props (unchanged):** `waveSpeed`, `waveEnergy`, `accentMode`,
  `reduceMotion`. Colours come from `accents(accentMode)` as today.
- **Reduced motion:** no new handling — the canvas loop already scales time by
  0.15×, which slows the drift to a near-still crawl.

## Removals

- `scroll` event listener and `scrollSt` state (`frac`, `vel`, `last`)
- Progress-clipped gradient fill and its `save/clip/restore` block
- `done` (frac > 0.97) beat state and `beatEnv` usage
- Berry glow dot at the progress edge

## Out of scope

- HeroWave (home page) — untouched
- Any layout/markup change; canvas element, placement (`top: 44px`,
  `height: 40px`), and `BaseLayout` usage stay as-is

## Verification

- Playwright on an interior page (e.g. `/en/projects`): canvas renders, no
  console errors, no `scroll` listener registered by the component
- Visual check against the approved mockup
  (`.superpowers/brainstorm/14378-1783703635/content/pulse-b-tuning.html`,
  option 3)
