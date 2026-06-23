import { Field } from '@ark-ui/react';
import type { ReactNode } from 'react';

export type FormFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
};

export function FormField({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  children,
  className = '',
}: FormFieldProps) {
  const invalid = Boolean(error);
  const classes = ['flex flex-col gap-1', className].filter(Boolean).join(' ');

  return (
    <Field.Root className={classes} invalid={invalid} required={required} disabled={disabled}>
      {label && (
        <Field.Label className="font-sans text-sm font-medium text-[var(--text-body)]">
          {label}
          {required && <Field.RequiredIndicator className="ml-0.5 text-[var(--accent)]">*</Field.RequiredIndicator>}
        </Field.Label>
      )}
      {children}
      {invalid ? (
        <Field.ErrorText className="font-sans text-xs text-[var(--mf-very-berry)]">{error}</Field.ErrorText>
      ) : hint ? (
        <Field.HelperText className="font-sans text-xs text-[var(--text-muted)]">{hint}</Field.HelperText>
      ) : null}
    </Field.Root>
  );
}
