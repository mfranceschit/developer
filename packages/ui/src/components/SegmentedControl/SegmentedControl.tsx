import { SegmentGroup } from '@ark-ui/react';

export type SegmentedControlOption<T extends string> = { value: T; label: string };
export type SegmentedControlSize = 'sm' | 'md';

export type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  size?: SegmentedControlSize;
  'aria-label'?: string;
  className?: string;
};

const sizeClasses: Record<SegmentedControlSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-3.5 py-1.5 text-sm',
};

const itemClasses =
  'cursor-pointer rounded-[6px] font-sans font-medium text-[var(--text-muted)] ' +
  'transition-colors duration-[120ms] ' +
  'data-[state=checked]:bg-[var(--surface-card)] data-[state=checked]:font-semibold ' +
  'data-[state=checked]:text-[var(--text-strong)] data-[state=checked]:shadow-xs';

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = 'md',
  'aria-label': ariaLabel,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <SegmentGroup.Root
      value={value}
      onValueChange={(details) => {
        if (details.value) onValueChange(details.value as T);
      }}
      aria-label={ariaLabel}
      className={['inline-flex rounded-md bg-[var(--mf-gray-100)] p-0.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map((option) => (
        <SegmentGroup.Item
          key={option.value}
          value={option.value}
          className={[itemClasses, sizeClasses[size]].join(' ')}
        >
          <SegmentGroup.ItemText>{option.label}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  );
}
