import { Tabs as ArkTabs } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

const triggerClasses =
  'px-3 py-2 font-sans text-sm font-medium text-[var(--text-muted)] cursor-pointer ' +
  'border-b-2 border-transparent transition-colors duration-[120ms] ' +
  'data-[selected]:text-[var(--text-strong)] data-[selected]:border-[var(--primary)] ' +
  'hover:text-[var(--text-body)]';

export function Tabs({ items, value, defaultValue, onValueChange, className = '' }: TabsProps) {
  return (
    <ArkTabs.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(details) => onValueChange?.(details.value)}
      className={className}
    >
      <ArkTabs.List className="flex gap-1 border-b border-[var(--border-subtle)]">
        {items.map((item) => (
          <ArkTabs.Trigger key={item.value} value={item.value} className={triggerClasses}>
            {item.label}
          </ArkTabs.Trigger>
        ))}
      </ArkTabs.List>
      {items.map((item) => (
        <ArkTabs.Content key={item.value} value={item.value} className="pt-3">
          {item.content}
        </ArkTabs.Content>
      ))}
    </ArkTabs.Root>
  );
}
