import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export type FieldState = 'default' | 'error' | 'disabled';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Hover and focus are CSS states; only error and disabled are props. */
  state?: FieldState;
  /** A glyph shown before the text. Wrap it in `Icon`. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
}

/**
 * Input — the bare text field.
 *
 * The field alone, with no label or helper. Use `FormField` for anything a
 * person has to fill in: a naked input with no label is an accessibility
 * failure in almost every context.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { state = 'default', leadingIcon, trailingIcon, className, disabled, ...rest },
  ref,
) {
  const resolved = disabled ? 'disabled' : state;
  return (
    <div className={cx('scalar-field', className)} data-state={resolved}>
      {leadingIcon}
      <input
        ref={ref}
        className="scalar-field__control"
        disabled={resolved === 'disabled'}
        aria-invalid={resolved === 'error' || undefined}
        {...rest}
      />
      {trailingIcon}
    </div>
  );
});
