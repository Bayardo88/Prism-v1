import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { prismBadgeLabel, type PrismScopeType } from './prism.js';

export interface SearchScopeChipProps extends HTMLAttributes<HTMLSpanElement> {
  type: PrismScopeType;
  children?: ReactNode;
  /**
   * Screen-reader prefix that makes the scope audible. Default
   * "Scoped to {Type}:" (e.g. "Scoped to Company:").
   */
  srLabel?: string;
}

/**
 * Search Scope Chip — one level of the Global Search scope stack.
 *
 * Chips read left to right, outermost scope first. They are added only by Tab
 * and removed only by Backspace: a breadcrumb of where the search is pointed,
 * not a filter control the user clicks.
 *
 * Accessibility: the chip is not a button and takes no focus. A visually hidden
 * prefix ("Scoped to Company:") tells a screen reader what the chip means. If
 * it is ever made click-removable, the target must reach Target/Minimum.
 */
export const SearchScopeChip = forwardRef<HTMLSpanElement, SearchScopeChipProps>(function SearchScopeChip(
  { type, children, srLabel, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('scalar-scope-chip', className)} data-prism={type} {...rest}>
      <VisuallyHidden>{srLabel ?? `Scoped to ${prismBadgeLabel[type]}:`} </VisuallyHidden>
      {children}
    </span>
  );
});
