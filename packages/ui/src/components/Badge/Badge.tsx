import type { CSSProperties, ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'blue' | 'berry' | 'sand' | 'solid' | 'glass' | 'tint-accent';

type ToneStyle = { bg: string; fg: string; border: string; hoverBorder?: string };

const TONES: Record<BadgeTone, ToneStyle> = {
  neutral: { bg: 'var(--mf-gray-100)',  fg: 'var(--mf-gray-700)',  border: 'var(--mf-gray-200)' },
  blue:    { bg: 'var(--mf-blue-50)',   fg: 'var(--mf-blue-700)',  border: 'var(--mf-blue-100)' },
  berry:   { bg: 'var(--mf-berry-50)',  fg: 'var(--mf-berry-700)', border: 'var(--mf-berry-100)' },
  sand:    { bg: 'var(--mf-sand-100)',  fg: 'var(--mf-bark)',      border: 'var(--mf-sand-200)' },
  solid:   { bg: 'var(--primary)',      fg: 'var(--text-inverse)', border: 'transparent' },
  /* Translucent neutral chip over a dark/animated surface (project tech chips). */
  glass:   { bg: 'var(--primary-soft)', fg: 'var(--text-chip)', border: 'var(--border-subtle)' },
  /* Accent-tinted chip (project detail stack, interactive). */
  'tint-accent': {
    bg: 'var(--accent-soft)',
    fg: 'var(--accent-birch-300)',
    border: 'var(--border-chip-accent)',
    hoverBorder: 'var(--border-hover-accent-strong)',
  },
};

export type BadgeProps = {
  tone?: BadgeTone;
  pill?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Badge({ tone = 'neutral', pill = true, children, className = '', style }: BadgeProps) {
  const t = TONES[tone];
  const classes = [
    'inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap transition-colors duration-200',
    t.hoverBorder ? 'hover:border-[var(--border-hover-accent-strong)]' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <span
      className={classes}
      style={{
        padding: '3px 10px',
        lineHeight: 1.4,
        backgroundColor: t.bg,
        color: t.fg,
        border: `1px solid ${t.border}`,
        borderRadius: pill ? 'var(--radius-pill)' : 'var(--radius-sm)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
