<script lang="ts">
  import { onMount } from 'svelte';
  import { createCanvasScene, type Scene, type SceneCtx } from '@/lib/canvas/canvas-loop';
  import { accents, beatEnv, gauss, rgba, BEAT_PERIOD, type AccentMode } from '@/lib/canvas/wave-math';
  import { colors } from '@mfranceschit/ui';

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
  let reduceMotionActive = false;

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
      g.addColorStop(1, rgba(colors.blue[950], 0));
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
      g2.addColorStop(1, rgba(B, 0));
      c.fillStyle = g2;
      c.beginPath();
      c.arc(cx, gy, 150 * sc, 0, Math.PI * 2);
      c.fill();
    }
    if (logoEl && !reduceMotionActive) {
      const sz = 28;
      logoEl.style.filter =
        `drop-shadow(0 0 ${(sz + 18 * sw).toFixed(1)}px rgba(48,103,246,${(0.45 * (1 - 0.4 * sw)).toFixed(2)})) ` +
        `drop-shadow(0 0 ${(26 * sw).toFixed(1)}px rgba(174,43,83,${(0.6 * sw).toFixed(2)}))`;
      logoEl.style.transform = `scale(${(1 + 0.045 * sw).toFixed(3)})`;
    }
    if (contentEl && !reduceMotionActive) {
      const o = Math.min(1, Math.max(0, (t - 0.95) / 0.55));
      const oe = o * o * (3 - 2 * o);
      contentEl.style.opacity = oe.toFixed(3);
      contentEl.style.transform = `translateY(${((1 - oe) * 26).toFixed(1)}px)`;
    }
  }

  onMount(() => {
    logoEl = document.getElementById('hero-logo');
    contentEl = document.getElementById('hero-content');
    reduceMotionActive =
      reduceMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene: Scene = createCanvasScene({ canvas, draw, reduceMotion, pointerTarget: window });
    const restart = () => {
      scene.resetTime();
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
