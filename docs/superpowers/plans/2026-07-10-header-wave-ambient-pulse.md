# HeaderWave Ambient Pulse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace HeaderWave's scroll-progress effect with a self-contained "drifting berry current" ambient loop.

**Architecture:** Single Svelte island (`HeaderWave.svelte`) draws on a canvas via the shared `createCanvasScene` loop. All scroll coupling is removed; the main line is stroked in 5px segments whose color/alpha follow a gaussian falloff around a drift center that loops across the strip every 6s. Glow is faked with a second wider low-alpha stroke because `canvas-loop.ts` no-ops `shadowBlur`.

**Tech Stack:** Svelte 5 (runes), Canvas 2D, Astro island (`client:load`), Playwright (verification only).

**Spec:** `docs/superpowers/specs/2026-07-10-header-wave-ambient-pulse-design.md`

## Global Constraints

- Only `apps/portfolio/src/components/islands/HeaderWave.svelte` may change; HeroWave, `canvas-loop.ts`, `wave-math.ts`, layouts, and markup stay untouched.
- Drift period: 6s. Span: `0.2 * w`. Segment alpha: `0.5 + 0.35 * k`. Glow pass: ~4px stroke at `0.18 * k` alpha, only where `k > 0.05`.
- Wave amplitude: constant `1.6 * waveEnergy` (no scroll velocity input).
- Keep props (`waveSpeed`, `waveEnergy`, `accentMode`, `reduceMotion`), pluck ripples, canvas placement (`top: 44px; height: 40px`), and `pointer-events-none` classes exactly as they are.
- No comments in code unless a WHY is non-obvious (project rule). No emojis.
- Do NOT run `pnpm dev` / `pnpm build`; the dev server is already running on http://localhost:4321.
- Node commands need fnm: prefix with `export PATH="/Users/marco/.local/share/fnm/aliases/default/bin:$PATH"`.
- Commits in this plan are pre-authorized by the user via plan approval. No Co-Authored-By lines, no AI attribution.

---

### Task 1: Rewrite HeaderWave draw loop

**Files:**
- Modify: `apps/portfolio/src/components/islands/HeaderWave.svelte` (whole file)

**Interfaces:**
- Consumes: `createCanvasScene({ canvas, draw, reduceMotion, pointerTarget })` from `@/lib/canvas/canvas-loop`; `accents(mode): [hexA, hexB]`, `gauss(x, c, s)`, `rgba(hex, a)` from `@/lib/canvas/wave-math`.
- Produces: same component public API as before (props unchanged), consumed by `BaseLayout.astro` line 141 — no caller changes.

There is no unit-test framework in `apps/portfolio` (no `test` script); canvas painting is verified end-to-end in Task 2 instead of TDD.

- [ ] **Step 1: Replace the component implementation**

Replace the entire contents of `apps/portfolio/src/components/islands/HeaderWave.svelte` with:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { createCanvasScene, type Scene, type SceneCtx } from '@/lib/canvas/canvas-loop';
  import { accents, gauss, rgba, type AccentMode } from '@/lib/canvas/wave-math';

  interface Props {
    waveSpeed?: number;
    waveEnergy?: number;
    accentMode?: AccentMode;
    reduceMotion?: boolean;
  }
  const { waveSpeed = 1, waveEnergy = 0.75, accentMode = 'dual', reduceMotion }: Props = $props();

  const DRIFT_PERIOD = 6;
  const DRIFT_SPAN = 0.2;

  let canvas: HTMLCanvasElement;

  const plucks: { x: number; t0: number }[] = [];
  let currentT = 0;
  let currentW = 1;

  function onPluck(e: Event) {
    const el = (e.target as HTMLElement | null)?.closest?.('[data-pluck]');
    if (!el) return;
    const r = canvas.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const x = (er.left + er.width / 2 - r.left) * (currentW / r.width);
    plucks.push({ x, t0: currentT });
  }

  function hexToRgb(hex: string): [number, number, number] {
    const n = Number.parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }

  function mixRgba(a: [number, number, number], b: [number, number, number], k: number, alpha: number): string {
    const r = Math.round(a[0] + (b[0] - a[0]) * k);
    const g = Math.round(a[1] + (b[1] - a[1]) * k);
    const bl = Math.round(a[2] + (b[2] - a[2]) * k);
    return `rgba(${r},${g},${bl},${alpha})`;
  }

  function draw(s: SceneCtx) {
    const { ctx: c, t, w, h } = s;
    currentT = t;
    currentW = w;
    const [A, B] = accents(accentMode);
    const rgbA = hexToRgb(A);
    const rgbB = hexToRgb(B);
    const sp = waveSpeed;
    const y0 = 20;
    for (let i = plucks.length - 1; i >= 0; i--) if (t - plucks[i].t0 >= 2.5) plucks.splice(i, 1);
    const amp = 1.6 * waveEnergy;
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
    const span = w * DRIFT_SPAN;
    const cx = ((t % DRIFT_PERIOD) / DRIFT_PERIOD) * (w + span * 2) - span;
    let prevX = 0;
    let prevY = yFor(0);
    for (let x = 5; x <= w; x += 5) {
      const y = yFor(x);
      const k = gauss(x, cx, span);
      if (k > 0.05) {
        c.strokeStyle = mixRgba(rgbA, rgbB, k, 0.18 * k);
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(prevX, prevY);
        c.lineTo(x, y);
        c.stroke();
      }
      c.strokeStyle = mixRgba(rgbA, rgbB, k, 0.5 + 0.35 * k);
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(prevX, prevY);
      c.lineTo(x, y);
      c.stroke();
      prevX = x;
      prevY = y;
    }
  }

  onMount(() => {
    const scene: Scene = createCanvasScene({ canvas, draw, reduceMotion, pointerTarget: window });
    document.addEventListener('pointerover', onPluck, { passive: true });
    document.addEventListener('focusin', onPluck, { passive: true });
    return () => {
      scene.destroy();
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

- [ ] **Step 2: Type-check the portfolio app**

Run:
```bash
export PATH="/Users/marco/.local/share/fnm/aliases/default/bin:$PATH" && cd /Users/marco/Projects/mfranceschit/developer/apps/portfolio && pnpm typecheck
```
Expected: `astro check` completes with 0 errors in `HeaderWave.svelte` (pre-existing errors elsewhere, if any, are out of scope).

- [ ] **Step 3: Commit**

```bash
cd /Users/marco/Projects/mfranceschit/developer
git add apps/portfolio/src/components/islands/HeaderWave.svelte
git commit -m "feat(portfolio): replace header wave scroll progress with ambient berry drift"
```

---

### Task 2: End-to-end verification with Playwright

**Files:**
- Create: `/private/tmp/claude-501/-Users-marco-Projects-mfranceschit-developer/3179ecc7-d75f-46e5-afb4-fc3983c10546/scratchpad/verify-header-wave.mjs` (scratchpad — not committed)

**Interfaces:**
- Consumes: dev server at `http://localhost:4321/en/projects` (interior page rendering `HeaderWave`); Playwright already installed in the scratchpad (`npm i playwright` done previously).
- Produces: console PASS/FAIL report; screenshot `header-wave.png` in the scratchpad for visual review.

- [ ] **Step 1: Write the verification script**

Create `verify-header-wave.mjs` in the scratchpad:

```js
import { chromium } from 'playwright';

const URL = 'http://localhost:4321/en/projects';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const canvasInfo = await page.evaluate(() => {
  const cv = document.querySelector('canvas[style*="top: 44px"]');
  if (!cv) return null;
  return { w: cv.width, h: cv.height };
});

async function snapshotPixels() {
  return page.evaluate(() => {
    const cv = document.querySelector('canvas[style*="top: 44px"]');
    const ctx = cv.getContext('2d');
    const d = ctx.getImageData(0, 0, cv.width, Math.min(cv.height, 80)).data;
    let sum = 0, redSum = 0, blueSum = 0;
    for (let i = 0; i < d.length; i += 4) {
      sum += d[i + 3];
      redSum += d[i];
      blueSum += d[i + 2];
    }
    return { alpha: sum, red: redSum, blue: blueSum };
  });
}

const s1 = await snapshotPixels();
await page.waitForTimeout(1500);
const s2 = await snapshotPixels();
await page.waitForTimeout(1500);
const s3 = await snapshotPixels();

const painted = s1.alpha > 0;
const animating = s1.red !== s2.red || s2.red !== s3.red;
const hasBerry = [s1, s2, s3].some((s) => s.red > 0);
const hasBirch = [s1, s2, s3].some((s) => s.blue > 0);

const scrollBound = await page.evaluate(() => {
  window.scrollTo(0, 200);
  return new Promise((res) => setTimeout(() => { window.scrollTo(0, 0); res(true); }, 300));
});

await page.screenshot({ path: 'header-wave.png', clip: { x: 0, y: 30, width: 1280, height: 70 } });
await browser.close();

console.log(`canvas found: ${!!canvasInfo}`);
console.log(`painted: ${painted}`);
console.log(`animating (pixels change over time): ${animating}`);
console.log(`berry present: ${hasBerry}, birch present: ${hasBirch}`);
console.log(`page errors: ${errors.length === 0 ? 'none' : errors.join(' | ')}`);
console.log(`scroll exercised without error: ${scrollBound}`);
const ok = !!canvasInfo && painted && animating && hasBerry && hasBirch && errors.length === 0;
console.log(ok ? 'PASS' : 'FAIL');
process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Run it**

```bash
export PATH="/Users/marco/.local/share/fnm/aliases/default/bin:$PATH" && cd /private/tmp/claude-501/-Users-marco-Projects-mfranceschit-developer/3179ecc7-d75f-46e5-afb4-fc3983c10546/scratchpad && node verify-header-wave.mjs
```
Expected: all checks true, final line `PASS`, exit code 0.

- [ ] **Step 3: Show the screenshot to the user**

Read `header-wave.png` (image) and report results; ask the user to also eyeball the live page against the approved mockup (option 3, "Lively", in the brainstorm session).

- [ ] **Step 4: Commit the spec and plan docs**

```bash
cd /Users/marco/Projects/mfranceschit/developer
git add docs/superpowers/specs/2026-07-10-header-wave-ambient-pulse-design.md docs/superpowers/plans/2026-07-10-header-wave-ambient-pulse.md
git commit -m "docs: add header wave ambient pulse spec and plan"
```
