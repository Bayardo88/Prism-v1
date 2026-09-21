import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import type { PrismScopeType } from './prism.js';

export interface SearchScopeChipProps {
  type: PrismScopeType;
  children?: ReactNode;
  className?: string;
}

/**
 * Search Scope Chip — one level of the Global Search scope stack.
 *
 * Chips read left to right, outermost scope first. They are added only by Tab
 * and removed only by Backspace: a breadcrumb of where the search is pointed,
 * not a filter control the user clicks.
 *
 * Accessibility: the chip is not a button and takes no focus. If it is ever
 * made click-removable, the target must reach Target/Minimum.
 */
export function SearchScopeChip({ type, children, className }: SearchScopeChipProps) {
  return (
    <span className={cx('scalar-scope-chip', className)} data-prism={type}>
      {children}
    </span>
  );
}
