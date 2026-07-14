import type { ReactNode } from 'react';

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backLink?: { label: string; onClick: () => void };
};

export function PageHeader({ eyebrow, title, subtitle, action, backLink }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      {backLink && (
        <button
          type="button"
          onClick={backLink.onClick}
          className="mb-2 inline-flex w-fit items-center gap-1.5 font-sans text-[13px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-accent)]"
        >
          ← {backLink.label}
        </button>
      )}
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <div className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {eyebrow}
            </div>
          )}
          <h1 className="mt-2 font-sans text-[28px] font-bold tracking-[-0.015em] text-[var(--text-strong)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 font-sans text-sm text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
