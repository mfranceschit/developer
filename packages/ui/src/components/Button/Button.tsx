import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-bellwether-blue text-white hover:bg-blue-600 active:bg-blue-800',
  accent:
    'bg-very-berry text-white hover:bg-berry-700 active:bg-berry-800',
  outline:
    'bg-transparent border border-gray-300 text-bellwether-blue hover:bg-gray-50 active:bg-gray-100',
  ghost:
    'bg-transparent text-bellwether-blue hover:bg-blue-50 active:bg-blue-100',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-[14px] py-[6px] text-sm min-h-[34px]',
  md: 'px-[18px] py-[9px] text-sm min-h-[40px]',
  lg: 'px-6 py-[13px] text-base min-h-[48px]',
};

const base =
  'inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.015em] rounded-lg ' +
  'transition-[background-color,border-color,box-shadow,transform] duration-[120ms] ' +
  'focus-visible:shadow-focus outline-hidden cursor-pointer no-underline ' +
  'active:translate-y-px ' +
  'disabled:bg-gray-200 disabled:text-gray-400 disabled:border-transparent disabled:cursor-not-allowed disabled:translate-y-0';

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
};

type AsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  type?: never;
  onClick?: never;
  disabled?: never;
};

type AsButton = CommonProps & {
  href?: never;
  target?: never;
  rel?: never;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
};

export type ButtonProps = AsLink | AsButton;

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const classes = [
    base,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if ('href' in rest && rest.href) {
    const { href, target, rel } = rest;
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {iconLeft}
        {children}
        {iconRight}
      </a>
    );
  }

  const { type = 'button', onClick, disabled } = rest as AsButton;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
