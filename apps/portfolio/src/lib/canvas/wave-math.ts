import { colors } from '@mfranceschit/ui';

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
  if (mode === 'birch') return [colors.silverBirch, colors.silverBirch];
  if (mode === 'berry') return [colors.veryBerry, colors.veryBerry];
  return [colors.silverBirch, colors.veryBerry];
}
