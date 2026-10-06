import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  /**
   * Purely visual: removes the separator from the accessibility tree. Use it
   * when the rule only adds spacing and the grouping is already conveyed by
   * the markup.
   */
  decorative?: boolean;
}

/**
 * Divider — a rule between sections or inline items.
 *
 * Token: Stroke/Divider at 1px. Deliberately low contrast (~1.4:1) because it
 * is a non-interactive container edge, so WCAG 1.4.11 does not apply (rule R5).
 *
 * Use a divider only where whitespace alone fails to group. Two dividers
 * stacked with nothing between them is a spacing problem, not a divider one.
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { orientation = 'horizontal', decorative, className, ...rest },
  ref,
) {
  return (
    <hr
      ref={ref}
      {...rest}
      className={cx('scalar-divider', `scalar-divider--${orientation}`, className)}
      {...(decorative
        ? { role: 'none' }
        : { 'aria-orientation': orientation })}
    />
  );
});
