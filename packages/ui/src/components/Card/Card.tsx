import type { CSSProperties, ElementType, ReactNode } from 'react';

export type CardTone = 'light' | 'dark';

export type CardProps = {
  interactive?: boolean;
  /** Lift + glow on hover (project cards) vs. a plain border-color change (list rows). Default true. */
  hoverLift?: boolean;
  tone?: CardTone;
  as?: ElementType;
  padding?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
};

const toneClasses: Record<CardTone, string> = {
  light: 'bg-white border border-[var(--border-subtle)] shadow-xs',
  /* Near-opaque translucent panel that floats over an animated background. */
  dark: 'bg-[var(--surface-card)] border border-[var(--border-subtle)]',
};

const base =
  'block rounded-md text-[var(--text-body)] no-underline ' +
  'transition-[border-color,box-shadow,transform] duration-[200ms] ease-out';

const interactiveClasses: Record<CardTone, Record<'lift' | 'flat', string>> = {
  light: {
    lift: 'cursor-pointer hover:border-bellwether-blue hover:shadow-md',
    flat: 'cursor-pointer hover:border-bellwether-blue',
  },
  dark: {
    lift: 'cursor-pointer hover:border-[var(--border-hover-accent)] hover:shadow-[var(--shadow-glow-primary)] hover:-translate-y-0.5',
    flat: 'cursor-pointer hover:border-[var(--border-hover-accent)]',
  },
};

export function Card({
  interactive = false,
  hoverLift = true,
  tone = 'light',
  as: Tag = 'div',
  padding,
  children,
  className = '',
  style,
  ...rest
}: CardProps) {
  const classes = [
    base,
    toneClasses[tone],
    interactive ? interactiveClasses[tone][hoverLift ? 'lift' : 'flat'] : 'cursor-default',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} style={padding ? { padding, ...style } : style} {...rest}>
      {children}
    </Tag>
  );
}
