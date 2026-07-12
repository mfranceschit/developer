import { Select as ArkSelect, createListCollection, Portal } from '@ark-ui/react';

export type SelectProps<T> = {
  items: T[];
  itemToString: (item: T) => string;
  itemToValue: (item: T) => string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const triggerClasses =
  'flex w-full items-center justify-between px-[var(--field-pad-x)] py-[var(--field-pad-y)] ' +
  'font-sans text-sm text-[var(--text-field)] bg-[var(--surface-field)] ' +
  'border border-[var(--border-default)] rounded-md outline-none cursor-pointer ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus-visible:border-[var(--focus-ring)] focus-visible:shadow-focus ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const contentClasses =
  'z-50 min-w-[var(--reference-width)] rounded-md bg-[var(--surface-overlay)] ' +
  'border border-[var(--border-subtle)] shadow-md py-1 max-h-[280px] overflow-auto';

const itemClasses =
  'px-3 py-2 font-sans text-sm text-[var(--text-body)] cursor-pointer rounded-sm mx-1 ' +
  'data-[highlighted]:bg-[var(--primary-soft)]';

export function Select<T>({
  items,
  itemToString,
  itemToValue,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled = false,
  className = '',
}: SelectProps<T>) {
  const collection = createListCollection({ items, itemToString, itemToValue });

  return (
    <ArkSelect.Root
      collection={collection}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(details) => onValueChange?.(details.value)}
      disabled={disabled}
      className={className}
    >
      <ArkSelect.Control>
        <ArkSelect.Trigger className={triggerClasses}>
          <ArkSelect.ValueText placeholder={placeholder} />
          <ArkSelect.Indicator>▾</ArkSelect.Indicator>
        </ArkSelect.Trigger>
      </ArkSelect.Control>
      <Portal>
        <ArkSelect.Positioner>
          <ArkSelect.Content className={contentClasses}>
            {items.map((item) => (
              <ArkSelect.Item key={itemToValue(item)} item={item} className={itemClasses}>
                <ArkSelect.ItemText>{itemToString(item)}</ArkSelect.ItemText>
              </ArkSelect.Item>
            ))}
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Portal>
      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
}
