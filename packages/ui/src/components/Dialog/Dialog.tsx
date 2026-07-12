import { Dialog as ArkDialog, Portal } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type DialogProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className = '',
}: DialogProps) {
  return (
    <ArkDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(details) => onOpenChange?.(details.open)}
    >
      {trigger && <ArkDialog.Trigger asChild>{trigger}</ArkDialog.Trigger>}
      <Portal>
        <ArkDialog.Backdrop className="fixed inset-0 z-40 bg-[var(--surface-scrim)]" />
        <ArkDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ArkDialog.Content
            className={[
              'w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--surface-overlay)] ' +
                'border border-[var(--border-subtle)] shadow-lg p-6',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <ArkDialog.Title className="font-sans text-lg font-semibold text-[var(--text-strong)]">
              {title}
            </ArkDialog.Title>
            {description && (
              <ArkDialog.Description className="mt-1 font-sans text-sm text-[var(--text-muted)]">
                {description}
              </ArkDialog.Description>
            )}
            <div className="mt-4">{children}</div>
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}
