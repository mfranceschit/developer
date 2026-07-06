import { Field } from '@ark-ui/react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base =
  'w-full px-[var(--field-pad-x)] py-[var(--field-pad-y)] font-sans text-sm text-[var(--text-field)] bg-[var(--surface-field)] ' +
  'placeholder:text-[var(--text-placeholder)] ' +
  'border border-[var(--border-default)] rounded-md outline-none ' +
  'transition-[border-color,box-shadow] duration-[120ms] ' +
  'focus:border-[var(--focus-ring)] focus:shadow-focus ' +
  'data-[invalid]:border-[var(--mf-very-berry)] ' +
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

type BaseInputProps = InputHTMLAttributes<HTMLInputElement> & {
  as?: 'input';
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: 'textarea';
};

export type InputProps = BaseInputProps | TextareaProps;

export function Input({ as = 'input', className = '', ...rest }: InputProps) {
  const classes = [base, as === 'textarea' ? 'resize-y min-h-[120px]' : '', className]
    .filter(Boolean)
    .join(' ');

  if (as === 'textarea') {
    return <Field.Textarea className={classes} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />;
  }
  return <Field.Input className={classes} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />;
}
