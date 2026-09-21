import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Check, Minus } from '../icon/glyphs.js';

export type ChoiceSize = 'm' | 's';

export interface CheckboxItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** M is 24px, S is 16px. The drawn box, not the target. */
  size?: ChoiceSize;
  /**
   * For a parent whose children are partly selected. A display state — never
   * something the user selects directly.
   */
  indeterminate?: boolean;
  /** Draws the error edge. */
  invalid?: boolean;
}

/**
 * Checkbox Item — the checkbox control on its own.
 *
 * Accessibility: the drawn box is 16–24px but the target must reach 44px. Use
 * `Checkbox` when a label travels with it — that wrapper carries the target.
 */
export const CheckboxItem = forwardRef<HTMLInputElement, CheckboxItemProps>(function CheckboxItem(
  { size = 'm', indeterminate = false, invalid, className, ...rest },
  ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <>
      <input
        ref={(node) => {
          (inner as { current: HTMLInputElement | null }).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as { current: HTMLInputElement | null }).current = node;
        }}
        type="checkbox"
        className="scalar-choice-input"
        data-tone={invalid ? 'negative' : undefined}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      <span className={cx('scalar-choice', 'scalar-checkbox-box', `scalar-choice--${size}`, className)} aria-hidden>
        <Icon size={size === 'm' ? 's' : 'xs'} tone="inherit">
          {indeterminate ? <Minus /> : <Check />}
        </Icon>
      </span>
    </>
  );
});
