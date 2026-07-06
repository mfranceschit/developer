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
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return { destroy() {}, resetTime() {} };
  const ctx: CanvasRenderingContext2D = maybeCtx;

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
