import { Combobox as ArkCombobox, createListCollection, Portal } from '@ark-ui/react';

export type ComboboxProps<T> = {
  items: T[];
  itemToString: (item: T) => string;
  itemToValue: (item: T) => string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  onInputValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const inputClasses =
  'w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm text-[var(--text-field)] ' +
  'bg-[var(--surface-field)] border border-[var(--border-default)] rounded-md outline-none ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const contentClasses =
  'z-50 min-w-[var(--reference-width)] rounded-md bg-[var(--surface-overlay)] ' +
  'border border-[var(--border-subtle)] shadow-md py-1 max-h-[280px] overflow-auto';

const itemClasses =
  'px-3 py-2 font-sans text-sm text-[var(--text-body)] cursor-pointer rounded-sm mx-1 ' +
  'data-[highlighted]:bg-[var(--primary-soft)]';

export function Combobox<T>({
  items,
  itemToString,
  itemToValue,
  value,
  defaultValue,
  onValueChange,
  onInputValueChange,
  placeholder,
  disabled = false,
  className = '',
}: ComboboxProps<T>) {
  const collection = createListCollection({ items, itemToString, itemToValue });

  return (
    <ArkCombobox.Root
      collection={collection}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(details) => onValueChange?.(details.value)}
      onInputValueChange={(details) => onInputValueChange?.(details.inputValue)}
      disabled={disabled}
      className={className}
    >
      <ArkCombobox.Control>
        <ArkCombobox.Input className={inputClasses} placeholder={placeholder} />
      </ArkCombobox.Control>
      <Portal>
        <ArkCombobox.Positioner>
          <ArkCombobox.Content className={contentClasses}>
            <ArkCombobox.Empty className="px-3 py-2 font-sans text-sm text-[var(--text-muted)]">
              No results
            </ArkCombobox.Empty>
            {items.map((item) => (
              <ArkCombobox.Item key={itemToValue(item)} item={item} className={itemClasses}>
                <ArkCombobox.ItemText>{itemToString(item)}</ArkCombobox.ItemText>
              </ArkCombobox.Item>
            ))}
          </ArkCombobox.Content>
        </ArkCombobox.Positioner>
      </Portal>
    </ArkCombobox.Root>
  );
}
