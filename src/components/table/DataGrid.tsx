import { Children, Fragment, forwardRef, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

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

function flatten(node: ReactNode): ReactElement[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === Fragment) return flatten((child.props as { children?: ReactNode }).children);
    return [child];
  });
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
 * Accessibility: **a name is required** — `label` or `aria-labelledby`.
 */
export const DataGrid = forwardRef<HTMLDivElement, DataGridProps>(function DataGrid(
  { head, groupHead, children, label, columns, maxHeight, className, style, ...rest },
  ref,
) {
  const tracks = columns ?? columnTracks(head);
  const gridStyle = {
    ...(tracks.length ? { gridTemplateColumns: tracks.join(' ') } : null),
    ...(maxHeight ? { maxHeight, overflowY: 'auto' as const } : null),
    ...style,
  };
  return (
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
      {children}
    </div>
  );
});
