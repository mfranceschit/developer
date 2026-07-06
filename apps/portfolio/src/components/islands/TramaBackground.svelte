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
