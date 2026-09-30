/**
 * The wide, configurable portfolio grid shared by Intelligence (Summaries,
 * Schedule of Investments, Daily NAV) and the firm Valuations page.
 *
 * It is a `DataGrid` + `Row` of grid-pattern cells — Grid Column Header,
 * Column Group Header, Row Label Cell, Grid Value Cell, Add Column Header —
 * so column tracks come from the headers and body cells fill them. The local
 * wrapper exists only for behaviour the DataGrid does not own:
 *
 * - a pinned (sticky-left) first column,
 * - `scrollTo`: scroll a named column to the left edge (the "Scrolled" frames),
 * - Collapsed Column Rails counting the columns hidden either side,
 * - `popover`: content anchored under one cell (the Cell trend popover).
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AddColumnHeader, CollapsedColumnRail, ColumnGroupHeader, DataGrid, GridColumnHeader, GridValueCell,
  Row, RowLabelCell, color, zIndex, type SortDirection, type ValueKind,
} from '@scalar/design-system';

export interface GridCol {
  key: string;
  label: string;
  numeric?: boolean;
  /** Where the value comes from — calculated (default), editable or sourced. */
  kind?: ValueKind;
  /** Shows the in-header filter button (the Fund column). */
  filter?: boolean;
}

export interface GridRow {
  id: string;
  /** Rendered in the pinned Row Label Cell (may be a Link). */
  label: ReactNode;
  /** Plain text of the label, for sorting. */
  sortText: string;
  /** `undefined` renders a shaded Not Applicable cell; `''` an empty one. */
  values: Record<string, ReactNode | undefined>;
  /** Draws the + expander on the row label (Daily NAV companies with a valuation). */
  expandable?: boolean;
}

export interface PortfolioGridProps {
  label: string;
  /** Header of the pinned first column. */
  firstColumn: string;
  columns: GridCol[];
  rows: GridRow[];
  total?: Record<string, ReactNode>;
  groups?: Array<{ label: string; span: number }>;
  /** Column scrolled to the left edge on mount; `'end'` scrolls fully right. */
  scrollTo?: string;
  selectedCol?: string;
  focused?: { row: string; col: string };
  onCellClick?: (row: string, col: string) => void;
  onAddColumn?: () => void;
  addColumnLabel?: string;
  addColumnSelected?: boolean;
  /** Show the Collapsed Column Rails for hidden columns. */
  rails?: boolean;
  popover?: { row: string; col: string; content: ReactNode };
}

/** The pinned first column sticks to the grid's left edge while it scrolls sideways. */
const pin: CSSProperties = { position: 'sticky', left: 0, zIndex: 1 };
const pinBody: CSSProperties = { ...pin, background: color.bg.surface };
/** A pinned body cell is opaque (it covers cells scrolling under it), so it repeats the zebra stripe. */
const pinRow = (i: number): CSSProperties => ({ ...pin, background: i % 2 === 1 ? color.bg.subtle : color.bg.surface });

/** One-line values: long text truncates instead of growing the row. */
const clip: CSSProperties = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 };

const numberOf = (v: ReactNode): number | null => {
  if (typeof v !== 'string') return null;
  const n = Number(v.replace(/[^0-9.-]/g, ''));
  return v.match(/\d/) && !Number.isNaN(n) ? n : null;
};

export function PortfolioGrid({
  label, firstColumn, columns, rows, total, groups, scrollTo, selectedCol, focused, onCellClick,
  onAddColumn, addColumnLabel = 'Add column', addColumnSelected, rails, popover,
}: PortfolioGridProps) {
  const outer = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<{ key: string; dir: SortDirection }>({ key: '', dir: 'none' });
  const [hidden, setHidden] = useState({ left: 0, right: 0, pinnedW: 0 });
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);
  const scroller = () => outer.current?.querySelector<HTMLElement>('[role=grid]') ?? null;

  const sorted = useMemo(() => {
    if (sort.dir === 'none') return rows;
    const val = (r: GridRow) => (sort.key === '__label' ? r.sortText : r.values[sort.key]);
    const out = [...rows].sort((a, b) => {
      const x = val(a), y = val(b);
      const nx = numberOf(x), ny = numberOf(y);
      if (nx !== null && ny !== null) return nx - ny;
      return String(x ?? '').localeCompare(String(y ?? ''));
    });
    return sort.dir === 'descending' ? out.reverse() : out;
  }, [rows, sort]);

  const cycle = (key: string) => () =>
    setSort((s) => ({
      key,
      dir: s.key !== key ? 'ascending' : s.dir === 'ascending' ? 'descending' : s.dir === 'descending' ? 'none' : 'ascending',
    }));
  const dirOf = (key: string): SortDirection => (sort.key === key ? sort.dir : 'none');

  /** Which value columns sit outside the visible band. */
  const measure = useCallback(() => {
    const el = scroller();
    if (!el) return;
    const pinnedW = el.querySelector<HTMLElement>('[data-pin="head"]')?.offsetWidth ?? 0;
    let left = 0, right = 0;
    el.querySelectorAll<HTMLElement>('[data-head]').forEach((h) => {
      const mid = h.offsetLeft + h.offsetWidth / 2;
      if (mid < el.scrollLeft + pinnedW) left++;
      else if (mid > el.scrollLeft + el.clientWidth) right++;
    });
    setHidden({ left, right, pinnedW });
  }, []);

  // Anchor the popover under its cell, and follow it when the grid scrolls.
  const place = useCallback(() => {
    const o = outer.current;
    const cell = popover && o?.querySelector<HTMLElement>(`[data-cell="${popover.row}|${popover.col}"]`);
    if (!o || !cell) { setAnchor(null); return; }
    const a = o.getBoundingClientRect();
    const c = cell.getBoundingClientRect();
    setAnchor({ left: c.left - a.left, top: c.bottom - a.top });
  }, [popover?.row, popover?.col]);

  useLayoutEffect(() => {
    const el = scroller();
    if (!el) return;
    if (scrollTo === 'end') el.scrollLeft = el.scrollWidth;
    else if (scrollTo) {
      const h = el.querySelector<HTMLElement>(`[data-head="${scrollTo}"]`);
      const pinnedW = el.querySelector<HTMLElement>('[data-pin="head"]')?.offsetWidth ?? 0;
      if (h) el.scrollLeft = h.offsetLeft - pinnedW;
    }
    measure();
    place();
  }, [scrollTo, measure, place]);

  useEffect(() => {
    const el = scroller();
    const on = () => { measure(); place(); };
    el?.addEventListener('scroll', on);
    window.addEventListener('resize', on);
    return () => {
      el?.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, [measure, place]);

  const page = (dir: 1 | -1) => () => {
    const el = scroller();
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: 'smooth' });
  };

  const valueCell = (row: GridRow, col: GridCol) => {
    const v = row.values[col.key];
    if (v === undefined) return <GridValueCell key={col.key} state="not-applicable" data-cell={`${row.id}|${col.key}`} />;
    const isFocused = focused?.row === row.id && focused.col === col.key;
    return (
      <GridValueCell
        key={col.key}
        data-cell={`${row.id}|${col.key}`}
        data-tour={isFocused ? 'numeric-highlight' : undefined}
        kind={col.kind ?? 'calculated'}
        state={isFocused ? 'focused' : 'default'}
        onClick={onCellClick ? () => onCellClick(row.id, col.key) : undefined}
        style={onCellClick ? { cursor: 'pointer' } : undefined}
      >
        {typeof v === 'string' ? <span title={v} style={clip}>{v}</span> : v}
      </GridValueCell>
    );
  };

  return (
    <div ref={outer} style={{ position: 'relative', minWidth: 0 }}>
      <DataGrid
        label={label}
        style={{ border: `1px solid ${color.stroke.divider}` }}
        groupHead={groups && (
          <>
            <ColumnGroupHeader span={1} style={pinBody}>{' '}</ColumnGroupHeader>
            {groups.map((g) => <ColumnGroupHeader key={g.label} span={g.span}>{g.label}</ColumnGroupHeader>)}
            {onAddColumn && <ColumnGroupHeader span={1}>{' '}</ColumnGroupHeader>}
          </>
        )}
        head={
          <>
            <GridColumnHeader grow={2} data-pin="head" style={pinBody} sort={dirOf('__label')} onSort={cycle('__label')}>
              {firstColumn}
            </GridColumnHeader>
            {columns.map((c) => (
              <GridColumnHeader
                key={c.key}
                data-head={c.key}
                draggable
                numeric={c.numeric}
                selected={selectedCol === c.key}
                sort={dirOf(c.key)}
                onSort={cycle(c.key)}
                onFilter={c.filter ? () => undefined : undefined}
              >
                {c.label}
              </GridColumnHeader>
            ))}
            {onAddColumn && <AddColumnHeader onClick={onAddColumn} selected={addColumnSelected}>{addColumnLabel}</AddColumnHeader>}
          </>
        }
      >
        {sorted.map((r, i) => (
          <Row key={r.id} zebra={i % 2 === 1}>
            {r.expandable ? (
              <RowLabelCell expanded={false} style={pinRow(i)}>{r.label}</RowLabelCell>
            ) : (
              <RowLabelCell style={pinRow(i)}>{r.label}</RowLabelCell>
            )}
            {columns.map((c) => valueCell(r, c))}
            {onAddColumn && <GridValueCell>{''}</GridValueCell>}
          </Row>
        ))}

        {total && (
          <Row type="total">
            <RowLabelCell type="total" style={pin}>Total</RowLabelCell>
            {columns.map((c) => <GridValueCell key={c.key} kind="total">{total[c.key] ?? ''}</GridValueCell>)}
            {onAddColumn && <GridValueCell kind="total">{''}</GridValueCell>}
          </Row>
        )}
      </DataGrid>

      {rails && hidden.left > 0 && (
        <div style={{ position: 'absolute', top: '25%', left: hidden.pinnedW, zIndex: zIndex.sticky }}>
          <CollapsedColumnRail count={hidden.left} onExpand={page(-1)} />
        </div>
      )}
      {rails && hidden.right > 0 && (
        <div style={{ position: 'absolute', top: '25%', right: 0, zIndex: zIndex.sticky }}>
          <CollapsedColumnRail count={hidden.right} onExpand={page(1)} />
        </div>
      )}

      {popover && anchor && (
        <div style={{ position: 'absolute', left: anchor.left, top: anchor.top, zIndex: zIndex.overlay }}>
          {popover.content}
        </div>
      )}
    </div>
  );
}
