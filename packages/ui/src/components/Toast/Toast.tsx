import { createToaster, Toast as ArkToast, Toaster as ArkToaster } from '@ark-ui/react';

export { createToaster };

export type ToasterProps = {
  toaster: ReturnType<typeof createToaster>;
};

const toneClasses: Record<string, string> = {
  success: 'border-[var(--mf-success)]',
  error: 'border-[var(--mf-danger)]',
  info: 'border-[var(--border-subtle)]',
  warning: 'border-[var(--mf-warning)]',
  loading: 'border-[var(--border-subtle)]',
};

export function Toaster({ toaster }: ToasterProps) {
  return (
    <ArkToaster toaster={toaster}>
      {(toast) => (
        <ArkToast.Root
          key={toast.id}
          className={[
            'rounded-md bg-[var(--surface-overlay)] border shadow-md px-4 py-3 min-w-[260px]',
            toneClasses[toast.type ?? 'info'] ?? toneClasses.info,
          ].join(' ')}
        >
          <ArkToast.Title className="font-sans text-sm font-medium text-[var(--text-strong)]">
            {toast.title}
          </ArkToast.Title>
          {toast.description && (
            <ArkToast.Description className="mt-0.5 font-sans text-xs text-[var(--text-muted)]">
              {toast.description}
            </ArkToast.Description>
          )}
        </ArkToast.Root>
      )}
    </ArkToaster>
  );
}
