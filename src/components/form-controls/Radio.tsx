import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import type { ChoiceSize } from '../checkbox/CheckboxItem.js';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ChoiceSize;
  invalid?: boolean;
  children?: ReactNode;
}

/**
 * Radio — one choice from a set of mutually exclusive options.
 *
 * Radios are never used alone: a single radio that cannot be unselected is a
 * checkbox. Always two or more, always with one preselected unless the question
 * genuinely has no default.
 *
 * Mirrors the Checkbox variant model minus Indeterminate, which has no meaning
 * for an exclusive choice.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { size = 'm', invalid, children, className, ...rest },
  ref,
) {
  return (
    <label className={cx('scalar-choice-field', className)}>
      <input
        ref={ref}
        type="radio"
        className="scalar-choice-input"
        data-tone={invalid ? 'negative' : undefined}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      <span className={cx('scalar-choice', 'scalar-radio-box', `scalar-choice--${size}`)} aria-hidden>
        <span className="scalar-radio-box__dot" />
      </span>
      {children && <span>{children}</span>}
    </label>
  );
});
