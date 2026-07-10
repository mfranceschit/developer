<script lang="ts">
  import { onMount } from 'svelte';
  import { createCanvasScene, type Scene, type SceneCtx } from '@/lib/canvas/canvas-loop';
  import { type AccentMode, accents, gauss, rgba } from '@/lib/canvas/wave-math';

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

  function mixRgba(
    a: [number, number, number],
    b: [number, number, number],
    k: number,
    alpha: number,
  ): string {
    const r = Math.round(a[0] + (b[0] - a[0]) * k);
    const g = Math.round(a[1] + (b[1] - a[1]) * k);
    const bl = Math.round(a[2] + (b[2] - a[2]) * k);
    return `rgba(${r},${g},${bl},${alpha})`;
  }

  function draw(s: SceneCtx) {
    const { ctx: c, t, w } = s;
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
