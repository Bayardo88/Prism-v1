import { cloneElement, forwardRef, useMemo, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cx, describedBy, useFieldIds } from '../../utils/index.js';
import { Typography } from '../typography/Typography.js';
import { FormFieldContext, type FormFieldContextValue } from './FormFieldContext.js';
import type { FieldState } from './Input.js';

export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The control: an Input, Select or Textarea (they read the field from
   * context), or any single element that accepts `id`, `state` and
   * `aria-describedby`.
   */
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
  /** Marks the control `required` (native) and draws a decorative asterisk. */
  required?: boolean;
  className?: string;
}

/**
 * Form Field — label, control, helper and error as one unit.
 *
 * This is the default way to ask for input. It wires `id`, `required`,
 * `aria-invalid` and `aria-describedby` (hint, or error when `state="error"`)
 * through to the control — via context for the package's own controls and via
 * props for custom ones — and merges rather than replaces a describedby the
 * control already has. Extra native props and `ref` land on the wrapper `div`.
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { children, label, helperText, state = 'default', required = false, className, ...rest },
  ref,
) {
  const { id: controlId, hintId, errorId } = useFieldIds(children.props.id);
  const isError = state === 'error';
  const helperId = helperText ? (isError ? errorId : hintId) : undefined;
  const joined = describedBy(helperId);

  const value = useMemo<FormFieldContextValue>(
    () => ({ id: controlId, describedBy: joined, state, required }),
    [controlId, joined, state, required],
  );

  return (
    <FormFieldContext.Provider value={value}>
      <div ref={ref} className={cx('scalar-form-field', className)} {...rest}>
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
          'aria-describedby': describedBy(children.props['aria-describedby'], joined),
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
    </FormFieldContext.Provider>
  );
});
