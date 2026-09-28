/**
 * The wide, configurable portfolio grid shared by Intelligence (Summaries,
 * Schedule of Investments, Daily NAV) and the firm Valuations page.
 *
 * Composed from the grid-pattern components the Figma frames use — Grid Column
 * Header, Column Group Header, Row Label Cell, Grid Value Cell, Collapsed
 * Column Rail, Add Column Header — laid out on a CSS grid so the pinned first
 * column, the column groups and the header all share one set of tracks.
 *
 * - Widths are percentages of the viewport (`colPct`), so a 30-column summary
 *   scrolls horizontally instead of squeezing.
 * - `scrollTo` scrolls a named column to the left edge (the "Scrolled" frames).
 * - The rails count the columns hidden either side and page the grid on click.
 * - `popover` anchors content under one cell (the Cell trend popover).
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AddColumnHeader, CollapsedColumnRail, ColumnGroupHeader, GridColumnHeader, GridValueCell,
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
  /** Width of each value column as a % of the visible grid. Omit to fit 100%. */
  colPct?: number;
  pinnedPct?: number;
  /** Column scrolled to the left edge on mount; `'end'` scrolls fully right. */
  scrollTo?: string;
  selectedCol?: string;
  focused?: { row: string; col: string };
  onCellClick?: (row: string, col: string) => void;
  onAddColumn?: () => void;
  addColumnLabel?: string;
  /** Show the Collapsed Column Rails for hidden columns. */
  rails?: boolean;
  popover?: { row: string; col: string; content: ReactNode };
}

const pinnedStyle = {
  position: 'sticky' as const,
  left: 0,
  zIndex: 1,
  display: 'grid',
  background: color.bg.surface,
};

/** One-line values: long text truncates instead of growing the row. */
const clip = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, minWidth: 0 };

const numberOf = (v: ReactNode): number | null => {
  if (typeof v !== 'string') return null;
  const n = Number(v.replace(/[^0-9.-]/g, ''));
  return v.match(/\d/) && !Number.isNaN(n) ? n : null;
};

export function PortfolioGrid({
  label, firstColumn, columns, rows, total, groups, colPct, pinnedPct = 16, scrollTo, selectedCol,
  focused, onCellClick, onAddColumn, addColumnLabel = 'Add column', rails, popover,
}: PortfolioGridProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const outer = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<{ key: string; dir: SortDirection }>({ key: '', dir: 'none' });
  const [hidden, setHidden] = useState({ left: 0, right: 0, pinnedW: 0 });
  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null);

  const n = columns.length + (onAddColumn ? 1 : 0);
  const fitted = colPct === undefined;
  const width = fitted ? '100%' : `${pinnedPct + n * colPct}%`;
  const template = fitted
    ? `2fr repeat(${n}, 1fr)`
    : `${pinnedPct}fr repeat(${n}, ${colPct}fr)`;

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
    const el = scroller.current;
    if (!el) return;
    const pin = el.querySelector<HTMLElement>('[data-pin="head"]');
    const pinnedW = pin?.offsetWidth ?? 0;
    let left = 0, right = 0;
    el.querySelectorAll<HTMLElement>('[data-head]').forEach((h) => {
      if (h.offsetLeft + h.offsetWidth / 2 < el.scrollLeft + pinnedW) left++;
      else if (h.offsetLeft + h.offsetWidth / 2 > el.scrollLeft + el.clientWidth) right++;
    });
    setHidden({ left, right, pinnedW });
  }, []);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (scrollTo === 'end') el.scrollLeft = el.scrollWidth;
    else if (scrollTo) {
      const h = el.querySelector<HTMLElement>(`[data-head="${scrollTo}"]`);
      const pin = el.querySelector<HTMLElement>('[data-pin="head"]');
      if (h) el.scrollLeft = h.offsetLeft - (pin?.offsetWidth ?? 0);
    }
    measure();
  }, [scrollTo, measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Anchor the popover under its cell, and follow it when the grid scrolls.
  const place = useCallback(() => {
    if (!popover || !outer.current) return setAnchor(null);
    const cell = outer.current.querySelector<HTMLElement>(`[data-cell="${popover.row}|${popover.col}"]`);
    if (!cell) return setAnchor(null);
    const o = outer.current.getBoundingClientRect();
    const c = cell.getBoundingClientRect();
    setAnchor({ left: c.left - o.left, top: c.bottom - o.top });
  }, [popover?.row, popover?.col]);
  useLayoutEffect(() => { place(); }, [place, scrollTo]);

  const page = (dir: 1 | -1) => () => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: 'smooth' });
  };

  const valueCell = (row: GridRow, col: GridCol, v: ReactNode | undefined) => {
    const isFocused = focused?.row === row.id && focused.col === col.key;
    return (
      <div
        key={col.key}
        data-cell={`${row.id}|${col.key}`}
        onClick={onCellClick ? () => onCellClick(row.id, col.key) : undefined}
        style={{ display: 'grid', whiteSpace: 'nowrap', overflow: 'hidden', cursor: onCellClick ? 'pointer' : undefined }}
      >
        {v === undefined ? (
          <GridValueCell state="not-applicable" />
        ) : (
          <GridValueCell kind={col.kind ?? 'calculated'} state={isFocused ? 'focused' : 'default'}>
            {typeof v === 'string' ? <span title={v} style={clip}>{v}</span> : v}
          </GridValueCell>
        )}
      </div>
    );
  };

  return (
    <div ref={outer} style={{ position: 'relative' }}>
      <div
        ref={scroller}
        onScroll={() => { measure(); place(); }}
        style={{ overflowX: 'auto', border: `1px solid ${color.stroke.divider}` }}
      >
        <div
          role="grid"
          aria-label={label}
          aria-colcount={columns.length + 1}
          style={{ display: 'grid', gridTemplateColumns: template, width, background: color.bg.surface }}
        >
          {groups && (
            <Row style={{ display: 'contents' }}>
              <div style={pinnedStyle}><ColumnGroupHeader span={1}>{' '}</ColumnGroupHeader></div>
              {groups.map((g) => (
                <ColumnGroupHeader key={g.label} span={g.span}>{g.label}</ColumnGroupHeader>
              ))}
              {onAddColumn && <ColumnGroupHeader span={1}>{' '}</ColumnGroupHeader>}
            </Row>
          )}

          <Row style={{ display: 'contents' }}>
            <div data-pin="head" style={pinnedStyle}>
              <GridColumnHeader sort={dirOf('__label')} onSort={cycle('__label')}>{firstColumn}</GridColumnHeader>
            </div>
            {columns.map((c) => (
              <div key={c.key} data-head={c.key} style={{ display: 'grid' }}>
                <GridColumnHeader
                  draggable
                  numeric={c.numeric}
                  selected={selectedCol === c.key}
                  sort={dirOf(c.key)}
                  onSort={cycle(c.key)}
                  onFilter={c.filter ? () => undefined : undefined}
                >
                  {c.label}
                </GridColumnHeader>
              </div>
            ))}
            {onAddColumn && <AddColumnHeader onClick={onAddColumn}>{addColumnLabel}</AddColumnHeader>}
          </Row>

          {sorted.map((r) => (
            <Row key={r.id} style={{ display: 'contents' }}>
              <div style={pinnedStyle}>
                {r.expandable ? (
                  <RowLabelCell expanded={false}>{r.label}</RowLabelCell>
                ) : (
                  <RowLabelCell>{r.label}</RowLabelCell>
                )}
              </div>
              {columns.map((c) => valueCell(r, c, r.values[c.key]))}
              {onAddColumn && <GridValueCell>{''}</GridValueCell>}
            </Row>
          ))}

          {total && (
            <Row type="total" style={{ display: 'contents' }}>
              <div style={pinnedStyle}><RowLabelCell type="total">Total</RowLabelCell></div>
              {columns.map((c) => (
                <GridValueCell key={c.key} kind="total">{total[c.key] ?? ''}</GridValueCell>
              ))}
              {onAddColumn && <GridValueCell kind="total">{''}</GridValueCell>}
            </Row>
          )}
        </div>
      </div>

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
