import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { Pagination } from '../navigation/Pagination.js';

/** Rows per page when the caller does not say. */
export const DEFAULT_ROWS_PER_PAGE = 25;
/** The rows-per-page choices every table offers. */
export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * How a table pages. Every field is optional because the table pages itself:
 * there is deliberately **no way to turn pagination off**. Every `DataGrid`
 * and every `Table` renders its pagination bar, even when all rows fit on one
 * page (the bar then reads "1–4 of 4" with Previous and Next disabled), so the
 * size of the set is always visible and no screen looks different from the
 * rest.
 */
export interface TablePaging {
  /**
   * Server paging. Set it to the size of the WHOLE set and pass only the
   * current page's rows as children; the table then shows them as they are.
   * Leave it out and the table slices its own rows (client paging).
   */
  totalRows?: number;
  /** The page being viewed (controlled). Omit it to let the table own it. */
  page?: number;
  /** Initial page when uncontrolled. Default 1. */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Rows per page (controlled). Omit it to let the table own it. */
  rowsPerPage?: number;
  /** Initial rows per page when uncontrolled. Default 25. */
  defaultRowsPerPage?: number;
  /** Called with the new size; the table has already gone back to page 1. */
  onRowsPerPageChange?: (rows: number) => void;
  /** The choices offered. Default 10 · 25 · 50 · 100. */
  rowsPerPageOptions?: readonly number[];
  /** Accessible name of the page navigation. Default "<table name> pages". */
  label?: string;
}

export interface PageState {
  page: number;
  pageCount: number;
  rowsPerPage: number;
  /** Index of the first row on the page in the whole set (0-based). */
  from: number;
  /** One past the last row on the page. */
  to: number;
  total: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
}

/**
 * Page maths shared by `DataGrid` and `Table`. `breaks`, when given, returns
 * the start index of every page for a page size, so a table can keep groups
 * of rows together; otherwise pages are equal slices.
 */
export function usePageState(
  paging: TablePaging | undefined,
  count: number,
  breaks?: (rowsPerPage: number) => number[],
): PageState {
  const cfg = paging ?? {};
  const [rawRows, setRows] = useControllableState(cfg.rowsPerPage, cfg.defaultRowsPerPage ?? DEFAULT_ROWS_PER_PAGE, cfg.onRowsPerPageChange);
  const [rawPage, setRawPage] = useControllableState(cfg.page, cfg.defaultPage ?? 1, cfg.onPageChange);
  const rowsPerPage = Math.max(1, Math.floor(rawRows) || DEFAULT_ROWS_PER_PAGE);
  const total = Math.max(0, cfg.totalRows ?? count);
  const starts = cfg.totalRows == null && breaks ? breaks(rowsPerPage) : null;
  const pageCount = Math.max(1, starts ? starts.length : Math.ceil(total / rowsPerPage));
  const page = Math.min(Math.max(1, Math.floor(rawPage) || 1), pageCount);
  const from = starts ? starts[page - 1] ?? 0 : Math.min((page - 1) * rowsPerPage, total);
  const to = starts ? starts[page] ?? total : Math.min(from + rowsPerPage, total);
  return {
    page, pageCount, rowsPerPage, from, to, total,
    setPage: setRawPage,
    setRowsPerPage: (n) => { setRows(n); setRawPage(1); },
  };
}

/** Flattens fragments and arrays so each body row can be counted and sliced. */
export function flattenRows(node: ReactNode): ReactElement[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === Fragment) return flattenRows((child.props as { children?: ReactNode }).children);
    return [child];
  });
}

export interface TablePaginationProps {
  state: PageState;
  /** Accessible name of the page navigation. */
  label: string;
  rowsPerPageOptions?: readonly number[];
  className?: string;
}

/**
 * Table Pagination — the bar under every `DataGrid` and `Table`: the visible
 * range ("26–50 of 200"), the rows-per-page Select and the page buttons.
 *
 * You never render this yourself. The tables render it; a hand-placed
 * `Pagination` under a table is a review failure (AI-GUIDE R15).
 */
export function TablePagination({ state, label, rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS, className }: TablePaginationProps) {
  const { page, pageCount, rowsPerPage, from, to, total, setPage, setRowsPerPage } = state;
  const range = total === 0 ? '0 of 0' : `${(from + 1).toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`;
  return (
    <div className={cx('scalar-table-pagination', className)}>
      <span className="scalar-table-pagination__range">{range}</span>
      <Pagination
        label={label}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        onRowsPerPageChange={setRowsPerPage}
      />
    </div>
  );
}
