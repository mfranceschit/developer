import type { CSSProperties, ElementType, ReactNode } from 'react';

export type CardProps = {
  interactive?: boolean;
  as?: ElementType;
  padding?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
};

const base =
  'block bg-white border border-[var(--border-subtle)] rounded-lg shadow-xs text-[var(--text-body)] no-underline ' +
  'transition-[border-color,box-shadow] duration-[180ms]';

const interactiveClasses =
  'cursor-pointer hover:border-bellwether-blue hover:shadow-md';

export function Card({
  interactive = false,
  as: Tag = 'div',
  padding = '0',
  children,
  className = '',
  style,
  ...rest
}: CardProps) {
  const classes = [base, interactive ? interactiveClasses : 'cursor-default', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} style={padding ? { padding, ...style } : style} {...rest}>
      {children}
    </Tag>
  );
}
