import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { prismGroupLabel, type PrismType } from './prism.js';

export interface SearchSectionHeaderProps {
  type: PrismType;
  children?: ReactNode;
  className?: string;
}

/**
 * Search Section Header — the group label above a run of results.
 *
 * One header per contiguous run of a single type. Order runs by relevance, not
 * alphabetically, and never interleave types beneath one header. The header's
 * type must match the type of every row under it.
 *
 * Accessibility: this label is the accessible name of the group. Keep it a
 * plain plural noun — "COMPANIES", not "3 RESULTS".
 */
export function SearchSectionHeader({ type, children, className }: SearchSectionHeaderProps) {
  return (
    <div className={cx('scalar-search-section-header', className)} data-prism={type} role="presentation">
      {children ?? prismGroupLabel[type]}
    </div>
  );
}
