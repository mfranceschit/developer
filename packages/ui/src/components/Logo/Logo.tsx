import type { CSSProperties } from 'react';

export type LogoVariant = 'navy' | 'berry' | 'beige';

export type LogoProps = {
  variant?: LogoVariant;
  lockup?: boolean;
  tagline?: boolean;
  height?: number;
  base?: string;
  wordmark?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

const MONO: Record<LogoVariant, string> = {
  navy: 'monogram-navy.svg',
  berry: 'monogram-berry.svg',
  beige: 'monogram-beige.svg',
};

const INK: Record<LogoVariant, { word: string; tag: string }> = {
  navy: { word: 'var(--mf-bellwether-blue)', tag: 'var(--mf-bark)' },
  berry: { word: 'var(--mf-very-berry)', tag: 'var(--mf-very-berry)' },
  beige: { word: 'var(--mf-sand)', tag: 'rgba(255, 255, 255, 0.72)' },
};

const MONO_RATIO = 188 / 136;

export function Logo({
  variant = 'navy',
  lockup = true,
  tagline = true,
  height,
  base = '/assets/logos',
  wordmark = 'mfranceschit',
  alt = 'mfranceschit — developer',
  className,
  style,
}: LogoProps) {
  const mono = MONO[variant];
  const ink = INK[variant];
  const markH = height ?? (lockup ? 72 : 48);

  if (!lockup) {
    return (
      <img
        src={`${base}/${mono}`}
        alt={alt}
        className={className}
        style={{ height: markH, width: 'auto', display: 'block', ...style }}
      />
    );
  }

  const markW = markH * MONO_RATIO;
  const wordW = markW * 1.62;
  const letters = wordmark.split('');

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: markH * 0.18,
        ...style,
      }}
    >
      <img
        src={`${base}/${mono}`}
        alt={alt}
        style={{ height: markH, width: markW, display: 'block' }}
      />
      <div style={{ width: wordW }}>
        <div
          className="font-sans font-semibold lowercase"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: markH * 0.19,
            color: ink.word,
            lineHeight: 1,
          }}
        >
          {letters.map((c, i) => (
            <span key={`${c}-${i}`}>{c}</span>
          ))}
        </div>
        {tagline && (
          <div
            className="font-sans text-right tracking-[0.01em]"
            style={{ fontSize: markH * 0.13, color: ink.tag, marginTop: markH * 0.06 }}
          >
            developer
          </div>
        )}
      </div>
    </div>
  );
}
