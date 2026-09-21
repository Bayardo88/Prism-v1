import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';
import type { FieldState } from './Input.js';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: FieldState;
  /**
   * Whether the box can be dragged taller. If a field is not resizable, turn
   * this off rather than leaving the grip as decoration.
   */
  resizable?: boolean;
}

/**
 * Textarea — free text longer than a single line.
 *
 * Tokens and geometry match Input, with the text pinned to the top edge.
 *
 * Size the default height to the expected answer. A three-line box invites
 * three lines; a box taller than the answer needs reads as a demand for more.
 *
 * Pair with `FormField` for a label and helper text.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { state = 'default', resizable = true, className, disabled, ...rest },
  ref,
) {
  const resolved = disabled ? 'disabled' : state;
  return (
    <div
      className={cx('scalar-field', 'scalar-field--textarea', className)}
      data-state={resolved}
      data-resizable={resizable}
    >
      <textarea
        ref={ref}
        className="scalar-field__control"
        disabled={resolved === 'disabled'}
        aria-invalid={resolved === 'error' || undefined}
        {...rest}
      />
    </div>
  );
});
