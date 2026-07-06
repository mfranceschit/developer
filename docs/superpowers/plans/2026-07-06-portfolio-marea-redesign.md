# Portfolio "Marea v2" Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the approved dark-navy "liquid sound" redesign (Hero 2a + interior pages 6a–6d) inside `apps/portfolio`, porting the canonical canvas math into three Svelte islands and converting the shared shell + pages to bespoke dark markup.

**Architecture:** Pure animation math lives in a DOM-free module (`lib/canvas/wave-math.ts`); a shared loop helper (`lib/canvas/canvas-loop.ts`) owns DPR sizing, resize, visibility, and the rAF timeline. Three islands (`HeroWave`, `TramaBackground`, `HeaderWave`) each port one reference method. `BaseLayout.astro` becomes a dark shell with a `variant` prop and mounts the interior islands; pages render server content and mount islands.

**Tech Stack:** Astro (static output), Svelte 5 (runes), Tailwind CSS v4, `@mfranceschit/ui` tokens, Sanity (GROQ), Biome, TypeScript.

## Global Constraints

- Colors map to `@mfranceschit/ui` tokens where they exist (`very-berry` `#AE2B53`, `silver-birch` `#3067F6`, `sand` `#D3CFC7`, `blue-900` `#0E1733`, `blue-800` `#142142`, `blue-700` `#1B2B5B`); non-token spec values (`#0B1226`, `#7FA3FF`, `#9DB9FF`, `#CFE0FF`, `#F4F6FB`, `#EEF1F7`, `#D98AA1`, text rgba) use Tailwind arbitrary values. Reproduce spec values verbatim.
- Font: Inter only (already loaded). Type/spacing/radii exactly per the spec (H1 44px/700/−0.015em; 40px on detail; radii 8/6/4px; hover transitions 200ms ease-out).
- Ported math must stay numerically identical to `docs/design_handoff_portfolio_redesign/Rediseño mfranceschit.dc.html`'s `class Component`. `ctx.shadowBlur` is neutralized (no-op setter) — keep the `shadowColor`/`shadowBlur` lines for fidelity even though blur is disabled; glows come from layered low-alpha strokes.
- All motion honors `prefers-reduced-motion` (time ×0.15). Pause drawing when `document.hidden` and when off-screen (IntersectionObserver, rootMargin 120px). Canvas DPR 1.5 desktop / 2 mobile.
- Node runs via `fnm exec --` (fnm shell init is absent in this shell).
- Do NOT run `pnpm dev`/`pnpm build` or lint commands (owner rules). Typecheck via `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck` is allowed. Visual verification is performed by the owner in their running dev server.
- Commits: `type(scope): description`, no `Co-Authored-By` line. One commit per task. Do not commit anything else without instruction.
- Reuse existing i18n keys; add none. Literal strings "72 BPM · ANDANTE", "↗ Live site", "★ Repository" stay hardcoded.

## File Structure

**Create**
- `apps/portfolio/public/monogram-beige.svg` — trama/hero/detail-cover glyph.
- `apps/portfolio/src/lib/canvas/wave-math.ts` — pure helpers.
- `apps/portfolio/src/lib/canvas/canvas-loop.ts` — canvas scene runner.
- `apps/portfolio/src/components/islands/HeaderWave.svelte` — header scroll/pluck wave (`hdrWave`).
- `apps/portfolio/src/components/islands/TramaBackground.svelte` — interior background (`trama`).
- `apps/portfolio/src/components/islands/HeroWave.svelte` — hero background + DOM drive (`hero2`).

**Modify**
- `apps/portfolio/src/components/LanguagePicker.astro` — dark colors.
- `apps/portfolio/src/layouts/BaseLayout.astro` — dark shell + `variant` + island mounts.
- `apps/portfolio/src/pages/[locale]/index.astro` — hero (2a).
- `apps/portfolio/src/pages/[locale]/projects/index.astro` — projects (6a).
- `apps/portfolio/src/pages/[locale]/projects/[slug].astro` — detail (6b).
- `apps/portfolio/src/pages/[locale]/certifications.astro` — certifications (6c).
- `apps/portfolio/src/pages/[locale]/contact.astro` — contact (6d).
- `apps/portfolio/src/pages/[locale]/about.astro` — dark restyle.

---

### Task 1: Add the beige monogram asset

**Files:**
- Create: `apps/portfolio/public/monogram-beige.svg`

- [ ] **Step 1: Copy the asset from the handoff bundle**

Run:
```bash
cp "docs/design_handoff_portfolio_redesign/assets/monogram-beige.svg" apps/portfolio/public/monogram-beige.svg
```

- [ ] **Step 2: Verify both monograms are present**

Run: `ls apps/portfolio/public/monogram-*.svg`
Expected: lists `monogram-beige.svg` and `monogram-navy.svg`.

- [ ] **Step 3: Commit**

```bash
git add apps/portfolio/public/monogram-beige.svg
git commit -m "feat(portfolio): add beige monogram asset for redesign"
```

---

### Task 2: Pure wave math helpers

**Files:**
- Create: `apps/portfolio/src/lib/canvas/wave-math.ts`

**Interfaces:**
- Produces: `type AccentMode = 'dual' | 'birch' | 'berry'`; `BEAT_PERIOD: number`; `beatEnv(t: number): number`; `gauss(x: number, c: number, s: number): number`; `rgba(hex: string, a: number): string`; `accents(mode: AccentMode): [string, string]`.

- [ ] **Step 1: Write the module**

```ts
export type AccentMode = 'dual' | 'birch' | 'berry';

export const BEAT_PERIOD = 60 / 72;

export function beatEnv(t: number): number {
  const phase = (((t % BEAT_PERIOD) + BEAT_PERIOD) % BEAT_PERIOD) / BEAT_PERIOD;
  return Math.exp(-4 * phase);
}

export function gauss(x: number, c: number, s: number): number {
  const d = (x - c) / s;
  return Math.exp(-d * d);
}

export function rgba(hex: string, a: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

export function accents(mode: AccentMode): [string, string] {
  if (mode === 'birch') return ['#3067F6', '#3067F6'];
  if (mode === 'berry') return ['#AE2B53', '#AE2B53'];
  return ['#3067F6', '#AE2B53'];
}
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors referencing `wave-math.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/portfolio/src/lib/canvas/wave-math.ts
git commit -m "feat(portfolio): add pure wave math helpers"
```

---

### Task 3: Canvas scene loop helper

**Files:**
- Create: `apps/portfolio/src/lib/canvas/canvas-loop.ts`

**Interfaces:**
- Consumes: nothing (DOM-only).
- Produces:
  - `interface SceneCtx { ctx: CanvasRenderingContext2D; t: number; w: number; h: number; px: number; py: number; }`
  - `interface SceneOptions { canvas: HTMLCanvasElement; draw: (s: SceneCtx) => void; reduceMotion?: boolean; pointerTarget?: HTMLElement | Window; onResize?: (w: number, h: number) => void; }`
  - `interface Scene { destroy(): void; resetTime(): void; }`
  - `createCanvasScene(opts: SceneOptions): Scene`

- [ ] **Step 1: Write the module**

```ts
export interface SceneCtx {
  ctx: CanvasRenderingContext2D;
  t: number;
  w: number;
  h: number;
  px: number;
  py: number;
}

export interface SceneOptions {
  canvas: HTMLCanvasElement;
  draw: (s: SceneCtx) => void;
  reduceMotion?: boolean;
  pointerTarget?: HTMLElement | Window;
  onResize?: (w: number, h: number) => void;
}

export interface Scene {
  destroy(): void;
  resetTime(): void;
}

export function createCanvasScene(opts: SceneOptions): Scene {
  const { canvas, draw, onResize } = opts;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { destroy() {}, resetTime() {} };

  const target: HTMLElement | Window = opts.pointerTarget ?? canvas;
  const reduce =
    opts.reduceMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Glow disabled for perf — fake with low-alpha strokes; keep ported shadow lines harmless.
  const sb = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'shadowBlur');
  Object.defineProperty(ctx, 'shadowBlur', {
    get() {
      return sb?.get?.call(this) ?? 0;
    },
    set() {},
  });

  let w = 0;
  let h = 0;
  function resize() {
    w = canvas.clientWidth || 1;
    h = canvas.clientHeight || 1;
    const dpr = w > 900 ? 1.5 : 2;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize?.(w, h);
  }
  resize();

  let px = -9999;
  let py = -9999;
  function onMove(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    px = (e.clientX - r.left) * (w / r.width);
    py = (e.clientY - r.top) * (h / r.height);
  }
  function onLeave() {
    px = -9999;
    py = -9999;
  }
  target.addEventListener('pointermove', onMove as EventListener, { passive: true });
  target.addEventListener('pointerleave', onLeave as EventListener, { passive: true });

  let visible = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) if (en.target === canvas) visible = en.isIntersecting;
    },
    { rootMargin: '120px' },
  );
  io.observe(canvas);

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas);

  let t = 0;
  let last = 0;
  let raf = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden || !visible) {
      last = now;
      return;
    }
    const dt = last ? Math.min(0.2, (now - last) / 1000) : 0.016;
    last = now;
    t += reduce ? dt * 0.15 : dt;
    ctx.clearRect(0, 0, w, h);
    draw({ ctx, t, w, h, px, py });
  }
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      target.removeEventListener('pointermove', onMove as EventListener);
      target.removeEventListener('pointerleave', onLeave as EventListener);
    },
    resetTime() {
      t = 0;
      last = 0;
    },
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors referencing `canvas-loop.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/portfolio/src/lib/canvas/canvas-loop.ts
git commit -m "feat(portfolio): add canvas scene loop helper"
```

---

### Task 4: HeaderWave island (hdrWave + scroll + pluck)

**Files:**
- Create: `apps/portfolio/src/components/islands/HeaderWave.svelte`

**Interfaces:**
- Consumes: `createCanvasScene`, `Scene`, `SceneCtx` (Task 3); `accents`, `beatEnv`, `gauss`, `rgba`, `AccentMode` (Task 2).
- Produces: a Svelte component with props `waveSpeed?`, `waveEnergy?`, `accentMode?`, `reduceMotion?`. Renders a fixed 40px canvas at `top:44px`, z40, `pointer-events:none`. Reacts to any `[data-pluck]` element via document `pointerover`/`focusin` delegation and to `window` scroll.

- [ ] **Step 1: Write the component**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { createCanvasScene, type Scene, type SceneCtx } from '@/lib/canvas/canvas-loop';
  import { accents, beatEnv, gauss, rgba, type AccentMode } from '@/lib/canvas/wave-math';

  interface Props {
    waveSpeed?: number;
    waveEnergy?: number;
    accentMode?: AccentMode;
    reduceMotion?: boolean;
  }
  const { waveSpeed = 1, waveEnergy = 0.75, accentMode = 'dual', reduceMotion }: Props = $props();

  let canvas: HTMLCanvasElement;

  const plucks: { x: number; t0: number }[] = [];
  const scrollSt = { frac: 0, vel: 0, last: 0 };
  let currentT = 0;
  let currentW = 1;

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollSt.frac = max > 0 ? window.scrollY / max : 0;
    scrollSt.vel = Math.min(60, scrollSt.vel + Math.abs(window.scrollY - scrollSt.last) * 0.6);
    scrollSt.last = window.scrollY;
  }

  function onPluck(e: Event) {
    const el = (e.target as HTMLElement | null)?.closest?.('[data-pluck]');
    if (!el) return;
    const r = canvas.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const x = (er.left + er.width / 2 - r.left) * (currentW / r.width);
    plucks.push({ x, t0: currentT });
  }

  function draw(s: SceneCtx) {
    const { ctx: c, t, w, h } = s;
    currentT = t;
    currentW = w;
    const E = waveEnergy;
    const [A, B] = accents(accentMode);
    const sp = waveSpeed;
    scrollSt.vel *= 0.93;
    const env = beatEnv(t);
    const done = scrollSt.frac > 0.97;
    const y0 = 20;
    for (let i = plucks.length - 1; i >= 0; i--) if (t - plucks[i].t0 >= 2.5) plucks.splice(i, 1);
    const amp = (1.1 + Math.min(9, scrollSt.vel * 0.22) + (done ? 2.5 * env : 0)) * E;
    const yFor = (x: number) => {
      let y =
        y0 +
        Math.sin(x * 0.025 + t * sp * 3.2) * amp +
        Math.sin(x * 0.052 - t * sp * 4.4) * amp * 0.45;
      for (const p of plucks) {
        const age = t - p.t0;
        y += Math.exp(-3 * age) * Math.sin(age * 28) * 9 * gauss(x, p.x, 90);
      }
      return y;
    };
    c.strokeStyle = rgba(A, 0.2);
    c.lineWidth = 1.2;
    c.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const y = yFor(x);
      if (x === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
    const fillW = Math.max(2, scrollSt.frac * w);
    c.save();
    c.beginPath();
    c.rect(0, 0, fillW, h);
    c.clip();
    const grad = c.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, rgba(A, 0.85));
    grad.addColorStop(0.72, rgba(A, 0.8));
    grad.addColorStop(1, rgba(B, 0.95));
    c.strokeStyle = done ? rgba(B, 0.75 + 0.25 * env) : grad;
    c.lineWidth = 1.8;
    c.shadowColor = done ? B : A;
    c.shadowBlur = done ? 10 + 10 * env : 7;
    c.beginPath();
    for (let x = 0; x <= w; x += 5) {
      const y = yFor(x);
      if (x === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
    c.restore();
    if (!done && scrollSt.frac > 0.01) {
      const gx = fillW;
      const gy = yFor(fillW);
      const g = c.createRadialGradient(gx, gy, 0, gx, gy, 22);
      g.addColorStop(0, rgba(B, 0.5));
      g.addColorStop(1, 'rgba(174,43,83,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(gx, gy, 22, 0, Math.PI * 2);
      c.fill();
    }
  }

  onMount(() => {
    const scene: Scene = createCanvasScene({ canvas, draw, reduceMotion, pointerTarget: window });
    scrollSt.last = window.scrollY;
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerover', onPluck, { passive: true });
    document.addEventListener('focusin', onPluck, { passive: true });
    return () => {
      scene.destroy();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerover', onPluck);
      document.removeEventListener('focusin', onPluck);
    };
  });
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class="pointer-events-none fixed left-0 right-0 z-40"
  style="top: 44px; height: 40px;"
></canvas>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors referencing `HeaderWave.svelte`.

- [ ] **Step 3: Commit**

```bash
git add apps/portfolio/src/components/islands/HeaderWave.svelte
git commit -m "feat(portfolio): add HeaderWave island with scroll and pluck"
```

---

### Task 5: TramaBackground island (trama)

**Files:**
- Create: `apps/portfolio/src/components/islands/TramaBackground.svelte`

**Interfaces:**
- Consumes: `createCanvasScene`, `Scene`, `SceneCtx` (Task 3); `AccentMode` (Task 2).
- Produces: a component with props `waveEnergy?`, `accentMode?`, `reduceMotion?`. Renders a fixed full-viewport canvas at z0, `pointer-events:none`. Loads `/monogram-beige.svg`; click anywhere spawns drop rings.

- [ ] **Step 1: Write the component**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { createCanvasScene, type Scene, type SceneCtx } from '@/lib/canvas/canvas-loop';
  import type { AccentMode } from '@/lib/canvas/wave-math';

  interface Props {
    waveEnergy?: number;
    accentMode?: AccentMode;
    reduceMotion?: boolean;
  }
  const { waveEnergy = 0.75, accentMode = 'dual', reduceMotion }: Props = $props();

  let canvas: HTMLCanvasElement;

  type Tile = { x: number; y: number; s: number; rot: number; ph: number };
  type Ring = { x: number; y: number; r: number; a: number };
  let tiles: Tile[] | null = null;
  const rings: Ring[] = [];
  let currentW = 1;
  let currentH = 1;

  const img = new Image();
  let imgReady = false;
  img.onload = () => {
    imgReady = true;
  };
  img.src = '/monogram-beige.svg';

  function buildTiles(w: number, h: number): Tile[] {
    const out: Tile[] = [];
    const mob = window.matchMedia('(max-width: 640px)').matches;
    const cell = mob ? 96 : 118;
    const sizes = mob ? [16, 24, 34] : [20, 30, 44];
    let ri = 0;
    const rand = () => {
      ri++;
      return Math.abs(Math.sin(ri * 127.1 + w)) % 1;
    };
    for (let gy = cell / 2; gy < h; gy += cell) {
      for (let gx = cell / 2; gx < w; gx += cell) {
        if (rand() < 0.22) continue;
        out.push({
          x: gx + (rand() - 0.5) * cell * 0.5,
          y: gy + (rand() - 0.5) * cell * 0.5,
          s: sizes[Math.floor(rand() * sizes.length)],
          rot: (Math.floor(rand() * 4) * Math.PI) / 2,
          ph: rand() * Math.PI * 2,
        });
      }
    }
    return out;
  }

  function draw(s: SceneCtx) {
    const { ctx: c, t, w, h } = s;
    currentW = w;
    currentH = h;
    const E = waveEnergy;
    if (!imgReady || !img.naturalWidth) return;
    if (!tiles) tiles = buildTiles(w, h);
    for (let i = rings.length - 1; i >= 0; i--) {
      const ring = rings[i];
      ring.r += 5.5;
      ring.a *= 0.972;
      if (ring.a < 0.02) rings.splice(i, 1);
    }
    const ar = img.naturalHeight / img.naturalWidth;
    for (const tl of tiles) {
      let dx = 0;
      let dy = Math.sin(t * 0.7 + tl.ph) * 1.6 * E;
      let boost = 0;
      if (s.px > -100) {
        const dp = Math.hypot(tl.x - s.px, tl.y - s.py);
        if (dp < 200) {
          const g = Math.exp(-(dp * dp) / 9000);
          dy += Math.sin(t * 6 + tl.ph) * 5 * g * E;
          boost += 0.03 * g;
        }
      }
      for (const ring of rings) {
        const d = Math.hypot(tl.x - ring.x, tl.y - ring.y);
        const wv = Math.exp(-((d - ring.r) / 46) ** 2) * ring.a;
        if (wv > 0.01) {
          const ang = Math.atan2(tl.y - ring.y, tl.x - ring.x);
          dx += Math.cos(ang) * wv * 13;
          dy += Math.sin(ang) * wv * 13;
          boost += wv * 0.09;
        }
      }
      c.save();
      c.translate(tl.x + dx, tl.y + dy);
      c.rotate(tl.rot);
      c.globalAlpha = Math.min(0.2, 0.05 + boost);
      c.drawImage(img, -tl.s / 2, (-tl.s * ar) / 2, tl.s, tl.s * ar);
      c.restore();
    }
    c.globalAlpha = 1;
  }

  function onDrop(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (currentW / r.width);
    const y = (e.clientY - r.top) * (currentH / r.height);
    rings.push({ x, y, r: 4, a: 1 });
    if (rings.length > 5) rings.shift();
  }

  onMount(() => {
    const scene: Scene = createCanvasScene({
      canvas,
      draw,
      reduceMotion,
      pointerTarget: window,
      onResize: () => {
        tiles = null;
      },
    });
    window.addEventListener('pointerdown', onDrop, { passive: true });
    return () => {
      scene.destroy();
      window.removeEventListener('pointerdown', onDrop);
    };
  });
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-0 h-full w-full"
></canvas>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors referencing `TramaBackground.svelte`.

- [ ] **Step 3: Commit**

```bash
git add apps/portfolio/src/components/islands/TramaBackground.svelte
git commit -m "feat(portfolio): add TramaBackground island"
```

---

### Task 6: HeroWave island (hero2 + DOM drive)

**Files:**
- Create: `apps/portfolio/src/components/islands/HeroWave.svelte`

**Interfaces:**
- Consumes: `createCanvasScene`, `Scene`, `SceneCtx` (Task 3); `accents`, `beatEnv`, `gauss`, `rgba`, `BEAT_PERIOD`, `AccentMode` (Task 2).
- Produces: a component with props `waveSpeed?`, `waveEnergy?`, `accentMode?`, `reduceMotion?`. Renders a fixed full-viewport canvas at z0, `pointer-events:none`. Each frame it drives `#hero-logo` (filter/scale) and `#hero-content` (opacity/translateY). Click anywhere restarts the entrance (`t=0`).

- [ ] **Step 1: Write the component**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { createCanvasScene, type Scene, type SceneCtx } from '@/lib/canvas/canvas-loop';
  import { accents, beatEnv, gauss, rgba, BEAT_PERIOD, type AccentMode } from '@/lib/canvas/wave-math';

  interface Props {
    waveSpeed?: number;
    waveEnergy?: number;
    accentMode?: AccentMode;
    reduceMotion?: boolean;
  }
  const { waveSpeed = 1, waveEnergy = 0.75, accentMode = 'dual', reduceMotion }: Props = $props();

  let canvas: HTMLCanvasElement;
  let logoEl: HTMLElement | null = null;
  let contentEl: HTMLElement | null = null;

  const plucks: { x: number; t0: number; amp: number }[] = [];

  function draw(s: SceneCtx) {
    const { ctx: c, t, w, h } = s;
    const E = waveEnergy;
    const [A, B] = accents(accentMode);
    const env = beatEnv(t);
    const sc = 1;
    const y0 = h * 0.71;
    const lineA = Math.min(1, t / 0.35);
    const sepRaw = t < 0.9 ? 0 : Math.min(1, (t - 0.9) / 0.6);
    const eased = sepRaw * sepRaw * (3 - 2 * sepRaw);
    let sw = 0;
    if (t > 2.2) {
      const ph = (t - 2.2) % (BEAT_PERIOD * 4);
      if (ph < 1.1) sw = Math.sin(Math.PI * (ph / 1.1));
    }
    const cx = w / 2;
    for (let i = plucks.length - 1; i >= 0; i--) if (t - plucks[i].t0 >= 2.5) plucks.splice(i, 1);
    const yFor = (L: number, x: number) => {
      const base = y0 + L * h * 0.05 * eased;
      const grow = L === 0 ? Math.min(1, Math.max(0, (t - 0.35) / 0.7)) : eased;
      const amp = (10 + 8 * L) * E * sc * grow;
      let y =
        base +
        Math.sin((x * 0.008) / sc + t * waveSpeed * (1.9 + L * 0.4)) * amp +
        Math.sin((x * 0.021) / sc - t * waveSpeed * 2.5 + L * 2) * amp * 0.4;
      if (s.px > -100) y -= gauss(x, s.px, 150 * sc) * 18 * E * sc;
      if (t > 0.5 && t < 1.9 && L === 0) {
        y += Math.exp(-2.8 * (t - 0.5)) * Math.sin((t - 0.5) * 32) * 36 * sc * gauss(x, cx, w / 4);
      }
      for (const p of plucks) {
        const age = t - p.t0;
        y += Math.exp(-3 * age) * Math.sin(age * 28) * p.amp * sc * gauss(x, p.x, 110 * sc);
      }
      if (L === 0 && sw > 0) y -= gauss(x, cx, 170 * sc) * 30 * sc * sw;
      return y;
    };
    for (let L = 3; L >= 0; L--) {
      const layerAlpha = (L === 0 ? 1 : eased) * lineA;
      if (layerAlpha <= 0.02) continue;
      const col = L === 1 ? B : A;
      const base = y0 + L * h * 0.05 * eased;
      c.beginPath();
      c.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) c.lineTo(x, yFor(L, x));
      c.lineTo(w, h);
      c.closePath();
      const g = c.createLinearGradient(0, base - 60 * sc, 0, h);
      g.addColorStop(0, rgba(col, 0.15 * layerAlpha));
      g.addColorStop(1, 'rgba(10,16,38,0)');
      c.fillStyle = g;
      c.fill();
      c.strokeStyle = rgba(
        col,
        Math.min(1, (Math.max(0.12, 0.5 - L * 0.11) + (L === 0 ? 0.2 * env : 0)) * layerAlpha),
      );
      c.lineWidth = L === 0 ? 1.8 : 1.4;
      c.shadowColor = col;
      c.shadowBlur = (12 + (L === 0 ? 14 * env : 0)) * layerAlpha;
      c.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = yFor(L, x);
        if (x === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
      c.shadowBlur = 0;
    }
    if (sw > 0.05) {
      const gy = y0 - 30 * sc;
      const g2 = c.createRadialGradient(cx, gy, 0, cx, gy, 150 * sc);
      g2.addColorStop(0, rgba(B, 0.16 * sw));
      g2.addColorStop(1, 'rgba(174,43,83,0)');
      c.fillStyle = g2;
      c.beginPath();
      c.arc(cx, gy, 150 * sc, 0, Math.PI * 2);
      c.fill();
    }
    if (logoEl) {
      const sz = 28;
      logoEl.style.filter =
        `drop-shadow(0 0 ${(sz + 18 * sw).toFixed(1)}px rgba(48,103,246,${(0.45 * (1 - 0.4 * sw)).toFixed(2)})) ` +
        `drop-shadow(0 0 ${(26 * sw).toFixed(1)}px rgba(174,43,83,${(0.6 * sw).toFixed(2)}))`;
      logoEl.style.transform = `scale(${(1 + 0.045 * sw).toFixed(3)})`;
    }
    if (contentEl) {
      const o = Math.min(1, Math.max(0, (t - 0.95) / 0.55));
      const oe = o * o * (3 - 2 * o);
      contentEl.style.opacity = oe.toFixed(3);
      contentEl.style.transform = `translateY(${((1 - oe) * 26).toFixed(1)}px)`;
    }
  }

  onMount(() => {
    logoEl = document.getElementById('hero-logo');
    contentEl = document.getElementById('hero-content');
    const scene: Scene = createCanvasScene({ canvas, draw, reduceMotion, pointerTarget: window });
    const restart = () => {
      scene.resetTime();
      plucks.length = 0;
    };
    window.addEventListener('pointerdown', restart, { passive: true });
    return () => {
      scene.destroy();
      window.removeEventListener('pointerdown', restart);
    };
  });
</script>

<canvas
  bind:this={canvas}
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-0 h-full w-full"
></canvas>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors referencing `HeroWave.svelte`.

- [ ] **Step 3: Commit**

```bash
git add apps/portfolio/src/components/islands/HeroWave.svelte
git commit -m "feat(portfolio): add HeroWave island"
```

---

### Task 7: Dark shell in BaseLayout + dark LanguagePicker

**Files:**
- Modify: `apps/portfolio/src/components/LanguagePicker.astro`
- Modify: `apps/portfolio/src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: `HeaderWave.svelte` (Task 4), `TramaBackground.svelte` (Task 5).
- Produces: `BaseLayout` gains `variant?: 'hero' | 'interior'` (default `'interior'`). Interior mounts `<TramaBackground>` + `<HeaderWave>`. Nav links carry `data-pluck`.

- [ ] **Step 1: Restyle LanguagePicker for dark**

Replace the class expression in `LanguagePicker.astro` (the `class={...}` on the `<a>`):

```astro
        class={`transition-colors duration-200 font-sans ${
          lang === code
            ? 'font-semibold text-white'
            : 'font-normal text-[rgba(211,207,199,0.7)] hover:text-white'
        }`}
```

- [ ] **Step 2: Rewrite BaseLayout as the dark shell**

Replace the entire contents of `apps/portfolio/src/layouts/BaseLayout.astro` with:

```astro
---
import '@/styles/global.css';
import LanguagePicker from '@/components/LanguagePicker.astro';
import HeaderWave from '@/components/islands/HeaderWave.svelte';
import TramaBackground from '@/components/islands/TramaBackground.svelte';
import { useTranslatedPath, useTranslations } from '@/i18n/utils';
import type { Locale } from '@/i18n/utils';

interface Props {
  title: string;
  description?: string;
  lang: Locale;
  currentPath: string;
  variant?: 'hero' | 'interior';
}

const {
  title,
  description = 'mfranceschit — developer',
  lang,
  currentPath,
  variant = 'interior',
} = Astro.props;
const tp = useTranslatedPath(lang);
const t = useTranslations(lang);
const isHero = variant === 'hero';

const navLinks = [
  { href: '/', label: t('nav.home') },
  { href: '/about', label: t('nav.about') },
  { href: '/projects', label: t('nav.projects') },
  { href: '/certifications', label: t('nav.certifications') },
  { href: '/contact', label: t('nav.contact') },
];
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="preconnect" href="https://rsms.me/" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
  </head>
  <body
    class="min-h-screen font-sans text-[#EEF1F7]"
    style="background: linear-gradient(180deg, #0E1733 0%, #0B1226 100%); background-attachment: fixed;"
  >
    {variant === 'interior' && <TramaBackground client:visible waveEnergy={0.75} />}
    <header
      class="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between gap-6 px-7"
      style={isHero
        ? 'background: rgba(14,23,51,0.45); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(255,255,255,0.08);'
        : 'background: rgba(14,23,51,0.94);'}
    >
      <a
        href={tp('/')}
        class="mf-wordmark text-[15px] font-semibold text-white no-underline"
        style="letter-spacing: 0.3em;"
      >
        mfranceschit
      </a>
      <nav class="flex items-center" style="gap: 26px;">
        {
          navLinks.map(({ href, label }) => {
            const active =
              href === '/' ? currentPath === '/' : currentPath.startsWith(href);
            return (
              <a
                href={tp(href)}
                data-pluck
                class:list={[
                  'border-b-2 py-1 text-[13.5px] no-underline transition-colors duration-200',
                  active
                    ? 'border-very-berry font-semibold text-white'
                    : 'border-transparent font-normal text-[rgba(211,207,199,0.62)] hover:text-white',
                ]}
              >
                {label}
              </a>
            );
          })
        }
      </nav>
      <LanguagePicker lang={lang} currentPath={currentPath} />
    </header>
    {variant === 'interior' && <HeaderWave client:load waveEnergy={0.75} />}
    <main class="relative z-10 pt-16">
      <slot />
    </main>
  </body>
</html>
```

- [ ] **Step 3: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add apps/portfolio/src/layouts/BaseLayout.astro apps/portfolio/src/components/LanguagePicker.astro
git commit -m "feat(portfolio): dark shell with variant and interior islands"
```

---

### Task 8: Hero page (2a)

**Files:**
- Modify: `apps/portfolio/src/pages/[locale]/index.astro`

**Interfaces:**
- Consumes: `BaseLayout` `variant="hero"` (Task 7); `HeroWave.svelte` (Task 6); ids `hero-logo`, `hero-content` (read by HeroWave).

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `apps/portfolio/src/pages/[locale]/index.astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import HeroWave from '@/components/islands/HeroWave.svelte';
import { useTranslations, useTranslatedPath, getStaticLocalePaths } from '@/i18n/utils';
import type { Locale } from '@/i18n/utils';

export function getStaticPaths() {
  return getStaticLocalePaths();
}

const { locale } = Astro.params as { locale: Locale };
const t = useTranslations(locale);
const tp = useTranslatedPath(locale);
---

<BaseLayout title={t('meta.home.title')} description={t('meta.home.description')} lang={locale} currentPath="/" variant="hero">
  <HeroWave client:load waveEnergy={0.75} />
  <section
    class="relative z-10 flex flex-col items-center justify-center px-6 text-center"
    style="min-height: calc(100vh - 64px); gap: 22px; padding-bottom: 200px;"
  >
    <img
      id="hero-logo"
      src="/monogram-beige.svg"
      alt=""
      aria-hidden="true"
      style="height: 80px; width: auto; filter: drop-shadow(0 0 28px rgba(48,103,246,0.45));"
    />
    <div id="hero-content" class="flex flex-col items-center" style="gap: 22px;">
      <div class="mf-wordmark text-[42px] font-bold text-white" style="letter-spacing: 0.14em;">
        mfranceschit
      </div>
      <div>
        <h1 class="text-[25px] font-semibold text-[rgba(238,241,247,0.95)]">{t('home.title')}</h1>
        <p class="mt-1 text-[17px] text-[rgba(211,207,199,0.72)]">{t('home.subtitle')}</p>
      </div>
      <div class="flex items-center" style="gap: 14px; margin-top: 8px;">
        <a
          href={tp('/projects')}
          class="rounded-lg text-[15px] font-semibold text-[#EEF1F7] no-underline"
          style="padding: 13px 26px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(8px);"
        >
          {t('nav.projects')}
        </a>
        <a
          href={tp('/contact')}
          class="rounded-lg text-[15px] font-semibold text-white no-underline"
          style="padding: 13px 26px; background: linear-gradient(135deg, #C03E66, #AE2B53); box-shadow: 0 0 28px rgba(174,43,83,0.45);"
        >
          {t('contact.cta')}
        </a>
      </div>
    </div>
    <div
      class="fixed bottom-4 right-5 text-[12px] font-medium text-[rgba(211,207,199,0.45)]"
      style="letter-spacing: 0.16em;"
    >
      72 BPM · ANDANTE
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors.

- [ ] **Step 3: Visual check (owner-run dev server)**

Confirm: monogram beige with blue glow; on load the wave fades in, a strike ripple crosses center, the 3 back layers separate downward, the content column fades + rises; every 4 beats the monogram scales up ~1.045 with a berry glow and the water swells; moving the cursor lifts the water locally; clicking anywhere restarts the entrance. Caption pinned bottom-right.

- [ ] **Step 4: Commit**

```bash
git add "apps/portfolio/src/pages/[locale]/index.astro"
git commit -m "feat(portfolio): rebuild hero (2a) with Marea v2"
```

---

### Task 9: Projects list page (6a)

**Files:**
- Modify: `apps/portfolio/src/pages/[locale]/projects/index.astro`

**Interfaces:**
- Consumes: `BaseLayout` default interior (Task 7); `getProjects` (existing). Cards carry `data-pluck`.

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `apps/portfolio/src/pages/[locale]/projects/index.astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { useTranslations, useTranslatedPath, getStaticLocalePaths } from '@/i18n/utils';
import type { Locale } from '@/i18n/utils';
import { getProjects } from '@/lib/sanity';

export function getStaticPaths() {
  return getStaticLocalePaths();
}

const { locale } = Astro.params as { locale: Locale };
const t = useTranslations(locale);
const tp = useTranslatedPath(locale);
const projects = await getProjects();
---

<BaseLayout title={t('meta.projects.title')} description={t('meta.projects.description')} lang={locale} currentPath="/projects">
  <section class="mx-auto max-w-[720px]" style="padding: 56px 24px 120px;">
    <h1 class="mb-[30px] text-[44px] font-bold text-white" style="letter-spacing: -0.015em;">
      {t('projects.title')}
    </h1>
    <ul class="m-0 flex list-none flex-col gap-4 p-0">
      {
        projects.map((project) => (
          <li>
            <a
              href={tp(`/projects/${project.slug}`)}
              data-pluck
              class="group flex items-start justify-between gap-4 rounded-lg no-underline transition-all duration-200 ease-out hover:-translate-y-0.5"
              style="padding: 22px 24px; background: rgba(14,23,51,0.55); border: 1px solid rgba(255,255,255,0.10);"
            >
              <div class="min-w-0">
                <span class="text-[17px] font-semibold text-[#F4F6FB]">{project.name}</span>
                {project.technologies?.length > 0 && (
                  <div class="mt-3 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        class="rounded text-[12px] font-medium text-[rgba(222,228,240,0.7)]"
                        style="padding: 3px 10px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.10);"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span class="mt-0.5 shrink-0 whitespace-nowrap text-[14px] font-semibold text-[#7FA3FF]">
                {t('projects.view')} →
              </span>
            </a>
          </li>
        ))
      }
    </ul>
  </section>
</BaseLayout>

<style>
  a[data-pluck]:hover {
    border-color: rgba(48, 103, 246, 0.55) !important;
    box-shadow: 0 0 34px rgba(48, 103, 246, 0.18);
  }
</style>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors.

- [ ] **Step 3: Visual check (owner-run dev server)**

Confirm: trama fragments float behind near-opaque cards; hovering a card lifts it, turns its border blue with a blue glow, and plucks the header wave.

- [ ] **Step 4: Commit**

```bash
git add "apps/portfolio/src/pages/[locale]/projects/index.astro"
git commit -m "feat(portfolio): rebuild projects list (6a)"
```

---

### Task 10: Project detail page (6b)

**Files:**
- Modify: `apps/portfolio/src/pages/[locale]/projects/[slug].astro`

**Interfaces:**
- Consumes: `BaseLayout` interior (Task 7); `getProjects`, `getProject`, `renderBlocks` (existing). Back link, chips, action buttons carry `data-pluck`.

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `apps/portfolio/src/pages/[locale]/projects/[slug].astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { useTranslations, useTranslatedPath, locales } from '@/i18n/utils';
import type { Locale } from '@/i18n/utils';
import { getProjects, getProject, renderBlocks } from '@/lib/sanity';

export async function getStaticPaths() {
  const projects = await getProjects();
  return locales.flatMap((locale) =>
    projects.map((project) => ({
      params: { locale, slug: project.slug },
    })),
  );
}

const { locale, slug } = Astro.params as { locale: Locale; slug: string };
const t = useTranslations(locale);
const tp = useTranslatedPath(locale);
const project = await getProject(slug, locale);
const descriptionParagraphs = renderBlocks(project.description ?? []);
---

<BaseLayout title={project.name} lang={locale} currentPath={`/projects/${slug}`}>
  <article class="mx-auto max-w-[720px]" style="padding: 48px 24px 120px;">
    <a
      href={tp('/projects')}
      data-pluck
      class="mb-[22px] inline-block text-[14px] text-[rgba(211,207,199,0.6)] no-underline transition-colors duration-200 hover:text-[#7FA3FF]"
    >
      ← {t('projects.title')}
    </a>

    <h1 class="mb-6 text-[40px] font-bold text-white" style="letter-spacing: -0.015em; line-height: 1.15;">
      {project.name}
    </h1>

    <div
      class="mb-7 flex h-[220px] items-center justify-center rounded-lg"
      style="background: linear-gradient(135deg, #142142, #0E1733); border: 1px solid rgba(255,255,255,0.10);"
    >
      {
        project.image ? (
          <img src={project.image} alt={project.name} class="h-full w-full rounded-lg object-cover" />
        ) : (
          <img
            src="/monogram-beige.svg"
            alt=""
            aria-hidden="true"
            style="height: 68px; width: auto; opacity: 0.85; filter: drop-shadow(0 0 20px rgba(48,103,246,0.4));"
          />
        )
      }
    </div>

    {
      descriptionParagraphs.length > 0 && (
        <section class="mb-7">
          <h3 class="mb-2 text-[22px] font-semibold text-[#F4F6FB]">{t('projects.summary')}</h3>
          <div class="flex flex-col gap-3 text-[16px] leading-[1.7] text-[rgba(222,228,240,0.82)]">
            {descriptionParagraphs.map((p) => <p>{p}</p>)}
          </div>
        </section>
      )
    }

    {
      project.technologies?.length > 0 && (
        <section class="mb-7">
          <h3 class="mb-3 text-[22px] font-semibold text-[#F4F6FB]">{t('projects.stack')}</h3>
          <div class="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                data-pluck
                class="rounded text-[13px] font-medium text-[#9DB9FF] transition-colors duration-200 hover:border-[rgba(48,103,246,0.7)]"
                style="padding: 5px 12px; background: rgba(48,103,246,0.16); border: 1px solid rgba(48,103,246,0.35);"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      )
    }

    <div class="flex" style="gap: 14px;">
      {
        project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            data-pluck
            class="rounded-lg text-[#CFE0FF] no-underline transition-colors duration-200 hover:bg-[rgba(48,103,246,0.28)]"
            style="padding: 11px 22px; background: rgba(48,103,246,0.18); border: 1px solid rgba(48,103,246,0.45);"
          >
            ↗ Live site
          </a>
        )
      }
      {
        project.repository && (
          <a
            href={project.repository}
            target="_blank"
            rel="noopener noreferrer"
            data-pluck
            class="rounded-lg text-[#EEF1F7] no-underline transition-colors duration-200 hover:bg-[rgba(255,255,255,0.09)]"
            style="padding: 11px 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.16);"
          >
            ★ Repository
          </a>
        )
      }
    </div>
  </article>
</BaseLayout>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors.

- [ ] **Step 3: Visual check (owner-run dev server)**

Confirm: cover panel gradient with beige monogram fallback (or Sanity image); blue chips and both action buttons hover-brighten and pluck the header wave; back link hover turns blue.

- [ ] **Step 4: Commit**

```bash
git add "apps/portfolio/src/pages/[locale]/projects/[slug].astro"
git commit -m "feat(portfolio): rebuild project detail (6b)"
```

---

### Task 11: Certifications page (6c)

**Files:**
- Modify: `apps/portfolio/src/pages/[locale]/certifications.astro`

**Interfaces:**
- Consumes: `BaseLayout` interior (Task 7); `getCertifications`, `getDegrees` (existing). Row cards carry `data-pluck`.

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `apps/portfolio/src/pages/[locale]/certifications.astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { useTranslations, getStaticLocalePaths } from '@/i18n/utils';
import type { Locale } from '@/i18n/utils';
import { getCertifications, getDegrees } from '@/lib/sanity';

export function getStaticPaths() {
  return getStaticLocalePaths();
}

const { locale } = Astro.params as { locale: Locale };
const t = useTranslations(locale);
const [certifications, degrees] = await Promise.all([
  getCertifications(locale),
  getDegrees(locale),
]);
---

<BaseLayout title={t('meta.certifications.title')} description={t('meta.certifications.description')} lang={locale} currentPath="/certifications">
  <section class="mx-auto max-w-[720px]" style="padding: 56px 24px 120px;">
    <h1 class="mb-[30px] text-[44px] font-bold text-white" style="letter-spacing: -0.015em;">
      {t('certifications.title')}
    </h1>

    <h2 class="mb-3.5 text-[22px] font-semibold text-[#F4F6FB]">{t('certifications.certificates')}</h2>
    <ul class="m-0 flex list-none flex-col gap-3 p-0" style="margin-bottom: 38px;">
      {
        certifications.map((cert) => (
          <li
            data-pluck
            class="flex items-center gap-4 rounded-lg transition-colors duration-200"
            style="padding: 16px 18px; background: rgba(14,23,51,0.55); border: 1px solid rgba(255,255,255,0.10);"
          >
            {cert.image ? (
              <img src={cert.image} alt={cert.name} class="h-12 w-12 shrink-0 rounded-md object-contain" />
            ) : (
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
                style="background: #D3CFC7;"
              >
                <img src="/monogram-navy.svg" alt="" aria-hidden="true" style="height: 28px; width: auto;" />
              </div>
            )}
            <div class="min-w-0 flex-1">
              <p class="text-[14px] font-semibold text-[#F4F6FB]">{cert.name}</p>
              {cert.issued && <p class="mt-0.5 text-[12px] text-[rgba(211,207,199,0.6)]">{cert.issued}</p>}
            </div>
            <div class="flex shrink-0 items-center" style="gap: 14px;">
              {cert.date && (
                <span class="text-[12px] tabular-nums text-[rgba(156,163,175,0.7)]">{cert.date}</span>
              )}
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[13px] font-medium text-[#7FA3FF] no-underline"
                >
                  {t('projects.view')} →
                </a>
              )}
            </div>
          </li>
        ))
      }
    </ul>

    <h2 class="mb-3.5 text-[22px] font-semibold text-[#F4F6FB]">{t('certifications.degrees')}</h2>
    <ul class="m-0 flex list-none flex-col gap-3 p-0">
      {
        degrees.map((degree) => (
          <li
            data-pluck
            class="flex items-center gap-4 rounded-lg transition-colors duration-200"
            style="padding: 16px 18px; background: rgba(14,23,51,0.55); border: 1px solid rgba(255,255,255,0.10);"
          >
            {degree.image ? (
              <img src={degree.image} alt={degree.name} class="h-12 w-12 shrink-0 rounded-md object-contain" />
            ) : (
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
                style="background: #D3CFC7;"
              >
                <img src="/monogram-navy.svg" alt="" aria-hidden="true" style="height: 28px; width: auto;" />
              </div>
            )}
            <div class="min-w-0 flex-1">
              <p class="text-[14px] font-semibold text-[#F4F6FB]">{degree.name}</p>
              {degree.issued && <p class="mt-0.5 text-[12px] text-[rgba(211,207,199,0.6)]">{degree.issued}</p>}
            </div>
          </li>
        ))
      }
    </ul>
  </section>
</BaseLayout>

<style>
  li[data-pluck]:hover {
    border-color: rgba(48, 103, 246, 0.55) !important;
  }
</style>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors.

- [ ] **Step 3: Visual check (owner-run dev server)**

Confirm: two groups; sand badges with navy monogram; row hover turns border blue and plucks the header wave; certificate rows show year (tabular) + Ver →.

- [ ] **Step 4: Commit**

```bash
git add "apps/portfolio/src/pages/[locale]/certifications.astro"
git commit -m "feat(portfolio): rebuild certifications (6c)"
```

---

### Task 12: Contact page (6d)

**Files:**
- Modify: `apps/portfolio/src/pages/[locale]/contact.astro`

**Interfaces:**
- Consumes: `BaseLayout` interior (Task 7). Inputs carry `data-pluck` (focus plucks the header wave). Keeps the existing Formspree submit script.

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `apps/portfolio/src/pages/[locale]/contact.astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { useTranslations, getStaticLocalePaths } from '@/i18n/utils';
import type { Locale } from '@/i18n/utils';

export function getStaticPaths() {
  return getStaticLocalePaths();
}

const { locale } = Astro.params as { locale: Locale };
const t = useTranslations(locale);
const formspreeEndpoint = `https://formspree.io/f/${import.meta.env.FORMSPREE_KEY}`;

const fieldClass =
  'rounded-lg text-[14px] text-[#EEF1F7] placeholder:text-[rgba(156,163,175,0.55)] outline-none transition-all duration-200 mf-field';
---

<BaseLayout title={t('meta.contact.title')} description={t('meta.contact.description')} lang={locale} currentPath="/contact">
  <section class="mx-auto max-w-[540px]" style="padding: 56px 24px 120px;">
    <h1 class="mb-4 text-[44px] font-bold text-white" style="letter-spacing: -0.015em;">
      {t('contact.title')}
    </h1>
    <p class="mb-[30px] text-[16px] text-[rgba(211,207,199,0.7)]">{t('contact.description')}</p>

    <div id="form-view">
      <form id="contact-form" action={formspreeEndpoint} method="POST" class="flex flex-col" style="gap: 18px;">
        <div class="flex flex-col" style="gap: 6px;">
          <label for="name" class="text-[13.5px] font-medium text-[rgba(222,228,240,0.85)]">
            {t('contact.name')} <span class="text-[#D98AA1]">*</span>
          </label>
          <input id="name" type="text" name="name" required placeholder="Your name" data-pluck class={fieldClass} />
        </div>

        <div class="flex flex-col" style="gap: 6px;">
          <label for="email" class="text-[13.5px] font-medium text-[rgba(222,228,240,0.85)]">
            {t('contact.email')} <span class="text-[#D98AA1]">*</span>
          </label>
          <input id="email" type="email" name="email" required placeholder="you@example.com" data-pluck class={fieldClass} />
        </div>

        <div class="flex flex-col" style="gap: 6px;">
          <label for="subject" class="text-[13.5px] font-medium text-[rgba(222,228,240,0.85)]">
            {t('contact.subject')}
          </label>
          <input id="subject" type="text" name="subject" placeholder="What's this about?" data-pluck class={fieldClass} />
        </div>

        <div class="flex flex-col" style="gap: 6px;">
          <label for="message" class="text-[13.5px] font-medium text-[rgba(222,228,240,0.85)]">
            {t('contact.message')} <span class="text-[#D98AA1]">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="Tell me about your project…"
            data-pluck
            class={`${fieldClass} resize-none`}
            style="min-height: 110px;"
          ></textarea>
        </div>

        <button
          type="submit"
          class="rounded-lg text-[15px] font-semibold text-white transition-shadow duration-200 mf-submit"
          style="padding: 13px 28px; margin-top: 6px; background: linear-gradient(135deg, #C03E66, #AE2B53); box-shadow: 0 0 28px rgba(174,43,83,0.45);"
        >
          {t('contact.cta')}
        </button>
      </form>
    </div>

    <div id="success-view" class="hidden">
      <div class="rounded-lg text-center" style="padding: 28px; background: rgba(14,23,51,0.55); border: 1px solid rgba(255,255,255,0.10);">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md" style="background: #D3CFC7;">
          <img src="/monogram-navy.svg" alt="" aria-hidden="true" style="height: 36px; width: auto;" />
        </div>
        <h3 class="mb-1.5 text-[22px] font-semibold text-[#F4F6FB]">Message sent</h3>
        <p class="text-[14px] text-[rgba(211,207,199,0.7)]">Thanks — I'll get back to you soon.</p>
        <button
          id="send-another"
          class="mt-4 text-[14px] text-[rgba(211,207,199,0.7)] outline-none transition-colors duration-200 hover:text-white"
        >
          Send another
        </button>
      </div>
    </div>
  </section>
</BaseLayout>

<style>
  .mf-field {
    padding: 11px 16px;
    background: rgba(14, 23, 51, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.14);
  }
  .mf-field:focus {
    border-color: #3067f6;
    box-shadow: 0 0 0 3px rgba(48, 103, 246, 0.25);
  }
  .mf-submit:hover {
    box-shadow: 0 0 40px rgba(174, 43, 83, 0.6);
  }
</style>

<script>
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const formView = document.getElementById('form-view');
  const successView = document.getElementById('success-view');
  const sendAnother = document.getElementById('send-another');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        formView?.classList.add('hidden');
        successView?.classList.remove('hidden');
        form.reset();
      }
    } catch {
      form.submit();
    }
  });

  sendAnother?.addEventListener('click', () => {
    successView?.classList.add('hidden');
    formView?.classList.remove('hidden');
  });
</script>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors.

- [ ] **Step 3: Visual check (owner-run dev server)**

Confirm: dark inputs; focusing any field shows the blue ring AND plucks the header wave; submit button glows brighter on hover; success view is dark.

- [ ] **Step 4: Commit**

```bash
git add "apps/portfolio/src/pages/[locale]/contact.astro"
git commit -m "feat(portfolio): rebuild contact (6d) with focus pluck"
```

---

### Task 13: Dark restyle of the about page

**Files:**
- Modify: `apps/portfolio/src/pages/[locale]/about.astro`

**Interfaces:**
- Consumes: `BaseLayout` interior (Task 7). Not held to a mock; dark-legible only. Replaces the shared `Badge` with bespoke dark chips (the shared Badge is light-only).

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `apps/portfolio/src/pages/[locale]/about.astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { useTranslations, getStaticLocalePaths } from '@/i18n/utils';
import type { Locale } from '@/i18n/utils';
import { aboutDescriptions } from '@/i18n/ui';

export function getStaticPaths() {
  return getStaticLocalePaths();
}

const { locale } = Astro.params as { locale: Locale };
const t = useTranslations(locale);
const paragraphs = aboutDescriptions[locale];

const stack = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Astro',
  'AWS', 'GCP', 'Azure', 'Terraform', 'Docker', 'New Relic',
];
---

<BaseLayout title={t('meta.about.title')} description={t('meta.about.description')} lang={locale} currentPath="/about">
  <section class="mx-auto max-w-[720px]" style="padding: 56px 24px 120px;">
    <h1 class="mb-[30px] text-[44px] font-bold text-white" style="letter-spacing: -0.015em;">
      {t('about.title')}
    </h1>
    <div class="flex flex-col gap-4 text-[16px] leading-[1.7] text-[rgba(222,228,240,0.82)]">
      {paragraphs.map((paragraph) => <p>{paragraph}</p>)}
    </div>
    <h3 class="mb-3.5 mt-10 text-[22px] font-semibold text-[#F4F6FB]">{t('projects.stack')}</h3>
    <div class="flex flex-wrap gap-2">
      {
        stack.map((tech) => (
          <span
            class="rounded text-[13px] font-medium text-[#9DB9FF]"
            style="padding: 5px 12px; background: rgba(48,103,246,0.16); border: 1px solid rgba(48,103,246,0.35);"
          >
            {tech}
          </span>
        ))
      }
    </div>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Typecheck**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add "apps/portfolio/src/pages/[locale]/about.astro"
git commit -m "feat(portfolio): dark restyle about page"
```

---

### Task 14: Full-project typecheck and final review

**Files:**
- None (verification only).

- [ ] **Step 1: Typecheck the whole portfolio app**

Run: `fnm exec -- pnpm --filter @mfranceschit/portfolio typecheck`
Expected: passes with no errors.

- [ ] **Step 2: Owner visual pass across all five screens**

Walk each screen against the spec: hero entrance/beat/cursor/restart (2a); trama idle + cursor + click-drop on 6a–6d; header wave idle + scroll fill (birch→berry tip + berry glow) + velocity amplitude + completion pulse at bottom + pluck on nav/cards/chips/buttons/form focus. Verify `prefers-reduced-motion` slows everything and hidden tabs pause.

- [ ] **Step 3: Confirm no stray commits**

Run: `git status`
Expected: clean working tree; all changes committed across Tasks 1–13.

## Self-Review

**Spec coverage:**
- Shared chrome / dark header / wordmark / nav / language picker → Task 7. ✅
- Header wave (idle, scroll progress, velocity, completion, pluck) → Task 4. ✅
- Trama background (grid, idle, cursor, drop) → Task 5. ✅
- Hero 2a (entrance, beat swell, cursor lift, restart, DOM drive, buttons, caption) → Tasks 6 + 8. ✅
- Projects 6a → Task 9. Detail 6b → Task 10. Certifications 6c → Task 11. Contact 6d → Task 12. ✅
- Dark shell incl. about → Task 13. ✅
- Assets → Task 1. Pure math + loop → Tasks 2–3. `beatEnv`, `gauss`, `rgba`, `accents`, `hdrWave`, `trama`, `hero2`, `makePluck`, `makeScrollRef` all ported. ✅
- Reduced motion / hidden pause / IntersectionObserver / DPR → Task 3 (applied by all islands). ✅
- Sanity wiring unchanged → Tasks 9–11 reuse existing functions. ✅

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every command has expected output.

**Type consistency:** `SceneCtx`/`SceneOptions`/`Scene`/`createCanvasScene` (Task 3) are consumed with matching names/signatures in Tasks 4–6. `AccentMode`, `beatEnv`, `gauss`, `rgba`, `accents`, `BEAT_PERIOD` (Task 2) are imported with matching names. `variant` prop (Task 7) matches usage in Task 8 (`variant="hero"`) and default interior in Tasks 9–13. Ids `hero-logo`/`hero-content` (Task 8) match `getElementById` reads (Task 6).
