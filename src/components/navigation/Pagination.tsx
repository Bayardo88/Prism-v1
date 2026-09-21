import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronLeft, ChevronRight } from '../icon/glyphs.js';

export interface PageItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  page: number | string;
  /** The page being viewed. Not clickable, and the only one with a fill. */
  current?: boolean;
}

/** Page Item — one page number in a Pagination control. */
export const PageItem = forwardRef<HTMLButtonElement, PageItemProps>(function PageItem(
  { page, current, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-current={current ? 'page' : undefined}
      aria-label={`Page ${page}`}
      disabled={current || rest.disabled}
      className={cx('scalar-page-item', className)}
      {...rest}
    >
      {page}
    </button>
  );
});

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** How many pages to show either side of the current one. */
  siblingCount?: number;
  className?: string;
}

/** Builds the page list, with `null` standing in for a skipped range. */
function buildRange(page: number, pageCount: number, siblings: number): Array<number | null> {
  const total = siblings * 2 + 5;
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const showLeftGap = left > 2;
  const showRightGap = right < pageCount - 1;

  const out: Array<number | null> = [1];
  if (showLeftGap) out.push(null);
  for (let i = Math.max(left, 2); i <= Math.min(right, pageCount - 1); i++) out.push(i);
  if (showRightGap) out.push(null);
  out.push(pageCount);
  return out;
}

/**
 * Pagination — moves through a result set page by page.
 *
 * The first and last page are always shown so the user can see how large the
 * set is. Previous is disabled on the first page and Next on the last — never
 * hidden: a control that disappears moves everything beside it and costs the
 * user their aim.
 *
 * For a long grid people scan rather than navigate, consider infinite scroll;
 * pagination is for sets people cite by page.
 */
export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, className }: PaginationProps) {
  const range = buildRange(page, pageCount, siblingCount);

  return (
    <nav aria-label="Pagination" className={cx('scalar-pagination', className)}>
      <button
        type="button"
        className="scalar-page-item"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Icon size="s" tone="inherit"><ChevronLeft /></Icon>
      </button>

      {range.map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="scalar-pagination__ellipsis" aria-hidden>…</span>
        ) : (
          <PageItem key={p} page={p} current={p === page} onClick={() => onPageChange(p)} />
        ),
      )}

      <button
        type="button"
        className="scalar-page-item"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <Icon size="s" tone="inherit"><ChevronRight /></Icon>
      </button>
    </nav>
  );
}
