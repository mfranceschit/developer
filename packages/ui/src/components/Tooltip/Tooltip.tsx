import { Tooltip as ArkTooltip, Portal } from '@ark-ui/react';
import type { ReactElement, ReactNode } from 'react';

export type TooltipProps = {
  content: ReactNode;
  children: ReactElement;
  openDelay?: number;
  className?: string;
};

export function Tooltip({ content, children, openDelay = 300, className = '' }: TooltipProps) {
  return (
    <ArkTooltip.Root openDelay={openDelay}>
      <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
      <Portal>
        <ArkTooltip.Positioner>
          <ArkTooltip.Content
            className={[
              'rounded-[var(--radius-sm)] bg-[var(--surface-overlay)] px-2.5 py-1.5 ' +
                'font-sans text-xs text-[var(--text-body)] shadow-md ' +
                'border border-[var(--border-subtle)]',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {content}
          </ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.Root>
  );
}
