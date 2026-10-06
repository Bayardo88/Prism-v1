import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { mergeDescribedBy, useFormField } from './FormFieldContext.js';

export type FieldState = 'default' | 'error' | 'disabled';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Hover and focus are CSS states; only error and disabled are props. */
  state?: FieldState;
  /** A glyph shown before the text. Wrap it in `Icon`. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Lands on the wrapper `div` (the drawn field). Use `controlClassName` for the `<input>`. */
  className?: string;
  /** Lands on the `<input>` itself. */
  controlClassName?: string;
}

/**
 * Input — the bare text field.
 *
 * The field alone, with no label or helper. Use `FormField` for anything a
 * person has to fill in: a naked input with no label is an accessibility
 * failure in almost every context. Inside a `FormField` it takes its `id`,
 * `required`, error state and `aria-describedby` (hint / error) automatically;
 * standalone, give it an `aria-label`/`aria-labelledby` and pass your own
 * `aria-describedby`.
 *
 * `ref`, `id`, `name`, `value`/`defaultValue` and every other native prop land
 * on the `<input>` (controlled or uncontrolled); `className` and `data-state`
 * land on the wrapper. `error` state sets `aria-invalid`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { state, leadingIcon, trailingIcon, className, controlClassName, disabled, id, required, ...rest },
  ref,
) {
  const field = useFormField();
  const resolvedState = state ?? field?.state ?? 'default';
  const resolved = disabled ? 'disabled' : resolvedState;
  return (
    <div className={cx('scalar-field', className)} data-state={resolved}>
      {leadingIcon}
      <input
        ref={ref}
        className={cx('scalar-field__control', controlClassName)}
        {...rest}
        id={id ?? field?.id}
        required={required ?? (field?.required || undefined)}
        disabled={resolved === 'disabled'}
        aria-invalid={resolved === 'error' || undefined}
        aria-describedby={mergeDescribedBy(rest['aria-describedby'], field)}
      />
      {trailingIcon}
    </div>
  );
});
