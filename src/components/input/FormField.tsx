import { useId, type ReactElement, type ReactNode } from 'react';
import { cloneElement } from 'react';
import { cx } from '../../utils/cx.js';
import { Typography } from '../typography/Typography.js';
import type { FieldState } from './Input.js';

export interface FormFieldProps {
  /** The control: an Input, Select or Textarea. */
  children: ReactElement<{ id?: string; state?: FieldState; 'aria-describedby'?: string }>;
  /**
   * The label. Permanent — never a placeholder standing in for one, which
   * disappears exactly when the user needs it.
   */
  label?: ReactNode;
  /**
   * Helper text. In `error` state this becomes the error message and takes
   * Text/Negative. Say what is wrong and how to fix it, never just "Invalid".
   */
  helperText?: ReactNode;
  state?: FieldState;
  required?: boolean;
  className?: string;
}

/**
 * Form Field — label, control, helper and error as one unit.
 *
 * This is the default way to ask for input. It wires `id`, `aria-describedby`
 * and the error state through to the control for you.
 */
export function FormField({
  children, label, helperText, state = 'default', required, className,
}: FormFieldProps) {
  const id = useId();
  const controlId = children.props.id ?? `${id}-control`;
  const helperId = `${id}-helper`;
  const isError = state === 'error';

  return (
    <div className={cx('scalar-form-field', className)}>
      {label && (
        <Typography
          as="label"
          variant="label"
          step="l"
          weight="semiBold"
          className="scalar-form-field__label"
          htmlFor={controlId}
        >
          {label}
          {required && (
            <span className="scalar-form-field__required" aria-hidden>
              *
            </span>
          )}
        </Typography>
      )}
      {cloneElement(children, {
        id: controlId,
        state,
        'aria-describedby': helperText ? helperId : undefined,
      })}
      {helperText && (
        <Typography
          variant="heading"
          step="s"
          id={helperId}
          role={isError ? 'alert' : undefined}
          className={cx('scalar-form-field__helper', isError && 'scalar-form-field__helper--error')}
        >
          {helperText}
        </Typography>
      )}
    </div>
  );
}
