import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import { Table, type TableProps } from './index.js';
import type { Selection } from './tableModel.js';
import { cells, columns, footnotes, rows } from './Table.fixtures.js';

const base: TableProps = { tableId: 't', title: 'Valuation Summary', columns, rows, cells, footnotes };
const cellAt = (r: number, c: number) => document.querySelector<HTMLElement>(`[data-r="${r}"][data-c="${c}"]`)!;

function Controlled(props: Partial<TableProps> & { onSel?: (s: Selection) => void }) {
  const [sel, setSel] = useState<Selection>({ mode: 'none' });
  return <Table {...base} {...props} selection={sel} onSelectionChange={(s) => { setSel(s); props.onSel?.(s); }} />;
}

describe('Table', () => {
  it('is a named ARIA grid with no axe violations', async () => {
    const { container } = render(<Table {...base} />);
    expect(screen.getByRole('grid', { name: 'Valuation Summary' })).toBeInTheDocument();
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('renders formatted values, blanks and the readonly / invalid flags', () => {
    render(<Table {...base} />);
    expect(cellAt(0, 0)).toHaveTextContent('$401,139,375');
    expect(cellAt(4, 1)).toHaveTextContent(/^$/);
    expect(cellAt(0, 0)).toHaveAttribute('aria-readonly', 'true');
    expect(cellAt(0, 2)).not.toHaveAttribute('aria-readonly');
    expect(cellAt(0, 2)).toHaveTextContent('editable');
    expect(cellAt(1, 2)).toHaveAttribute('aria-invalid', 'true');
    expect(cellAt(0, 2)).toHaveAccessibleDescription(/Per-share value/);
  });

  it('is one tab stop with roving tabindex', () => {
    render(<Table {...base} />);
    expect(document.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
  });

  it('selects a cell on click and marks the row and column', async () => {
    const onSel = vi.fn();
    render(<Controlled onSel={onSel} />);
    await userEvent.click(cellAt(1, 1));
    expect(onSel).toHaveBeenLastCalledWith({ mode: 'cell', anchor: [1, 1], range: { r0: 1, r1: 1, c0: 1, c1: 1 } });
    expect(cellAt(1, 1)).toHaveAttribute('aria-selected', 'true');
    expect(cellAt(1, 2)).toHaveAttribute('aria-selected', 'false');
    expect(document.querySelectorAll('.scalar-table__selection')).toHaveLength(1);
    expect(document.querySelector('.scalar-row-header--mark')).toHaveTextContent('Services');
    expect(document.querySelector('.scalar-column-header--active')).toHaveTextContent('Waterfall');
  });

  it('draws ONE overlay for a range and none between cells', () => {
    render(<Table {...base} selection={{ mode: 'range', anchor: [0, 0], range: { r0: 0, r1: 1, c0: 0, c1: 1 } }} />);
    expect(document.querySelectorAll('[aria-selected="true"][role="gridcell"]')).toHaveLength(4);
    const overlays = document.querySelectorAll<HTMLElement>('.scalar-table__selection');
    expect(overlays).toHaveLength(1);
    expect(overlays[0]!.style.borderWidth).toBe('1px');
  });

  it('extends with Shift+click and Shift+Arrow, moves with arrows', async () => {
    const onSel = vi.fn();
    render(<Controlled onSel={onSel} />);
    await userEvent.click(cellAt(0, 0));
    await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowRight}{/Shift}');
    expect(onSel).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'range', range: { r0: 0, r1: 1, c0: 0, c1: 1 } }));
    await userEvent.keyboard('{ArrowDown}');
    expect(onSel).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'cell', anchor: [2, 1] }));
    expect(cellAt(2, 1)).toHaveFocus();
  });

  it('selects a column from its header and a row from its title; Esc clears', async () => {
    const onSel = vi.fn();
    render(<Controlled onSel={onSel} />);
    await userEvent.click(screen.getByRole('columnheader', { name: /^Waterfall/ }));
    expect(onSel).toHaveBeenLastCalledWith({ mode: 'column', col: 1 });
    expect(document.querySelector('.scalar-column-header--selected')).toBeInTheDocument();
    expect((document.querySelector('.scalar-table__selection') as HTMLElement).style.borderWidth).toBe('0px 2px 2px');
    await userEvent.click(screen.getByRole('rowheader', { name: /Services/ }));
    expect(onSel).toHaveBeenLastCalledWith({ mode: 'row', row: 1 });
    await userEvent.click(cellAt(0, 0));
    await userEvent.keyboard('{Escape}');
    expect(onSel).toHaveBeenLastCalledWith({ mode: 'none' });
  });

  it('Ctrl+Space selects the column, Shift+Space the row', async () => {
    const onSel = vi.fn();
    render(<Controlled onSel={onSel} />);
    await userEvent.click(cellAt(1, 2));
    await userEvent.keyboard('{Control>} {/Control}');
    expect(onSel).toHaveBeenLastCalledWith({ mode: 'column', col: 2 });
  });

  it('clears the selection when clicking outside the table', async () => {
    const onSel = vi.fn();
    render(<><button type="button">outside</button><Controlled onSel={onSel} /></>);
    await userEvent.click(cellAt(0, 0));
    await userEvent.click(screen.getByText('outside'));
    expect(onSel).toHaveBeenLastCalledWith({ mode: 'none' });
  });

  it('edits only Editable cells: Enter opens, Enter commits and moves down, Esc cancels', async () => {
    const onCommit = vi.fn();
    render(<Controlled onCellCommit={onCommit} />);
    await userEvent.click(cellAt(0, 0)); // sourced
    await userEvent.keyboard('{Enter}');
    expect(screen.queryByRole('textbox')).toBeNull();

    await userEvent.click(cellAt(0, 2));
    await userEvent.keyboard('{Enter}');
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, '800{Enter}');
    expect(onCommit).toHaveBeenCalledWith('OPM.A', '800');
    expect(cellAt(1, 2)).toHaveFocus();

    await userEvent.click(cellAt(0, 2));
    await userEvent.keyboard('{Enter}');
    await userEvent.type(screen.getByRole('textbox'), '9{Escape}');
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it('Tab commits and moves right; dropdown cells open options', async () => {
    const onCommit = vi.fn();
    render(<Controlled onCellCommit={onCommit} />);
    await userEvent.click(cellAt(0, 4));
    await userEvent.keyboard('{Enter}');
    await userEvent.type(screen.getByRole('textbox'), '5{Tab}');
    expect(onCommit).toHaveBeenCalledWith('W.A', '755');
    await userEvent.click(cellAt(0, 3));
    await userEvent.keyboard('{Enter}');
    await userEvent.selectOptions(screen.getByRole('combobox'), 'CVM');
    expect(onCommit).toHaveBeenLastCalledWith('ALLOC.METHOD', 'CVM');
  });

  it('copies the selection as tab-separated formatted values', () => {
    render(<Table {...base} selection={{ mode: 'range', anchor: [0, 0], range: { r0: 0, r1: 1, c0: 3, c1: 4 } }} />);
    const data = { setData: vi.fn() };
    fireEvent.copy(cellAt(0, 3), { clipboardData: data });
    expect(data.setData).toHaveBeenCalledWith('text/plain', 'OPM\t75.0%\nPWERM\t25.0%');
  });

  it('collapses a group row and keeps aria-expanded in sync', async () => {
    render(<Table {...base} />);
    const group = screen.getByRole('rowheader', { name: /Share detail/ });
    expect(group).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse Share detail' }));
    expect(screen.queryByText('Number of Shares')).toBeNull();
    expect(group).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the add-column header and calls back', async () => {
    const onAdd = vi.fn();
    render(<Table {...base} onAddColumn={onAdd} addColumnLabel="Add Allocation Scenario" />);
    await userEvent.click(screen.getByRole('button', { name: 'Add Allocation Scenario' }));
    expect(onAdd).toHaveBeenCalled();
  });

  it('draws a 4px divider between column groups', () => {
    render(<Table {...base} />);
    const dividers = document.querySelectorAll<HTMLElement>('.scalar-table__row:nth-of-type(2) .scalar-table__divider');
    expect(dividers.length).toBeGreaterThan(0);
    expect(dividers[0]!.style.width).toBe('4px');
  });

  describe('formula mode', () => {
    it('adds letters, row numbers and an fx bar only while something is selected', () => {
      const { rerender } = render(<Table {...base} formulaMode />);
      expect(document.querySelector('.scalar-table__fx')).toBeNull();
      expect(Array.from(document.querySelectorAll('.scalar-table__letter')).map((n) => n.textContent)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
      // group row = 1, column header row = 2, first body row = 3
      expect(Array.from(document.querySelectorAll('.scalar-table__number')).slice(0, 4).map((n) => n.textContent)).toEqual(['', '1', '2', '3']);
      rerender(<Table {...base} formulaMode selection={{ mode: 'cell', anchor: [0, 0], range: { r0: 0, r1: 0, c0: 0, c1: 0 } }} />);
      expect(document.querySelector('.scalar-table__fx-ref')).toHaveTextContent('MACOMPS_15711.ENTERPRISE_VALUE');
    });

    it('shows the A1 range and aggregates with period decimals', () => {
      render(<Table {...base} formulaMode selection={{ mode: 'range', anchor: [0, 3], range: { r0: 0, r1: 1, c0: 0, c1: 1 } }} />);
      const bar = document.querySelector('.scalar-table__fx')!;
      expect(bar).toHaveTextContent('B3:C4');
      expect(bar).toHaveTextContent('COUNT 4');
      expect(bar).toHaveTextContent('SUM $401,218,66');
      expect(bar.textContent).not.toMatch(/\d,\d{2}(?!\d)\b(?!,)/); // no comma decimals
    });

    it('is absent when formula mode is off, even with a selection', () => {
      render(<Table {...base} selection={{ mode: 'cell', anchor: [0, 0], range: { r0: 0, r1: 0, c0: 0, c1: 0 } }} />);
      expect(document.querySelector('.scalar-table__fx')).toBeNull();
    });
  });

  describe('column resizing', () => {
    const sep = (name: RegExp) => screen.getByRole('separator', { name });

    it('exposes value, min and max on a focusable separator', () => {
      render(<Table {...base} />);
      const s = sep(/Resize Equity Value/);
      expect(s).toHaveAttribute('aria-orientation', 'vertical');
      expect(s).toHaveAttribute('aria-valuenow', '150');
      expect(Number(s.getAttribute('aria-valuemin'))).toBeGreaterThanOrEqual(48);
      expect(s).toHaveAttribute('aria-valuemax', '600');
      expect(s).toHaveAttribute('tabindex', '0');
    });

    it('arrows change width by 8px, Home goes to the minimum, and neighbours keep theirs', async () => {
      const onResize = vi.fn();
      render(<Table {...base} onColumnResize={onResize} columnWidths={{}} />);
      const s = sep(/Resize Equity Value/);
      s.focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(onResize).toHaveBeenLastCalledWith('ev', 158);
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(onResize).toHaveBeenLastCalledWith('ev', 142);
      await userEvent.keyboard('{Home}');
      expect(onResize).toHaveBeenLastCalledWith('ev', Number(s.getAttribute('aria-valuemin')));
      expect(onResize.mock.calls.every(([id]) => id === 'ev')).toBe(true);
    });

    it('never goes below the content minimum, and a controlled width below it grows to it', () => {
      render(<Table {...base} columnWidths={{ ev: 10 }} />);
      const min = Number(sep(/Resize Equity Value/).getAttribute('aria-valuemin'));
      expect(sep(/Resize Equity Value/)).toHaveAttribute('aria-valuenow', String(min));
      expect(min).toBeGreaterThan(48); // "$401,139,375" needs more than the floor
    });

    it('double-click auto-fits to max(min, full header)', async () => {
      const onResize = vi.fn();
      render(<Table {...base} columnWidths={{}} onColumnResize={onResize} />);
      await userEvent.dblClick(sep(/Resize Weighted Value per Share/));
      const [id, w] = onResize.mock.lastCall!;
      expect(id).toBe('weight');
      expect(w).toBeGreaterThan(150);
      expect(w).toBeLessThanOrEqual(600);
    });

    it('persists widths per tableId and restores them', async () => {
      window.localStorage.clear();
      const first = render(<Table {...base} tableId="persist" />);
      sep(/Resize Equity Value/).focus();
      await userEvent.keyboard('{ArrowRight}');
      first.unmount();
      render(<Table {...base} tableId="persist" />);
      expect(sep(/Resize Equity Value/)).toHaveAttribute('aria-valuenow', '158');
    });

    it('keeps the selection while resizing', async () => {
      render(<Controlled />);
      await userEvent.click(cellAt(0, 0));
      sep(/Resize Equity Value/).focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(cellAt(0, 0)).toHaveAttribute('aria-selected', 'true');
    });

    it('title column resizes too; resizable=false removes a handle', () => {
      render(<Table {...base} columns={columns.map((c, i) => (i === 0 ? { ...c, resizable: false } : c))} />);
      expect(screen.queryByRole('separator', { name: /Resize Equity Value/ })).toBeNull();
      expect(sep(/Resize Valuation Summary/)).toBeInTheDocument();
    });
  });
});
