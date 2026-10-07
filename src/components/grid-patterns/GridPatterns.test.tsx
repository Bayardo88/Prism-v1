import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import { ColumnHeader, DataGrid, Row } from '../table/index.js';
import {
  AddColumnHeader, CellHistoryPopover, ChartHoverCard, CollapsedColumnRail, ColumnGroupHeader, GridColumnDivider,
  GridColumnHeader, GridValueCell, InCellControl, RowLabelCell, TaskPill,
} from './index.js';

async function expectNoViolations(container: Element) {
  expect((await checkA11y(container)).violations).toEqual([]);
}

describe('grid pattern table', () => {
  it('has no axe violations and the right roles', async () => {
    const { container } = render(
      <DataGrid
        label="Financials"
        groupHead={<ColumnGroupHeader span={2}>Projections</ColumnGroupHeader>}
        head={
          <>
            <GridColumnHeader sort="ascending" onSort={() => undefined} onFilter={() => undefined} draggable onMove={() => undefined}>Revenue</GridColumnHeader>
            <GridColumnHeader numeric>Margin</GridColumnHeader>
            <AddColumnHeader onClick={() => undefined} />
          </>
        }
      >
        <Row>
          <RowLabelCell expanded={false} onToggle={() => undefined}>Apple</RowLabelCell>
          <GridValueCell kind="editable" state="error" errorMessage="Required" onClick={() => undefined}>10</GridValueCell>
          <InCellControl type="select" label="Security type">Common</InCellControl>
          <GridColumnDivider />
        </Row>
      </DataGrid>,
    );
    expect(screen.getByRole('table', { name: 'Financials' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Revenue/ })).toHaveAttribute('aria-sort', 'ascending');
    await expectNoViolations(container);
  });
});

describe('RowLabelCell', () => {
  it('names the toggle after its row and toggles from the keyboard', async () => {
    const onToggle = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(<RowLabelCell ref={ref} className="x" data-testid="t" expanded={false} onToggle={onToggle}>Apple Inc.</RowLabelCell>);
    const btn = screen.getByRole('button', { name: 'Expand Apple Inc.' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(ref.current).toBe(screen.getByTestId('t'));
    expect(ref.current).toHaveClass('x');
  });

  it('is static without expanded', () => {
    render(<RowLabelCell>Total</RowLabelCell>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('GridValueCell', () => {
  it('is static text without onClick', () => {
    const ref = createRef<HTMLDivElement>();
    render(<GridValueCell ref={ref} className="x" data-testid="v">5</GridValueCell>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(ref.current).toBe(screen.getByTestId('v'));
    expect(ref.current).toHaveAttribute('role', 'cell');
  });

  it('activates from the keyboard through a native button', async () => {
    const onClick = vi.fn();
    render(<GridValueCell onClick={onClick}>5</GridValueCell>);
    screen.getByRole('button', { name: '5' }).focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('exposes error text, placeholder text and not-applicable', () => {
    const { rerender } = render(<GridValueCell state="error" errorMessage="Required" data-testid="v">5</GridValueCell>);
    expect(screen.getByTestId('v')).toHaveAccessibleDescription('Required');
    rerender(<GridValueCell state="placeholder" placeholderText="Skriv" data-testid="v" />);
    expect(screen.getByTestId('v')).toHaveTextContent('Skriv');
    rerender(<GridValueCell state="not-applicable" onClick={() => undefined} data-testid="v" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByTestId('v')).toHaveTextContent('Not applicable');
  });
});

describe('InCellControl', () => {
  it('keeps button semantics, names itself with label + value, and reports expansion', async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(<InCellControl ref={ref} className="x" data-testid="i" type="select" label="Security type" open={false} onClick={onClick}>Common</InCellControl>);
    const btn = screen.getByRole('button', { name: 'Security type Common' });
    expect(btn).toBe(ref.current);
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).toHaveClass('x');
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('cell')).toBeInTheDocument();
  });

  it('omits aria-expanded when no popup is wired', () => {
    render(<InCellControl type="date" label="Date">1/1</InCellControl>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-expanded');
  });
});

describe('headers', () => {
  it('GridColumnHeader: sort button, filter button named by label, aria-current for selected', async () => {
    const onSort = vi.fn();
    const onFilter = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(<GridColumnHeader ref={ref} className="x" data-testid="h" onSort={onSort} onFilter={onFilter} selected label="Revenue">{<em>Rev</em>}</GridColumnHeader>);
    expect(ref.current).toHaveAttribute('aria-current', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Filter Revenue' }));
    expect(onFilter).toHaveBeenCalled();
    expect(onSort).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Rev' }));
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('GridColumnHeader: keyboard alternative to drag reorder', async () => {
    const onMove = vi.fn();
    render(<GridColumnHeader draggable onMove={onMove}>Revenue</GridColumnHeader>);
    const handle = screen.getByRole('button', { name: 'Move Revenue' });
    handle.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowLeft}{ArrowDown}');
    expect(onMove.mock.calls).toEqual([['right'], ['left']]);
  });

  it('GridColumnHeader: the bare drag handle is decorative and there is no resize edge', () => {
    const { container } = render(<GridColumnHeader draggable>Revenue</GridColumnHeader>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('.scalar-grid-header__resize')).toBeNull();
  });

  it('ColumnGroupHeader, AddColumnHeader forward refs and props', async () => {
    const g = createRef<HTMLDivElement>();
    const a = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    render(
      <>
        <ColumnGroupHeader ref={g} span={3} className="x" data-testid="g">Proj</ColumnGroupHeader>
        <AddColumnHeader ref={a} onClick={onClick} className="y" data-testid="a" controls="dlg" selected />
      </>,
    );
    expect(g.current).toHaveAttribute('aria-colspan', '3');
    expect(a.current).toHaveClass('y');
    const btn = screen.getByRole('button', { name: 'Add column' });
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    expect(btn).toHaveAttribute('aria-controls', 'dlg');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it('CollapsedColumnRail: visible text is in the name; pluralises', async () => {
    const onExpand = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(<CollapsedColumnRail ref={ref} count={8} onExpand={onExpand} className="x" data-testid="r" />);
    const btn = screen.getByRole('button', { name: /^\+ 8 columns/ });
    expect(btn).toBe(ref.current);
    await userEvent.click(btn);
    expect(onExpand).toHaveBeenCalled();
    rerender(<CollapsedColumnRail count={1} onExpand={onExpand} />);
    expect(screen.getByRole('button', { name: /^\+ 1 column,/ })).toBeInTheDocument();
  });

  it('GridColumnDivider is hidden from assistive tech', () => {
    const ref = createRef<HTMLDivElement>();
    render(<GridColumnDivider ref={ref} className="x" data-testid="d" />);
    expect(ref.current).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('separator')).toBeNull();
  });
});

describe('ChartHoverCard and TaskPill', () => {
  it('ChartHoverCard forwards ref/rest and keys rows by label', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ChartHoverCard ref={ref} id="tip" className="x" data-testid="c" heading="Dec 31" rows={[{ label: 'A', value: '1', swatch: 'red' }, { label: 'B', value: '2', swatch: 'blue' }]} />);
    expect(ref.current).toBe(screen.getByRole('tooltip'));
    expect(ref.current).toHaveAttribute('id', 'tip');
    expect(ref.current).toHaveClass('x');
  });

  it('TaskPill: a named img, or a button when clickable', async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLElement>();
    const { rerender } = render(<TaskPill ref={ref} label="3 overdue tasks" count={3} className="x" data-testid="t" />);
    expect(screen.getByRole('img', { name: '3 overdue tasks' })).toBe(ref.current);
    rerender(<TaskPill ref={ref} label="3 overdue tasks" count={3} onClick={onClick} data-testid="t" />);
    expect(ref.current?.tagName).toBe('BUTTON');
    await userEvent.click(screen.getByRole('button', { name: '3 overdue tasks' }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('CellHistoryPopover', () => {
  function Host() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Trend</button>
        {open && <CellHistoryPopover title="Invested Capital" subtitle="Acme" onClose={() => setOpen(false)} data-testid="p">chart</CellHistoryPopover>}
      </>
    );
  }

  it('is a named non-modal dialog, moves focus in, closes on Escape and returns focus', async () => {
    const { container } = render(<Host />);
    const trigger = screen.getByRole('button', { name: 'Trend' });
    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Invested Capital' });
    expect(dialog).not.toHaveAttribute('aria-modal', 'true');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await expectNoViolations(container);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('closes from the close button, with a custom label', async () => {
    const onClose = vi.fn();
    render(<CellHistoryPopover title="T" onClose={onClose} closeLabel="Fermer">x</CellHistoryPopover>);
    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('autoFocus={false} neither takes focus nor reacts to Escape; ref/className pass through', async () => {
    const onClose = vi.fn();
    const ref = createRef<HTMLDivElement>();
    const noFocus = { autoFocus: false };
    render(<><button type="button">before</button><CellHistoryPopover ref={ref} {...noFocus} className="x" title="T" onClose={onClose}>x</CellHistoryPopover></>);
    expect(document.body).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    expect(ref.current).toHaveClass('scalar-cell-history', 'x');
  });
});

describe('ColumnHeader inside a DataGrid still reads as a table', () => {
  it('renders', () => {
    render(<DataGrid label="t" head={<ColumnHeader>A</ColumnHeader>} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
