import type { ReactNode } from 'react';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

type ToneStyle = { bg: string; border: string };

const TONES: Record<BannerTone, ToneStyle> = {
  info: { bg: 'var(--surface-info-soft)', border: 'var(--border-info)' },
  success: { bg: 'var(--surface-success-soft)', border: 'var(--border-success)' },
  warning: { bg: 'var(--surface-warning-soft)', border: 'var(--border-warning)' },
  danger: { bg: 'var(--surface-danger-soft)', border: 'var(--border-danger)' },
};

export type BannerProps = {
  tone?: BannerTone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function Banner({ tone = 'info', title, children, action, className = '' }: BannerProps) {
  const t = TONES[tone];
  return (
    <div
      role="alert"
      className={['flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md p-4', className]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && (
          <p className="font-sans text-sm font-semibold text-[var(--text-strong)]">{title}</p>
        )}
        {children && (
          <div className="font-sans text-sm leading-relaxed text-[var(--text-body)]">
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
