/**
 * Table model — the pure logic behind `Table`: types, selection geometry,
 * column minimum widths, A1 addresses, value formatting and aggregates.
 *
 * Nothing here touches React or the DOM, so every rule in the Prism Table spec
 * is unit-testable on its own.
 */
import type { ReactNode } from 'react';

/* ------------------------------------------------------------------ types */

/** What the value is. Drives text colour only — never state. */
export type TableCellKind = 'readable' | 'editable' | 'sourced' | 'total' | 'draft';
/** What the user is doing to the cell. Derived from selection + hover, never stored per cell. */
export type TableCellState = 'default' | 'hover' | 'pressed' | 'selected';
export type ValueFormat = 'currency' | 'perShare' | 'percent' | 'rate' | 'multiple' | 'count' | 'text';

export interface TableCellSlots {
  /** Leading icon. Wrap the glyph in `Icon`. */
  icon?: ReactNode;
  /** Badge after the value. */
  label?: string;
  /** Value suggested by AI. */
  ai?: boolean;
  /** Note shown on hover and focus; draws the corner triangle. */
  tooltip?: string;
  /** Footnote number. */
  footnote?: number;
  /** Fixed options: the cell edits as a dropdown instead of a text input. */
  options?: string[];
}

export interface TableCellData extends TableCellSlots {
  /** Data key shown in the fx bar, e.g. `MACOMPS_15711.ENTERPRISE_VALUE`. */
  id: string;
  kind: TableCellKind;
  /** Number, string, or `null` for an empty cell. `percent` / `rate` values are percentage points: `75` renders `75.0%`. */
  value: number | string | null;
  format: ValueFormat;
  /** Present → error fill and `aria-invalid`. The message is read out. */
  error?: string;
  formula?: string;
}

export interface TableRowDef {
  id: string;
  label: string;
  /** 0 = group / total label, 1 = indented child. */
  level: 0 | 1;
  kind: 'default' | 'total';
  zebra?: boolean;
  /** Group row that collapses its children. */
  collapsible?: boolean;
  /** Shows a `+` control. Calls `onAddRow`. */
  addable?: boolean;
}

export interface TableColumnDef {
  id: string;
  header: string;
  /** Initial width in px, clamped to the computed minimum. */
  width?: number;
  /** Default true. */
  resizable?: boolean;
  /** Default 600. */
  maxWidth?: number;
  /** Column group label. A 4px divider is drawn between groups. */
  group?: string;
  hasDropdown?: boolean;
  tooltip?: string;
}

export type Range = { r0: number; r1: number; c0: number; c1: number };

export type Selection =
  | { mode: 'none' }
  | { mode: 'cell' | 'range'; anchor: [number, number]; range: Range }
  | { mode: 'column'; col: number }
  | { mode: 'row'; row: number };

export const NO_SELECTION: Selection = { mode: 'none' };

/* ---------------------------------------------------------------- metrics */

export const ROW_HEIGHT = 26;
export const HEADER_HEIGHT = 40;
export const DIVIDER_WIDTH = 4;
export const NUMBER_COLUMN_WIDTH = 28;
export const DEFAULT_TITLE_WIDTH = 217;
export const DEFAULT_COLUMN_WIDTH = 150;
export const WIDTH_FLOOR = 48;
export const WIDTH_CEIL = 600;
export const RESIZE_STEP = 8;

/** Reserved column id of the sticky title column in `columnWidths` and `onColumnResize`. */
export const TITLE_COLUMN_ID = '__title';

/* -------------------------------------------------------------- selection */

export interface BorderSides { top: number; bottom: number; left: number; right: number }

/** Per-side stroke weight of one cell inside a selection rectangle; `null` when outside it. */
export function selectionBorder(row: number, col: number, sel: Range, w: number): BorderSides | null {
  const inside = row >= sel.r0 && row <= sel.r1 && col >= sel.c0 && col <= sel.c1;
  if (!inside) return null;
  return {
    top: row === sel.r0 ? w : 0,
    bottom: row === sel.r1 ? w : 0,
    left: col === sel.c0 ? w : 0,
    right: col === sel.c1 ? w : 0,
  };
}

export function normalizeRange(a: [number, number], b: [number, number]): Range {
  return { r0: Math.min(a[0], b[0]), r1: Math.max(a[0], b[0]), c0: Math.min(a[1], b[1]), c1: Math.max(a[1], b[1]) };
}

export function cellSelection(at: [number, number]): Selection {
  return { mode: 'cell', anchor: at, range: normalizeRange(at, at) };
}

export function rangeSelection(anchor: [number, number], focus: [number, number]): Selection {
  const range = normalizeRange(anchor, focus);
  const single = range.r0 === range.r1 && range.c0 === range.c1;
  return { mode: single ? 'cell' : 'range', anchor, range };
}

/** The cell rectangle a selection covers, or `null`. */
export function selectionRange(sel: Selection, rowCount: number, colCount: number): Range | null {
  switch (sel.mode) {
    case 'none': return null;
    case 'cell':
    case 'range': return sel.range;
    case 'column': return { r0: 0, r1: rowCount - 1, c0: sel.col, c1: sel.col };
    case 'row': return { r0: sel.row, r1: sel.row, c0: 0, c1: colCount - 1 };
  }
}

/** The moving end of a cell / range selection — where the keyboard continues from. */
export function focusOf(sel: Selection): [number, number] | null {
  if (sel.mode === 'cell') return sel.anchor;
  if (sel.mode === 'range') {
    const { anchor, range } = sel;
    return [anchor[0] === range.r0 ? range.r1 : range.r0, anchor[1] === range.c0 ? range.c1 : range.c0];
  }
  return null;
}

/**
 * Fill precedence for one cell: error > selected > pressed > hover > zebra > default.
 * `zebra` is not a state of its own here — the caller paints it when this returns `default`.
 */
export function cellState(args: { selected: boolean; pressed?: boolean; hover: boolean }): TableCellState {
  if (args.selected) return 'selected';
  if (args.pressed) return 'pressed';
  if (args.hover) return 'hover';
  return 'default';
}

/* ------------------------------------------------------------------ A1 */

/** 0 → A, 25 → Z, 26 → AA. */
export function columnLetter(index: number): string {
  let n = index;
  let out = '';
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

export function a1(letterIndex: number, rowNumber: number): string {
  return `${columnLetter(letterIndex)}${rowNumber}`;
}

export function a1Range(from: string, to: string): string {
  return from === to ? from : `${from}:${to}`;
}

/* ----------------------------------------------------------- formatting */

const nf = (min: number, max = min) => new Intl.NumberFormat('en-US', { minimumFractionDigits: min, maximumFractionDigits: max });
const F0 = nf(0);
const F1 = nf(1);
const F2 = nf(2);

/**
 * Display text of a value. Empty cells render blank — never `0` or a dash.
 * Strings pass through untouched (`"Draft"`, `"Pending"`), and a negative currency keeps its sign before the `$`.
 */
export function formatValue(value: number | string | null | undefined, format: ValueFormat): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') return value;
  if (!Number.isFinite(value)) return '';
  const neg = value < 0;
  const abs = Math.abs(value);
  let body: string;
  switch (format) {
    case 'currency': body = `$${F0.format(abs)}`; break;
    case 'perShare': body = `$${F2.format(abs)}`; break;
    case 'percent': body = `${F1.format(abs)}%`; break;
    case 'rate': body = `${F2.format(abs)}%`; break;
    case 'multiple': body = `${F2.format(abs)}x`; break;
    case 'count': body = F2.format(abs); break;
    case 'text': body = String(abs); break;
  }
  return neg ? `-${body}` : body;
}

/* ----------------------------------------------------------- aggregates */

export interface Aggregates { count: number; sum: number; avg: number; min: number; max: number }

/** COUNT / SUM / AVG / MIN / MAX over the numeric values; blanks and text are ignored. `null` when there are none. */
export function aggregate(values: Array<number | string | null | undefined>): Aggregates | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return { count: nums.length, sum, avg: sum / nums.length, min: Math.min(...nums), max: Math.max(...nums) };
}

/* ------------------------------------------------------------ min width */

/** Measures a string in px. Injected so tests don't need a canvas. */
export type MeasureText = (text: string, font: { size: number; weight: number }) => number;

let canvasCtx: CanvasRenderingContext2D | null | undefined;
/** Canvas measurement with a character-width estimate where there is no canvas (SSR, jsdom). */
export const measureText: MeasureText = (text, { size, weight }) => {
  if (canvasCtx === undefined) {
    try {
      canvasCtx = typeof document !== 'undefined' && !/jsdom/i.test(navigator.userAgent) ? document.createElement('canvas').getContext('2d') : null;
    } catch {
      canvasCtx = null;
    }
  }
  if (canvasCtx) {
    canvasCtx.font = `${weight} ${size}px Inter, sans-serif`;
    const w = canvasCtx.measureText(text).width;
    if (w > 0) return w;
  }
  return text.length * size * (weight >= 600 ? 0.6 : 0.56);
};

export const VALUE_FONT = { size: 12, weight: 300 } as const;
export const HEADER_FONT = { size: 12, weight: 600 } as const;
export const TITLE_FONT = { size: 12, weight: 400 } as const;
export const TITLE_FONT_TOTAL = { size: 12, weight: 600 } as const;

const SLOT_GAP = 2;
const CELL_PADDING = 4; // 2 + 2

/** Width of one cell's content at its minimum: the whole formatted value, never truncated. */
export function cellMinWidth(cell: TableCellData | undefined, measure: MeasureText = measureText): number {
  if (!cell) return 0;
  const text = formatValue(cell.value, cell.format);
  const slots = [cell.icon ? 12 : 0, cell.label ? 30 : 0, cell.footnote !== undefined ? 12 : 0, cell.options ? 16 : 0].filter(Boolean);
  const slotWidth = slots.reduce((a, b) => a + b + SLOT_GAP, 0);
  return measure(text, VALUE_FONT) + CELL_PADDING + slotWidth;
}

/** Full width of a header label on one line, including its dropdown. Used by auto-fit, never by the minimum. */
export function headerFullWidth(col: TableColumnDef, measure: MeasureText = measureText): number {
  return Math.ceil(measure(col.header, HEADER_FONT) + 16 + (col.hasDropdown ? 20 : 0));
}

/**
 * Minimum width of a data column: the widest formatted value over ALL rows —
 * totals, collapsed rows, every page — plus padding and slots, floored at 48px.
 * Header labels do not set it; they truncate with a tooltip.
 */
export function columnMinWidth(
  col: TableColumnDef,
  rows: TableRowDef[],
  cells: Record<string, TableCellData>,
  measure: MeasureText = measureText,
): number {
  let max = WIDTH_FLOOR;
  for (const row of rows) max = Math.max(max, cellMinWidth(cells[`${row.id}:${col.id}`], measure));
  return Math.ceil(max);
}

/** Minimum of the title column: its longest label. Row titles never truncate. */
export function titleMinWidth(rows: TableRowDef[], measure: MeasureText = measureText): number {
  let max = WIDTH_FLOOR;
  for (const row of rows) {
    const font = row.kind === 'total' || row.level === 0 ? TITLE_FONT_TOTAL : TITLE_FONT;
    const w = measure(row.label, font) + 8 * row.level + 8 + (row.collapsible || row.addable ? 20 : 0);
    max = Math.max(max, w);
  }
  return Math.ceil(max);
}

export function clampWidth(width: number, min: number, max = WIDTH_CEIL): number {
  return Math.round(Math.min(Math.max(width, min), Math.max(min, max)));
}

/**
 * The width a column renders at: the user's width (or the column default),
 * grown to the current minimum and capped at its maximum. A larger user width is kept.
 */
export function effectiveWidth(requested: number | undefined, fallback: number, min: number, max = WIDTH_CEIL): number {
  return clampWidth(requested ?? fallback, min, max);
}

/* ------------------------------------------------------------- clipboard */

export function toTsv(grid: string[][]): string {
  return grid.map((row) => row.join('\t')).join('\n');
}

/**
 * Where each page of a Table starts, for `rowsPerPage` rows a page. A group —
 * a top-level row, the child rows under it and the total row that closes it —
 * never splits across pages: a page closes early rather than strand rows from
 * their group, and a group larger than a page gets a page of its own.
 */
export function pageStarts(rows: TableRowDef[], rowsPerPage: number): number[] {
  const opensGroup = (row: TableRowDef) => row.level === 0 && row.kind !== 'total';
  const starts: number[] = [];
  let size = 0;
  let i = 0;
  while (i < rows.length) {
    let end = i + 1;
    while (end < rows.length && !opensGroup(rows[end]!)) end++;
    const block = end - i;
    if (starts.length === 0 || size + block > rowsPerPage) { starts.push(i); size = 0; }
    size += block;
    i = end;
  }
  return starts.length ? starts : [0];
}
