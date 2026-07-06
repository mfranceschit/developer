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
