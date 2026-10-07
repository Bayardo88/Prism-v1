import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { prismGroupLabel, type PrismType } from './prism.js';

export interface SearchSectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  type: PrismType;
  children?: ReactNode;
}

/**
 * Search Section Header — the group label above a run of results.
 *
 * One header per contiguous run of a single type. Order runs by relevance, not
 * alphabetically, and never interleave types beneath one header. The header's
 * type must match the type of every row under it.
 *
 * Accessibility: give it an `id` and point the group's `aria-labelledby` at it —
 * this label is the accessible name of the group. Keep it a plain plural noun —
 * "COMPANIES", not "3 RESULTS".
 */
export const SearchSectionHeader = forwardRef<HTMLDivElement, SearchSectionHeaderProps>(function SearchSectionHeader(
  { type, children, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('scalar-search-section-header', className)} data-prism={type} {...rest}>
      {children ?? prismGroupLabel[type]}
    </div>
  );
});
