import { Checkbox as ArkCheckbox } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
};

const controlBase =
  'flex items-center justify-center w-[18px] h-[18px] shrink-0 rounded-[4px] ' +
  'border border-[var(--border-default)] bg-[var(--surface-field)] ' +
  'transition-[background-color,border-color] duration-[120ms] ' +
  'data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] ' +
  'peer-focus-visible:shadow-focus';

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  label,
  className = '',
}: CheckboxProps) {
  return (
    <ArkCheckbox.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(details) => onCheckedChange?.(details.checked === true)}
      disabled={disabled}
      className={['inline-flex items-center gap-2 cursor-pointer', className]
        .filter(Boolean)
        .join(' ')}
    >
      <ArkCheckbox.Control className={controlBase}>
        <ArkCheckbox.Indicator>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 6.5L4.75 8.75L9.5 3.5"
              stroke="var(--text-inverse)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      {label && (
        <ArkCheckbox.Label className="font-sans text-sm text-[var(--text-body)]">
          {label}
        </ArkCheckbox.Label>
      )}
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
}
