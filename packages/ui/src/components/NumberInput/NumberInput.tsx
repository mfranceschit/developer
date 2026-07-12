import { NumberInput as ArkNumberInput } from '@ark-ui/react';

export type NumberInputProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
};

const inputClasses =
  'w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm text-[var(--text-field)] ' +
  'bg-[var(--surface-field)] border border-[var(--border-default)] rounded-md outline-none ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

const triggerClasses =
  'flex items-center justify-center w-6 text-[var(--text-muted)] ' +
  'hover:text-[var(--text-body)] disabled:opacity-40 disabled:cursor-not-allowed';

export function NumberInput({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step,
  disabled = false,
  className = '',
}: NumberInputProps) {
  return (
    <ArkNumberInput.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(details) => onValueChange?.(details.valueAsNumber)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={['relative w-full', className].filter(Boolean).join(' ')}
    >
      <ArkNumberInput.Control className="relative flex items-center">
        <ArkNumberInput.Input className={inputClasses} />
        <div className="absolute right-1 flex flex-col">
          <ArkNumberInput.IncrementTrigger className={triggerClasses}>
            +
          </ArkNumberInput.IncrementTrigger>
          <ArkNumberInput.DecrementTrigger className={triggerClasses}>
            −
          </ArkNumberInput.DecrementTrigger>
        </div>
      </ArkNumberInput.Control>
    </ArkNumberInput.Root>
  );
}
