import { Switch as ArkSwitch } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type SwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  className?: string;
};

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  label,
  className = '',
}: SwitchProps) {
  return (
    <ArkSwitch.Root
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(details) => onCheckedChange?.(details.checked)}
      disabled={disabled}
      className={['inline-flex items-center gap-2 cursor-pointer', className]
        .filter(Boolean)
        .join(' ')}
    >
      <ArkSwitch.Control
        className={
          'relative inline-flex w-[36px] h-[20px] rounded-[var(--radius-pill)] ' +
          'bg-[var(--mf-gray-300)] transition-colors duration-[120ms] ' +
          'data-[state=checked]:bg-[var(--primary)]'
        }
      >
        <ArkSwitch.Thumb
          className={
            'block w-[16px] h-[16px] my-0.5 ml-0.5 rounded-full bg-[var(--mf-white)] ' +
            'shadow-sm transition-transform duration-[120ms] ' +
            'data-[state=checked]:translate-x-[16px]'
          }
        />
      </ArkSwitch.Control>
      {label && (
        <ArkSwitch.Label className="font-sans text-sm text-[var(--text-body)]">
          {label}
        </ArkSwitch.Label>
      )}
      <ArkSwitch.HiddenInput />
    </ArkSwitch.Root>
  );
}
