import { describe, expect, it } from 'vitest';
import {
  a1, a1Range, aggregate, cellMinWidth, cellSelection, cellState, clampWidth, columnLetter, columnMinWidth, effectiveWidth, focusOf, formatValue,
  rangeSelection, selectionBorder, selectionRange, titleMinWidth, type MeasureText, type TableCellData, type TableColumnDef, type TableRowDef,
} from './tableModel.js';

// 7px per character keeps widths exact and independent of any canvas.
const m: MeasureText = (t) => t.length * 7;

const cell = (value: number | string | null, extra: Partial<TableCellData> = {}): TableCellData => ({ id: 'X', kind: 'readable', value, format: 'currency', ...extra });

describe('selectionBorder', () => {
  const sel = { r0: 1, r1: 2, c0: 1, c1: 2 };
  it('is null outside the range', () => expect(selectionBorder(0, 1, sel, 1)).toBeNull());
  it('draws only the outer edges', () => {
    expect(selectionBorder(1, 1, sel, 1)).toEqual({ top: 1, left: 1, bottom: 0, right: 0 });
    expect(selectionBorder(2, 2, sel, 1)).toEqual({ top: 0, left: 0, bottom: 1, right: 1 });
  });
  it('a single cell has all four sides', () => expect(selectionBorder(3, 3, { r0: 3, r1: 3, c0: 3, c1: 3 }, 2)).toEqual({ top: 2, bottom: 2, left: 2, right: 2 }));
});

describe('selection helpers', () => {
  it('a drag back onto the anchor collapses to a cell', () => expect(rangeSelection([1, 1], [1, 1]).mode).toBe('cell'));
  it('normalises a range dragged up and left, and keeps the moving end', () => {
    const s = rangeSelection([3, 3], [1, 2]);
    expect(s).toMatchObject({ mode: 'range', range: { r0: 1, r1: 3, c0: 2, c1: 3 } });
    expect(focusOf(s)).toEqual([1, 2]);
  });
  it('a column or row selection covers the whole table', () => {
    expect(selectionRange({ mode: 'column', col: 2 }, 5, 4)).toEqual({ r0: 0, r1: 4, c0: 2, c1: 2 });
    expect(selectionRange({ mode: 'row', row: 1 }, 5, 4)).toEqual({ r0: 1, r1: 1, c0: 0, c1: 3 });
    expect(selectionRange({ mode: 'none' }, 5, 4)).toBeNull();
    expect(cellSelection([0, 0]).mode).toBe('cell');
  });
  it('fill precedence: selected beats hover', () => {
    expect(cellState({ selected: true, hover: true })).toBe('selected');
    expect(cellState({ selected: false, pressed: true, hover: true })).toBe('pressed');
    expect(cellState({ selected: false, hover: true })).toBe('hover');
    expect(cellState({ selected: false, hover: false })).toBe('default');
  });
});

describe('A1', () => {
  it('letters', () => expect([0, 1, 25, 26, 27, 701, 702].map(columnLetter)).toEqual(['A', 'B', 'Z', 'AA', 'AB', 'ZZ', 'AAA']));
  it('addresses', () => {
    expect(a1(3, 12)).toBe('D12');
    expect(a1Range('D11', 'E12')).toBe('D11:E12');
    expect(a1Range('D11', 'D11')).toBe('D11');
  });
});

describe('formatValue', () => {
  it.each([
    [56938, 'currency', '$56,938'],
    [773.55, 'perShare', '$773.55'],
    [75, 'percent', '75.0%'],
    [4.38, 'rate', '4.38%'],
    [4, 'multiple', '4.00x'],
    [40, 'count', '40.00'],
    [-1200, 'currency', '-$1,200'],
    [2026, 'text', '2026'],
  ] as const)('%s as %s → %s', (v, f, out) => expect(formatValue(v, f)).toBe(out));
  it('renders empty cells blank, never 0 or a dash', () => {
    expect(formatValue(null, 'currency')).toBe('');
    expect(formatValue('', 'count')).toBe('');
    expect(formatValue(undefined, 'rate')).toBe('');
  });
  it('passes text through', () => expect(formatValue('Pending', 'currency')).toBe('Pending'));
});

describe('aggregate', () => {
  it('ignores blanks and text', () => expect(aggregate([10, null, 'x', 30, ''])).toEqual({ count: 2, sum: 40, avg: 20, min: 10, max: 30 }));
  it('is null with no numbers', () => expect(aggregate([null, 'a'])).toBeNull());
});

describe('column minimum width', () => {
  const col: TableColumnDef = { id: 'v', header: 'A very long header label that must never set the width' };
  const rows: TableRowDef[] = [
    { id: 'a', label: 'Revenue', level: 0, kind: 'default' },
    { id: 'b', label: 'Total', level: 1, kind: 'total' },
    { id: 'c', label: 'Hidden child', level: 1, kind: 'default' },
  ];
  it('is the widest formatted value over ALL rows plus 4px padding', () => {
    const cells = { 'a:v': cell(1), 'b:v': cell(1234567), 'c:v': cell(9) };
    // "$1,234,567" = 10 chars → 70 + 4
    expect(columnMinWidth(col, rows, cells, m)).toBe(74);
  });
  it('counts slots plus their 2px gap', () => {
    expect(cellMinWidth(cell(5, { footnote: 1, label: 'x', icon: null, options: ['a'] }), m)).toBe(2 * 7 + 4 + (12 + 2) + (30 + 2) + (16 + 2));
  });
  it('is not set by the header label, and floors at 48px', () => {
    expect(columnMinWidth(col, rows, {}, m)).toBe(48);
  });
  it('title minimum is its longest label with indent, padding and control', () => {
    const r: TableRowDef[] = [
      { id: 'a', label: 'Group', level: 0, kind: 'default', collapsible: true },
      { id: 'b', label: 'A much longer child row label', level: 1, kind: 'default' },
    ];
    expect(titleMinWidth(r, m)).toBe(Math.max(5 * 7 + 8 + 20, 29 * 7 + 8 + 8));
  });
  it('clamps drag to [min, max] and keeps a larger user width', () => {
    expect(clampWidth(10, 74)).toBe(74);
    expect(clampWidth(900, 74)).toBe(600);
    expect(effectiveWidth(50, 150, 74)).toBe(74); // data changed: grows to the new minimum
    expect(effectiveWidth(300, 150, 74)).toBe(300);
    expect(effectiveWidth(undefined, 150, 74)).toBe(150);
  });
});
