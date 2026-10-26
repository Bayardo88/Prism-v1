import {
  Fragment, forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState,
  type ClipboardEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { Icon } from '../icon/Icon.js';
import { Plus, Minus } from '../icon/glyphs.js';
import { ArrowDropDown } from '../icon/material.js';
import { Cell } from './Cell.js';
import { ColumnHeader } from './ColumnHeader.js';
import { RowHeader, type RowHeaderIconProps } from './RowHeader.js';
import { Footnote } from './Footnote.js';
import { TablePagination, usePageState, type TablePaging } from './TablePagination.js';
import {
  DEFAULT_COLUMN_WIDTH, DEFAULT_TITLE_WIDTH, DIVIDER_WIDTH, HEADER_HEIGHT, NO_SELECTION, NUMBER_COLUMN_WIDTH, RESIZE_STEP,
  ROW_HEIGHT, TITLE_COLUMN_ID, WIDTH_CEIL,
  a1, a1Range, aggregate, cellSelection, cellState, clampWidth, columnLetter, columnMinWidth, effectiveWidth, focusOf,
  formatValue, headerFullWidth, measureText, pageStarts, rangeSelection, selectionRange, titleMinWidth, toTsv,
  type Selection, type TableCellData, type TableColumnDef, type TableRowDef,
} from './tableModel.js';

export interface TableProps {
  /** Stable id. Persisted column widths are stored under it. */
  tableId: string;
  title: string;
  columns: TableColumnDef[];
  rows: TableRowDef[];
  /** Keyed `${rowId}:${columnId}`. A missing key is an empty cell. */
  cells: Record<string, TableCellData>;
  /** Letters across the top, row numbers down the left, and an fx bar under the table while it holds a selection. */
  formulaMode?: boolean;
  /** Controlled selection. Indices count the *visible* rows and the data columns. */
  selection?: Selection;
  defaultSelection?: Selection;
  onSelectionChange?: (selection: Selection) => void;
  /** Controlled user widths, keyed by column id (`TITLE_COLUMN_ID` for the title column). */
  columnWidths?: Record<string, number>;
  /** Width is already clamped to the column's minimum and maximum. */
  onColumnResize?: (columnId: string, width: number) => void;
  /** Called with the cell's `id` and the typed text (or the chosen option). */
  onCellCommit?: (cellId: string, value: string) => void;
  /** Shows the trailing add-column header. */
  onAddColumn?: () => void;
  addColumnLabel?: string;
  /** Called by a row's `+` control (`addable`). */
  onAddRow?: (rowId: string) => void;
  /** Footnote text by number; a cell's footnote points at it with `aria-describedby`. */
  footnotes?: Record<number, string>;
  /**
   * How the table pages. Optional because the table always pages itself —
   * there is no prop that hides the pagination bar (AI-GUIDE R15). Default 25
   * rows a page; a top-level row and its children always share a page. Pass
   * `totalRows` when `rows` is already one page from a server.
   */
  pagination?: TablePaging;
  className?: string;
}

type Track = { kind: 'divider' } | { kind: 'col'; index: number; col: TableColumnDef; width: number; left: number };

const STORAGE_PREFIX = 'scalar-table:';

function loadWidths(tableId: string): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + tableId);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}
function saveWidths(tableId: string, widths: Record<string, number>) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + tableId, JSON.stringify(widths));
  } catch {
    /* storage unavailable: widths last for the session */
  }
}

const focusOnMount = (el: HTMLElement | null) => el?.focus();

const isEditable = (cell?: TableCellData) => cell?.kind === 'editable';

function iconProps(control: { icon: ReactNode; label: string; run: () => void } | null): { icon?: ReactNode } & RowHeaderIconProps {
  return control ? { icon: control.icon, iconLabel: control.label, onIconClick: control.run } : {};
}

/**
 * Table — the one Prism table for the whole platform.
 *
 * Valuations, Waterfalls, Financials, Cap Table, Companies, Reports and the
 * Workboard all render this component. Differences come from `columns`, `rows`,
 * `cells` and the props — never from a fork.
 *
 * It is a spreadsheet-like ARIA `grid`: 26px body rows and 40px headers, a sticky
 * title column, one tab stop with roving focus inside, a rectangular selection
 * drawn as ONE perimeter overlay, user-resizable columns that never go below the
 * width their longest value needs, and an optional formula view.
 *
 * For a static, read-only table with no selection use `DataGrid`.
 *
 * **It always paginates** — the pagination bar renders under the table even
 * when every row fits on one page, and no prop removes it. A group (a
 * top-level row and its children) never splits across pages; A1 row numbers
 * keep counting across pages; changing page clears the selection.
 *
 * State is derived, never stored per cell: fill comes from selection and hover,
 * text colour from `cell.kind` only. Fill precedence is error > selected >
 * pressed > hover > zebra > default.
 *
 * Accessibility: `role="grid"`, `aria-selected` on selected cells,
 * `aria-readonly` on readable / sourced / total / draft cells, `aria-invalid` on
 * errors. Editable cells carry a hidden "editable" cue so colour is not the only
 * signal. Keys: arrows move, Shift+arrows extend, Ctrl/Cmd+arrows jump,
 * Ctrl/Cmd+Space selects the column, Shift+Space the row, Enter / F2 edits,
 * Esc cancels then clears, Ctrl/Cmd+C copies tab-separated values.
 */
export const Table = forwardRef<HTMLDivElement, TableProps>(function Table(props, ref) {
  const {
    tableId, title, columns, rows, cells, formulaMode, columnWidths, onColumnResize, onCellCommit, onAddColumn,
    addColumnLabel = 'Add column', onAddRow, footnotes, pagination, className,
  } = props;
  const uid = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const [selection, setSelection] = useControllableState<Selection>(props.selection, props.defaultSelection ?? NO_SELECTION, props.onSelectionChange);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<{ r: number; c: number; text: string } | null>(null);
  const [localWidths, setLocalWidths] = useState<Record<string, number>>(() => (typeof window === 'undefined' ? {} : loadWidths(tableId)));
  const [guideX, setGuideX] = useState<number | null>(null);
  const userWidths = columnWidths ?? localWidths;

  const dragging = useRef(false);
  const pendingFocus = useRef(false);
  const cancelEdit = useRef(false);

  /* ----------------------------------------------------- derived structure */

  const paging = usePageState(pagination, rows.length, useCallback((n: number) => pageStarts(rows, n), [rows]));
  const [pageFrom, pageTo] = pagination?.totalRows != null ? [0, rows.length] : [paging.from, paging.to];

  const visibleRows = useMemo(() => {
    const out: Array<{ row: TableRowDef; index: number }> = [];
    let hiding = false;
    rows.slice(pageFrom, pageTo).forEach((row, i) => {
      if (row.level === 0) hiding = false;
      if (!hiding) out.push({ row, index: pageFrom + i });
      if (row.level === 0 && row.collapsible && collapsed.has(row.id)) hiding = true;
    });
    return out;
  }, [rows, collapsed, pageFrom, pageTo]);

  // Minimums come from DATA over ALL rows (collapsed ones included), never from the DOM.
  const mins = useMemo(() => {
    const m: Record<string, number> = { [TITLE_COLUMN_ID]: titleMinWidth(rows) };
    for (const col of columns) m[col.id] = columnMinWidth(col, rows, cells);
    return m;
  }, [rows, columns, cells]);
  const maxOf = useCallback((id: string) => (id === TITLE_COLUMN_ID ? WIDTH_CEIL : columns.find((c) => c.id === id)?.maxWidth ?? WIDTH_CEIL), [columns]);

  const titleWidth = effectiveWidth(userWidths[TITLE_COLUMN_ID], DEFAULT_TITLE_WIDTH, mins[TITLE_COLUMN_ID]!);
  const { tracks, dataWidth } = useMemo(() => {
    const out: Track[] = [];
    let left = 0;
    columns.forEach((col, index) => {
      if (index > 0 && col.group !== columns[index - 1]!.group) {
        out.push({ kind: 'divider' });
        left += DIVIDER_WIDTH;
      }
      const width = effectiveWidth(userWidths[col.id] ?? col.width, DEFAULT_COLUMN_WIDTH, mins[col.id]!, col.maxWidth ?? WIDTH_CEIL);
      out.push({ kind: 'col', index, col, width, left });
      left += width;
    });
    return { tracks: out, dataWidth: left };
  }, [columns, userWidths, mins]);
  const colTracks = tracks.filter((t): t is Extract<Track, { kind: 'col' }> => t.kind === 'col');

  const hasGroups = columns.some((c) => c.group);
  const letterH = formulaMode ? ROW_HEIGHT : 0;
  const groupH = hasGroups ? HEADER_HEIGHT : 0;
  const headH = letterH + groupH + HEADER_HEIGHT;
  const headRowCount = (hasGroups ? 1 : 0) + 1;
  const numW = formulaMode ? NUMBER_COLUMN_WIDTH : 0;
  const addW = onAddColumn ? 180 : 0;
  const totalWidth = numW + titleWidth + dataWidth + addW;
  const rowCount = visibleRows.length;
  const colCount = columns.length;

  const cellAt = useCallback((r: number, c: number): TableCellData | undefined => {
    const row = visibleRows[r]?.row;
    const col = columns[c];
    return row && col ? cells[`${row.id}:${col.id}`] : undefined;
  }, [visibleRows, columns, cells]);

  const range = selectionRange(selection, rowCount, colCount);
  const focus = focusOf(selection);
  const active: [number, number] | null = selection.mode === 'cell' || selection.mode === 'range' ? selection.anchor : null;
  const tabStop: [number, number] = focus ?? [0, 0];

  /* ---------------------------------------------------------- selection io */

  const select = useCallback((next: Selection, focusCell = true) => {
    pendingFocus.current = focusCell;
    setSelection(next);
  }, [setSelection]);

  const clamp = (r: number, c: number): [number, number] => [Math.max(0, Math.min(rowCount - 1, r)), Math.max(0, Math.min(colCount - 1, c))];

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const at = focusOf(selection);
    if (!at) return;
    gridRef.current?.querySelector<HTMLElement>(`[data-r="${at[0]}"][data-c="${at[1]}"]`)?.focus();
  }, [selection]);

  // Clicking outside the table clears the selection — which also scopes selection to one table.
  useEffect(() => {
    if (selection.mode === 'none') return;
    const onDown = (e: globalThis.MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setEditing(null);
        setSelection(NO_SELECTION);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [selection.mode, setSelection]);

  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  // A selection belongs to the page it was made on.
  const shownPage = useRef(paging.page);
  useEffect(() => {
    if (shownPage.current === paging.page) return;
    shownPage.current = paging.page;
    setEditing(null);
    setSelection(NO_SELECTION);
  }, [paging.page, setSelection]);

  // Keep a selection valid when rows collapse or columns go away.
  useEffect(() => {
    if (selection.mode === 'none') return;
    const r = selectionRange(selection, rowCount, colCount);
    if (!r || r.r1 >= rowCount || r.c1 >= colCount) setSelection(NO_SELECTION);
  }, [selection, rowCount, colCount, setSelection]);

  const onCellMouseDown = (e: MouseEvent, r: number, c: number) => {
    if (e.button !== 0) return;
    if (editing && editing.r === r && editing.c === c) return;
    if (editing) commitEdit(false);
    dragging.current = true;
    if (e.shiftKey && active) {
      e.preventDefault();
      select(rangeSelection(active, [r, c]));
    } else {
      select(cellSelection([r, c]));
    }
  };

  const onCellMouseEnter = (r: number, c: number) => {
    setHover([r, c]);
    if (dragging.current && active) {
      select(rangeSelection(active, [r, c]), false);
    }
  };

  /* --------------------------------------------------------------- editing */

  const startEdit = (r: number, c: number, seed?: string) => {
    const cell = cellAt(r, c);
    if (!isEditable(cell)) return;
    cancelEdit.current = false;
    setEditing({ r, c, text: seed ?? (cell!.value === null ? '' : String(cell!.value)) });
  };

  function commitEdit(refocus = true, move?: [number, number]) {
    if (!editing) return;
    const cell = cellAt(editing.r, editing.c);
    const { r, c, text } = editing;
    setEditing(null);
    if (cell && !cancelEdit.current && text !== (cell.value === null ? '' : String(cell.value))) onCellCommit?.(cell.id, text);
    if (move) select(cellSelection(clamp(r + move[0], c + move[1])));
    else if (refocus) select(cellSelection([r, c]));
  }

  const editor = (cell: TableCellData, r: number, c: number) => {
    const stop = (e: KeyboardEvent) => e.stopPropagation();
    if (cell.options) {
      return (
        <select
          ref={focusOnMount}
          className="scalar-cell__editor scalar-table__select"
          aria-label={`${formatValue(cell.value, cell.format) || 'Value'}, choose an option`}
          value={editing!.text}
          onChange={(e) => {
            const next = e.target.value;
            setEditing(null);
            if (next !== String(cell.value ?? '')) onCellCommit?.(cell.id, next);
            select(cellSelection([r, c]));
          }}
          onKeyDown={(e) => {
            stop(e);
            if (e.key === 'Escape') { e.preventDefault(); setEditing(null); select(cellSelection([r, c])); }
          }}
          onBlur={() => setEditing(null)}
        >
          {cell.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    return (
      <input
        ref={focusOnMount}
        className="scalar-cell__editor"
        aria-label={`Edit ${cell.id}`}
        value={editing!.text}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setEditing({ r, c, text: e.target.value })}
        onKeyDown={(e) => {
          stop(e);
          if (e.key === 'Enter') { e.preventDefault(); commitEdit(true, [1, 0]); }
          else if (e.key === 'Tab') { e.preventDefault(); commitEdit(true, [0, e.shiftKey ? -1 : 1]); }
          else if (e.key === 'Escape') { e.preventDefault(); cancelEdit.current = true; commitEdit(true); }
        }}
        onBlur={() => { if (editing) commitEdit(false); }}
      />
    );
  };

  /* -------------------------------------------------------------- keyboard */

  const jump = (from: [number, number], dr: number, dc: number): [number, number] => {
    const empty = (r: number, c: number) => {
      const v = cellAt(r, c)?.value;
      return v === null || v === undefined || v === '';
    };
    let [r, c] = from;
    const inside = (rr: number, cc: number) => rr >= 0 && rr < rowCount && cc >= 0 && cc < colCount;
    if (!inside(r + dr, c + dc)) return [r, c];
    const startsFull = !empty(r, c) && !empty(r + dr, c + dc);
    r += dr; c += dc;
    if (startsFull) {
      while (inside(r + dr, c + dc) && !empty(r + dr, c + dc)) { r += dr; c += dc; }
    } else {
      while (empty(r, c) && inside(r + dr, c + dc)) { r += dr; c += dc; }
    }
    return [r, c];
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (editing || e.defaultPrevented) return;
    if (!(e.target as HTMLElement).closest('[role="gridcell"]')) return;
    const cur = focus ?? tabStop;
    const mod = e.ctrlKey || e.metaKey;
    const arrows: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const d = arrows[e.key];
    if (d) {
      e.preventDefault();
      const next = mod ? jump(cur, d[0], d[1]) : clamp(cur[0] + d[0], cur[1] + d[1]);
      select(e.shiftKey ? rangeSelection(active ?? cur, next) : cellSelection(next));
    } else if (e.key === ' ' && mod) {
      e.preventDefault();
      select({ mode: 'column', col: cur[1] });
    } else if (e.key === ' ' && e.shiftKey) {
      e.preventDefault();
      select({ mode: 'row', row: cur[0] });
    } else if (e.key === 'Enter' || e.key === 'F2') {
      if (isEditable(cellAt(cur[0], cur[1]))) { e.preventDefault(); startEdit(cur[0], cur[1]); }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSelection(NO_SELECTION);
    }
  };

  const onCopy = (e: ClipboardEvent<HTMLDivElement>) => {
    if (editing || !range) return;
    const grid: string[][] = [];
    for (let r = range.r0; r <= range.r1; r++) {
      const line: string[] = [];
      for (let c = range.c0; c <= range.c1; c++) {
        const cell = cellAt(r, c);
        line.push(cell ? formatValue(cell.value, cell.format) : '');
      }
      grid.push(line);
    }
    e.clipboardData.setData('text/plain', toTsv(grid));
    e.preventDefault();
  };

  /* -------------------------------------------------------------- resizing */

  const setWidth = useCallback((id: string, width: number) => {
    const w = clampWidth(width, mins[id]!, maxOf(id));
    if (columnWidths === undefined) {
      setLocalWidths((prev) => {
        const next = { ...prev, [id]: w };
        saveWidths(tableId, next);
        return next;
      });
    }
    onColumnResize?.(id, w);
  }, [mins, maxOf, columnWidths, tableId, onColumnResize]);

  const autoFit = (id: string, header: string, hasDropdown?: boolean) => {
    const full = id === TITLE_COLUMN_ID ? Math.ceil(measureText(header, { size: 12, weight: 600 }) + 16) : headerFullWidth({ id, header, hasDropdown });
    setWidth(id, Math.max(mins[id]!, full));
  };

  const startResize = (e: PointerEvent<HTMLDivElement>, id: string, current: number, edgeX: number) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    target.setPointerCapture?.(e.pointerId);
    const startX = e.clientX;
    const min = mins[id]!;
    const max = maxOf(id);
    const move = (ev: globalThis.PointerEvent) => {
      const w = clampWidth(current + (ev.clientX - startX), min, max);
      setWidth(id, w);
      setGuideX(edgeX - current + w);
    };
    const up = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      setGuideX(null);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
    setGuideX(edgeX);
  };

  const handle = (id: string, header: string, width: number, edgeX: number, hasDropdown?: boolean) => (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- a focusable separator is the APG window-splitter widget
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${header}`}
      aria-valuenow={width}
      aria-valuemin={mins[id]}
      aria-valuemax={maxOf(id)}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the separator is focusable so it can be resized by keyboard
      tabIndex={0}
      className="scalar-table__handle"
      onPointerDown={(e) => startResize(e, id, width, edgeX)}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => { e.stopPropagation(); autoFit(id, header, hasDropdown); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); setWidth(id, width - RESIZE_STEP); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); setWidth(id, width + RESIZE_STEP); }
        else if (e.key === 'Home') { e.preventDefault(); setWidth(id, mins[id]!); }
        e.stopPropagation();
      }}
    />
  );

  /* ----------------------------------------------------------- rendering */

  const originX = numW + titleWidth;
  const overlay = (() => {
    if (!range) return null;
    const first = colTracks[range.c0];
    const last = colTracks[range.c1];
    if (!first || !last) return null;
    // 1px all round for a cell or range; 2px for a column or row, open on the side its header sits on.
    const borderWidth = selection.mode === 'column' ? '0 2px 2px 2px' : selection.mode === 'row' ? '2px 2px 2px 0' : '1px';
    return {
      left: originX + first.left,
      top: headH + range.r0 * ROW_HEIGHT,
      width: last.left + last.width - first.left,
      height: (range.r1 - range.r0 + 1) * ROW_HEIGHT,
      borderWidth,
    };
  })();

  const address = (r: number, c: number) => a1(c + 1, headRowCount + visibleRows[r]!.index + 1);
  const fx = (() => {
    if (!formulaMode || !range) return null;
    const single = range.r0 === range.r1 && range.c0 === range.c1;
    const vals: TableCellData[] = [];
    for (let r = range.r0; r <= range.r1; r++) for (let c = range.c0; c <= range.c1; c++) { const cell = cellAt(r, c); if (cell) vals.push(cell); }
    const agg = aggregate(vals.map((v) => v.value));
    const firstNumeric = vals.find((v) => typeof v.value === 'number');
    const fmt = (n: number) => formatValue(n, firstNumeric?.format ?? 'count');
    const ref = single
      ? cellAt(range.r0, range.c0)?.formula ?? cellAt(range.r0, range.c0)?.id ?? address(range.r0, range.c0)
      : a1Range(address(range.r0, range.c0), address(range.r1, range.c1));
    return { ref, single, agg, fmt };
  })();

  const groupSpans: Array<{ key: string; label?: string; width: number }> = [];
  tracks.forEach((t, i) => {
    if (t.kind === 'divider') { groupSpans.push({ key: `d${i}`, width: DIVIDER_WIDTH }); return; }
    const prev = groupSpans[groupSpans.length - 1];
    if (prev && prev.label === t.col.group && prev.label !== undefined && !prev.key.startsWith('d')) prev.width += t.width;
    else groupSpans.push({ key: `g${i}`, label: t.col.group, width: t.width });
  });

  const toggle = (id: string) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const w = (px: number) => ({ width: px, flex: 'none' as const });
  const numCell = (content: ReactNode, h: number, key?: string) => (
    <div key={key} aria-hidden className="scalar-table__number" style={{ ...w(NUMBER_COLUMN_WIDTH), height: h }}>{content}</div>
  );

  return (
    <div ref={rootRef} className={cx('scalar-table-wrap', className)}>
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- focus lives in the grid's cells (roving tabindex), not on the grid element */}
      <div
        ref={(node) => { gridRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
        role="grid"
        aria-label={title}
        aria-multiselectable
        aria-rowcount={rowCount + headRowCount}
        aria-colcount={colCount + 1}
        className={cx('scalar-table', formulaMode && 'scalar-table--formula')}
        onKeyDown={onKeyDown}
        onCopy={onCopy}
        onMouseLeave={() => setHover(null)}
      >
        <div className="scalar-table__inner" style={{ width: totalWidth }}>
          {formulaMode && (
            <div role="presentation" aria-hidden className="scalar-table__row" style={{ height: ROW_HEIGHT }}>
              {numCell(null, ROW_HEIGHT)}
              <div className="scalar-table__letter scalar-table__sticky" style={{ ...w(titleWidth), left: numW }}>{columnLetter(0)}</div>
              {tracks.map((t, i) => t.kind === 'divider'
                ? <div key={`d${i}`} className="scalar-table__divider" style={w(DIVIDER_WIDTH)} />
                : <div key={t.col.id} className="scalar-table__letter" style={w(t.width)}>{columnLetter(t.index + 1)}</div>)}
            </div>
          )}

          {hasGroups && (
            <div role="row" className="scalar-table__row" style={{ height: HEADER_HEIGHT }}>
              {formulaMode && numCell(1, HEADER_HEIGHT)}
              <div role="presentation" className="scalar-table__sticky scalar-table__blank" style={{ ...w(titleWidth), left: numW }} />
              {groupSpans.map((g) => g.key.startsWith('d')
                ? <div key={g.key} className="scalar-table__divider" style={w(g.width)} />
                : g.label
                  ? <ColumnHeader key={g.key} tone="subtle" numeric={false} title={g.label} style={w(g.width)} className="scalar-table__head">{g.label}</ColumnHeader>
                  : <div key={g.key} role="presentation" className="scalar-table__blank" style={w(g.width)} />)}
            </div>
          )}

          <div role="row" className="scalar-table__row" style={{ height: HEADER_HEIGHT }}>
            {formulaMode && numCell(headRowCount, HEADER_HEIGHT)}
            <ColumnHeader
              tone="subtle"
              title={title}
              className="scalar-table__head scalar-table__sticky"
              style={{ ...w(titleWidth), left: numW }}
              actions={handle(TITLE_COLUMN_ID, title, titleWidth, originX)}
            >
              {title}
            </ColumnHeader>
            {tracks.map((t, i) => {
              if (t.kind === 'divider') return <div key={`d${i}`} className="scalar-table__divider" style={w(DIVIDER_WIDTH)} />;
              const { col, index, width } = t;
              const colSelected = selection.mode === 'column' && selection.col === index;
              const colActive = !!active && active[1] === index;
              return (
                <ColumnHeader
                  key={col.id}
                  tone="subtle"
                  numeric
                  title={col.header}
                  tooltip={col.tooltip}
                  icon={col.hasDropdown ? <ArrowDropDown /> : undefined}
                  selected={colSelected}
                  active={colActive && !colSelected}
                  aria-selected={colSelected || undefined}
                  className="scalar-table__head"
                  style={w(width)}
                  onMouseDown={(e) => { if (e.button === 0) { if (editing) commitEdit(false); select({ mode: 'column', col: index }); } }}
                  actions={col.resizable === false ? undefined : handle(col.id, col.header, width, originX + t.left + width, col.hasDropdown)}
                >
                  {col.header}
                </ColumnHeader>
              );
            })}
            {onAddColumn && (
              <ColumnHeader tone="subtle" kind="action-button" className="scalar-table__head" style={w(addW)}>
                <button type="button" className="scalar-table__add" onClick={onAddColumn}>
                  <Icon size="xs" tone="inherit"><Plus /></Icon>
                  {addColumnLabel}
                </button>
              </ColumnHeader>
            )}
          </div>

          {visibleRows.map(({ row, index }, r) => {
            const rowSelected = selection.mode === 'row' && selection.row === r;
            const rowActive = !!active && active[0] === r;
            const total = row.kind === 'total';
            const control = row.collapsible
              ? { icon: collapsed.has(row.id) ? <Plus /> : <Minus />, label: `${collapsed.has(row.id) ? 'Expand' : 'Collapse'} ${row.label}`, run: () => toggle(row.id) }
              : row.addable ? { icon: <Plus />, label: `Add to ${row.label}`, run: () => onAddRow?.(row.id) } : null;
            return (
              <div
                key={row.id}
                role="row"
                aria-rowindex={headRowCount + index + 1}
                className={cx('scalar-table__row', total && 'scalar-table__row--total')}
                style={{ height: ROW_HEIGHT }}
              >
                {formulaMode && numCell(headRowCount + index + 1, ROW_HEIGHT)}
                <RowHeader
                  type={total || row.level === 0 ? 'total' : 'readable'}
                  mark={rowActive && !rowSelected}
                  selected={rowSelected}
                  aria-selected={rowSelected || undefined}
                  aria-expanded={row.collapsible ? !collapsed.has(row.id) : undefined}
                  className="scalar-table__sticky scalar-table__title"
                  style={{ ...w(titleWidth), left: numW, paddingLeft: `calc(var(--space-xs) + var(--space-s) * ${row.level})` }}
                  onMouseDown={(e) => { if (e.button === 0 && !(e.target as HTMLElement).closest('button')) { if (editing) commitEdit(false); select({ mode: 'row', row: r }); } }}
                  {...iconProps(control)}
                >
                  {row.label}
                </RowHeader>
                {tracks.map((t, i) => {
                  if (t.kind === 'divider') return <div key={`d${i}`} className="scalar-table__divider" style={w(DIVIDER_WIDTH)} />;
                  const { col, index: c, width } = t;
                  const cell = cells[`${row.id}:${col.id}`];
                  const inSel = !!range && r >= range.r0 && r <= range.r1 && c >= range.c0 && c <= range.c1;
                  const isHover = !!hover && hover[0] === r && hover[1] === c;
                  const state = cell?.error ? 'error' : cellState({ selected: inSel, hover: isHover && !inSel });
                  const editingHere = !!editing && editing.r === r && editing.c === c && !!cell;
                  const text = cell ? formatValue(cell.value, cell.format) : '';
                  const isTabStop = r === tabStop[0] && c === tabStop[1];
                  const readonly = !cell || !isEditable(cell);
                  return (
                    <Cell
                      key={col.id}
                      role="gridcell"
                      aria-colindex={c + 2}
                      aria-selected={inSel}
                      aria-readonly={readonly || undefined}
                      aria-invalid={cell?.error ? true : undefined}
                      aria-describedby={cell?.footnote !== undefined && footnotes?.[cell.footnote] ? `${uid}-fn-${cell.footnote}` : undefined}
                      tabIndex={isTabStop ? 0 : -1}
                      data-r={r}
                      data-c={c}
                      numeric
                      type={cell?.kind === 'editable' ? 'input' : cell?.kind === 'sourced' ? 'data' : 'readable'}
                      state={state}
                      errorMessage={cell?.error}
                      icon={cell?.icon}
                      label={cell?.label ?? (cell?.ai ? 'AI' : undefined)}
                      tooltip={cell?.tooltip}
                      trailingIcon={cell?.options ? 'dropdown' : undefined}
                      footnote={cell?.footnote !== undefined ? <Footnote>{cell.footnote}</Footnote> : undefined}
                      className={cx(
                        'scalar-table__cell',
                        cell?.kind === 'total' && 'scalar-table__cell--total',
                        cell?.kind === 'draft' && 'scalar-table__cell--draft',
                        row.zebra && 'scalar-table__cell--zebra',
                      )}
                      style={w(width)}
                      onMouseDown={(e) => onCellMouseDown(e, r, c)}
                      onMouseEnter={() => onCellMouseEnter(r, c)}
                      onDoubleClick={() => startEdit(r, c)}
                    >
                      {editingHere ? editor(cell!, r, c) : text}
                      {!editingHere && cell && isEditable(cell) && <VisuallyHidden>, editable</VisuallyHidden>}
                    </Cell>
                  );
                })}
              </div>
            );
          })}

          {overlay && (
            <div
              aria-hidden
              className={cx('scalar-table__selection', selection.mode === 'column' && 'scalar-table__selection--column', selection.mode === 'row' && 'scalar-table__selection--row')}
              style={{ left: overlay.left, top: overlay.top, width: overlay.width, height: overlay.height, borderWidth: overlay.borderWidth }}
            />
          )}
          {guideX !== null && <div aria-hidden className="scalar-table__guide" style={{ left: guideX - 1 }} />}
        </div>
      </div>

      {fx && (
        <div className="scalar-table__fx" aria-label="Selection summary">
          <span className="scalar-table__fx-label">(fx)</span>
          <span className="scalar-table__fx-ref">{fx.ref}</span>
          {fx.agg && !(fx.single && fx.agg.count === 1) && (
            <>
              <span className="scalar-table__fx-chip">COUNT {fx.agg.count}</span>
              <span className="scalar-table__fx-chip">SUM {fx.fmt(fx.agg.sum)}</span>
              <span className="scalar-table__fx-chip">AVG {fx.fmt(fx.agg.avg)}</span>
              <span className="scalar-table__fx-chip">MIN {fx.fmt(fx.agg.min)}</span>
              <span className="scalar-table__fx-chip">MAX {fx.fmt(fx.agg.max)}</span>
            </>
          )}
        </div>
      )}

      <TablePagination state={paging} label={pagination?.label ?? `${title} pages`} rowsPerPageOptions={pagination?.rowsPerPageOptions} />

      {footnotes && (
        <VisuallyHidden>
          {Object.entries(footnotes).map(([n, text]) => <Fragment key={n}><span id={`${uid}-fn-${n}`}>{`Footnote ${n}: ${text}`}</span></Fragment>)}
        </VisuallyHidden>
      )}
    </div>
  );
});

