import { forwardRef, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { TablePagination, flattenRows, usePageState, type TablePaging } from './TablePagination.js';

/** A DataGrid must be named: pass `label`, or `aria-labelledby` pointing at a visible heading. */
export type DataGridName = { label: string; 'aria-labelledby'?: string } | { label?: string; 'aria-labelledby': string };

interface DataGridBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /**
   * The sticky header row. Render `ColumnHeader` / `GridColumnHeader` /
   * `AddColumnHeader` instances here — one per column. Each header's
   * `grow` / `width` / `span` props define its column track.
   */
  head?: ReactNode;
  /** An optional row of `ColumnGroupHeader`s above `head` (use their `span`). */
  groupHead?: ReactNode;
  /** The body rows. Render `Row` instances here (directly or in fragments). */
  children?: ReactNode;
  /**
   * Explicit column tracks, overriding the ones derived from `head`,
   * e.g. `['minmax(max-content, 2fr)', size.control.l]`.
   */
  columns?: string[];
  /**
   * Bound the grid's height: the body scrolls inside it and the header sticks
   * to the grid's top. Without it the grid grows with its rows. The scrolling
   * region is keyboard-focusable so it can be scrolled without a pointer.
   */
  maxHeight?: string;
  /**
   * How the grid pages. Optional because the grid always pages itself — there
   * is no prop that hides the pagination bar (AI-GUIDE R15). Without it the
   * grid shows 25 rows a page from its own children; pass `totalRows` (and
   * `page` / `onPageChange`) when the rows come a page at a time from a server.
   */
  pagination?: TablePaging;
}

export type DataGridProps = DataGridBaseProps & DataGridName;

/** Props a header cell may carry to size its column. */
interface TrackProps {
  /** Share of the leftover width this column takes. Default 1. */
  grow?: number;
  /** A fixed track instead of the header-sized one, e.g. `size.control.l`. */
  width?: string;
  /** How many columns this header spans. Default 1. */
  span?: number;
}

const flatten = flattenRows;

/** A trailing run of `Row type="total"` rows: they stay under every page, not only the last. */
function splitTotals(rows: ReactElement[]): [ReactElement[], ReactElement[]] {
  let i = rows.length;
  while (i > 0 && (rows[i - 1]!.props as { type?: string }).type === 'total') i--;
  return [rows.slice(0, i), rows.slice(i)];
}

/**
 * Column tracks from the header cells. A column is never narrower than its
 * header label on one line (`max-content`) — so headers never wrap or
 * truncate — and the width left over is shared out by `grow` (`fr`), so the
 * body cells fill the grid.
 */
export function columnTracks(head: ReactNode): string[] {
  return flatten(head).flatMap((el) => {
    const { grow = 1, width, span = 1 } = el.props as TrackProps;
    const track = width ?? `minmax(max-content, ${grow}fr)`;
    return Array.from({ length: Math.max(1, span) }, () => track);
  });
}

/**
 * DataGrid — the layout, scroll and stickiness shell around Row and Cell.
 *
 * It is a CSS grid: the header row defines the column tracks and every Row is
 * a subgrid of them, so a body cell always fills exactly the width of its
 * column header, and header and body cannot drift apart. Wider than its
 * container, the grid scrolls horizontally inside itself.
 *
 * Both cell models work inside it: `Cell` rows and the grid-pattern cells
 * (`RowLabelCell`, `GridValueCell`, `InCellControl`).
 *
 * **Table or grid? This is a table.** It renders `role="table"` with
 * `row` / `columnheader` / `rowheader` / `cell` children, *not* `role="grid"`.
 * The WAI-ARIA grid role promises a single tab stop, arrow-key movement between
 * cells and Enter/F2 to edit — a model none of these cells implement, because
 * the library draws editable-looking cells (`GridValueCell`, `InCellControl`)
 * but never edits them: each is a plain native control (a `<button>`, or the
 * consumer's own input) that sits in the normal Tab order and is activated
 * with Enter / Space. Reading order and column/row header relationships come
 * from the table roles, and sort state from `aria-sort` on the column header.
 * If you build a genuinely editable spreadsheet on top of this, own the
 * APG grid keyboard model (roving tabindex, arrows, Home/End, Enter/F2, Esc)
 * and set `role="grid"` through your own wrapper — do not just pass it here.
 *
 * **Every DataGrid paginates, and that cannot be switched off.** The
 * pagination bar (range, rows per page, pages) always renders under the grid,
 * even when every row fits on one page. By default the grid slices its own
 * children (25 a page); trailing `Row type="total"` rows stay under every page.
 * For server paging pass `pagination={{ totalRows, page, onPageChange }}` and
 * only the current page's rows. Never put your own `Pagination` under a grid.
 *
 * Accessibility: **a name is required** — `label` or `aria-labelledby`.
 */
export const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(function DataGrid(
  { head, groupHead, children, label, columns, maxHeight, pagination, className, style, ...rest },
  ref,
) {
  const [body, totals] = splitTotals(flatten(children));
  const paging = usePageState(pagination, body.length);
  const server = pagination?.totalRows != null;
  const pageRows = server ? body : body.slice(paging.from, paging.to);
  const name = pagination?.label ?? `${label ?? 'Table'} pages`;
  const tracks = columns ?? columnTracks(head);
  // A width sizes the grid AND its pagination bar, so it goes on the frame around both.
  const { width, ...ownStyle } = style ?? {};
  const gridStyle = {
    ...(tracks.length ? { gridTemplateColumns: tracks.join(' ') } : null),
    ...(maxHeight ? { maxHeight, overflowY: 'auto' as const } : null),
    ...ownStyle,
  };
  return (
    <div className="scalar-grid-frame" style={width !== undefined ? { width } : undefined}>
      <div
        ref={ref}
        aria-label={label}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be keyboard-focusable (WCAG 2.1.1)
        tabIndex={maxHeight ? 0 : undefined}
        {...rest}
        role="table"
        className={cx('scalar-grid', maxHeight && 'scalar-grid--bounded', className)}
        style={gridStyle}
      >
        {groupHead && (
          <div role="row" className="scalar-grid__head scalar-grid__head--group">
            {groupHead}
          </div>
        )}
        {head && (
          <div role="row" className="scalar-grid__head">
            {head}
          </div>
        )}
        {pageRows}
        {totals}
      </div>
      <TablePagination state={paging} label={name} rowsPerPageOptions={pagination?.rowsPerPageOptions} />
    </div>
  );
});
