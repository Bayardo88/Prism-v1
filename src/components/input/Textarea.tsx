import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';
import { mergeDescribedBy, useFormField } from './FormFieldContext.js';
import type { FieldState } from './Input.js';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: FieldState;
  /**
   * Whether the box can be dragged taller. If a field is not resizable, turn
   * this off rather than leaving the grip as decoration.
   */
  resizable?: boolean;
  /** Lands on the `<textarea>` itself; `className` lands on the wrapper. */
  controlClassName?: string;
}

/**
 * Textarea — free text longer than a single line.
 *
 * Tokens and geometry match Input, with the text pinned to the top edge.
 *
 * Size the default height to the expected answer. A three-line box invites
 * three lines; a box taller than the answer needs reads as a demand for more.
 *
 * Pair with `FormField` for a label, helper/error text and `required`; inside
 * one it is wired automatically. Standalone, pass `aria-label` and your own
 * `aria-describedby` (e.g. a character counter). `ref` and native props land on
 * the `<textarea>`; `className` on the wrapper.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { state, resizable = true, className, controlClassName, disabled, id, required, ...rest },
  ref,
) {
  const field = useFormField();
  const resolved = disabled ? 'disabled' : state ?? field?.state ?? 'default';
  return (
    <div
      className={cx('scalar-field', 'scalar-field--textarea', className)}
      data-state={resolved}
      data-resizable={resizable}
    >
      <textarea
        ref={ref}
        className={cx('scalar-field__control', controlClassName)}
        {...rest}
        id={id ?? field?.id}
        required={required ?? (field?.required || undefined)}
        disabled={resolved === 'disabled'}
        aria-invalid={resolved === 'error' || undefined}
        aria-describedby={mergeDescribedBy(rest['aria-describedby'], field)}
      />
    </div>
  );
});
