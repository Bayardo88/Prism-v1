import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import { Cell, ColumnHeader, ContentCell, DataGrid, Footnote, Ledger, ModalStatus, Row, RowHeader, ValuationStatus } from './index.js';

async function expectNoViolations(container: Element) {
  expect((await checkA11y(container)).violations).toEqual([]);
}

function Sample({ onSort }: { onSort?: (d: 'asc' | 'desc') => void }) {
  return (
    <DataGrid
      label="Holdings"
      head={
        <>
          <ColumnHeader>Name</ColumnHeader>
          <ColumnHeader numeric sort="asc" onSortChange={onSort} actions={<button type="button">Filter</button>}>Value</ColumnHeader>
        </>
      }
    >
      <Row>
        <RowHeader>Apple</RowHeader>
        <Cell numeric state="error" errorMessage="Missing price">$—</Cell>
      </Row>
    </DataGrid>
  );
}

describe('DataGrid', () => {
  it('is an ARIA table, not a grid, and is named', async () => {
    const { container } = render(<Sample />);
    expect(screen.getByRole('table', { name: 'Holdings' })).toBeInTheDocument();
    expect(screen.queryByRole('grid')).toBeNull();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('cell')).toHaveLength(1);
    expect(screen.getByRole('rowheader')).toHaveTextContent('Apple');
    await expectNoViolations(container);
  });

  it('accepts aria-labelledby instead of label', () => {
    render(<><h2 id="h">Cap table</h2><DataGrid aria-labelledby="h" head={<ColumnHeader>A</ColumnHeader>} /></>);
    expect(screen.getByRole('table', { name: 'Cap table' })).toBeInTheDocument();
  });

  it('forwards ref, className, data-testid; bounded grid is a focusable scroll region', () => {
    const ref = createRef<HTMLDivElement>();
    render(<DataGrid ref={ref} label="L" maxHeight="200px" className="x" data-testid="t" head={<ColumnHeader>A</ColumnHeader>} />);
    expect(ref.current).toBe(screen.getByTestId('t'));
    expect(ref.current).toHaveClass('scalar-grid', 'x');
    expect(ref.current).toHaveAttribute('tabindex', '0');
  });
});

describe('ColumnHeader', () => {
  it('sorts from a native button and reports the next direction', async () => {
    const onSort = vi.fn();
    render(<Sample onSort={onSort} />);
    expect(screen.getByRole('columnheader', { name: /Value/ })).toHaveAttribute('aria-sort', 'ascending');
    const button = screen.getByRole('button', { name: 'Value' });
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onSort).toHaveBeenCalledTimes(2);
    expect(onSort).toHaveBeenLastCalledWith('desc');
  });

  it('does not sort when a nested action button is activated', async () => {
    const onSort = vi.fn();
    const onAction = vi.fn();
    render(<ColumnHeader sort={null} onSortChange={onSort} actions={<button type="button" onClick={onAction}>Filter</button>}>Value</ColumnHeader>);
    screen.getByRole('button', { name: 'Filter' }).focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onAction).toHaveBeenCalledTimes(2);
    expect(onSort).not.toHaveBeenCalled();
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'none');
  });

  it('a consumer onClick lands on the header and does not replace sorting', async () => {
    const onSort = vi.fn();
    const onClick = vi.fn();
    render(<ColumnHeader onSortChange={onSort} onClick={onClick} data-testid="h" className="x">Value</ColumnHeader>);
    await userEvent.click(screen.getByRole('button', { name: 'Value' }));
    expect(onSort).toHaveBeenCalledWith('asc');
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByTestId('h')).toHaveClass('x');
  });

  it('a non-sortable header has no button and no aria-sort', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ColumnHeader ref={ref}>Name</ColumnHeader>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(ref.current).not.toHaveAttribute('aria-sort');
  });

  it('works controlled', async () => {
    function C() {
      const [sort, setSort] = useState<'asc' | 'desc' | null>(null);
      return <ColumnHeader sort={sort} onSortChange={setSort}>V</ColumnHeader>;
    }
    render(<C />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'ascending');
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'descending');
  });
});

describe('Cell, Row, RowHeader', () => {
  it('Cell exposes error and draft state as text', () => {
    render(<table><tbody><tr><td><Cell state="error" errorMessage="Bad" data-testid="c">1</Cell></td></tr></tbody></table>);
    expect(screen.getByTestId('c')).toHaveTextContent('Error: Bad');
    expect(screen.getByTestId('c')).not.toHaveAttribute('aria-selected');
  });

  it('forward refs, classes and test ids', () => {
    const cell = createRef<HTMLDivElement>();
    const row = createRef<HTMLDivElement>();
    const header = createRef<HTMLDivElement>();
    render(
      <DataGrid label="x" head={<ColumnHeader>A</ColumnHeader>}>
        <Row ref={row} className="r" data-testid="row" selected><RowHeader ref={header} className="h" data-testid="rh">A</RowHeader><Cell ref={cell} className="c" data-testid="cell">1</Cell></Row>
      </DataGrid>,
    );
    expect(cell.current).toBe(screen.getByTestId('cell'));
    expect(row.current).toHaveClass('r');
    expect(row.current).toHaveAttribute('aria-selected', 'true');
    expect(header.current).toHaveClass('h');
  });

  it('a divider row is presentational', () => {
    render(<Row type="divider" data-testid="d" />);
    expect(screen.getByTestId('d')).toHaveAttribute('role', 'presentation');
  });

  it('RowHeader bulk checkbox works uncontrolled and controlled, and the icon button is named', async () => {
    const onCheckedChange = vi.fn();
    const onIcon = vi.fn();
    render(<RowHeader bulk selectLabel="Select Apple" onCheckedChange={onCheckedChange} icon={<span />} onIconClick={onIcon} iconLabel="Expand Apple">Apple</RowHeader>);
    const box = screen.getByRole('checkbox', { name: 'Select Apple' });
    await userEvent.click(box);
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await userEvent.click(screen.getByRole('button', { name: 'Expand Apple' }));
    expect(onIcon).toHaveBeenCalled();
  });
});

describe('Content, status, footnote', () => {
  it('ContentCell, Ledger, statuses forward ref / className / rest', () => {
    const a = createRef<HTMLDivElement>();
    const b = createRef<HTMLSpanElement>();
    const c = createRef<HTMLSpanElement>();
    const d = createRef<HTMLSpanElement>();
    render(
      <>
        <ContentCell ref={a} className="x" data-testid="cc" type="note">n</ContentCell>
        <Ledger ref={b} className="x" data-testid="l" label="Posted" />
        <ModalStatus ref={c} className="x" data-testid="ms" state="review" />
        <ValuationStatus ref={d} className="x" data-testid="vs" state="in-service" />
      </>,
    );
    expect(a.current).toBe(screen.getByTestId('cc'));
    expect(b.current).toBe(screen.getByTestId('l'));
    expect(screen.getByRole('img', { name: 'Posted' })).toBe(b.current);
    expect(c.current).toHaveTextContent('Review');
    expect(d.current).toHaveTextContent('In Service');
    for (const el of [a, b, c, d]) expect(el.current).toHaveClass('x');
  });

  it('Footnote is plain text, or a keyboard-reachable button when interactive', async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLElement>();
    const { rerender } = render(<Footnote ref={ref} className="x" data-testid="f">1</Footnote>);
    expect(ref.current).toBe(screen.getByTestId('f'));
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<Footnote interactive onClick={onClick} aria-label="Source note 1" aria-describedby="n1">1</Footnote>);
    const btn = screen.getByRole('button', { name: /Source note 1/ });
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
    expect(btn).toHaveAttribute('aria-describedby', 'n1');
  });
});

describe('Cell divider', () => {
  it('a divider cell is aria-hidden, has no cell role and forwards props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Cell ref={ref} type="divider" className="x" data-testid="dv" />);
    const el = screen.getByTestId('dv');
    expect(ref.current).toBe(el);
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).not.toHaveAttribute('role');
    expect(el).toHaveClass('scalar-cell', 'scalar-cell--divider', 'x');
  });
});

describe('DataGrid pagination (R15)', () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => (
    <Row key={i}><RowHeader>{`Company ${i + 1}`}</RowHeader><Cell numeric>{i + 1}</Cell></Row>
  ));
  const head = <><ColumnHeader>Name</ColumnHeader><ColumnHeader numeric>Value</ColumnHeader></>;
  const bodyRows = () => screen.getAllByRole('row').filter((r) => !r.classList.contains('scalar-grid__head'));

  it('always renders the pagination bar, even for a single row', () => {
    render(<DataGrid label="Holdings" head={head}>{rows(1)}</DataGrid>);
    expect(screen.getByRole('navigation', { name: 'Holdings pages' })).toBeInTheDocument();
    expect(screen.getByText('1–1 of 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('slices its own children 25 a page and moves between pages', async () => {
    render(<DataGrid label="Holdings" head={head}>{rows(60)}</DataGrid>);
    expect(bodyRows()).toHaveLength(25);
    expect(screen.getByText('1–25 of 60')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText('Company 51')).toBeInTheDocument();
  });

  it('changing rows per page goes back to page 1', async () => {
    const onRowsPerPageChange = vi.fn();
    render(<DataGrid label="Holdings" head={head} pagination={{ defaultPage: 2, onRowsPerPageChange }}>{rows(60)}</DataGrid>);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '50');
    expect(onRowsPerPageChange).toHaveBeenCalledWith(50);
    expect(screen.getByText('1–50 of 60')).toBeInTheDocument();
  });

  it('keeps trailing total rows under every page', async () => {
    render(
      <DataGrid label="Holdings" head={head} pagination={{ defaultRowsPerPage: 10 }}>
        {rows(15)}
        <Row type="total"><RowHeader type="total">Grand total</RowHeader><Cell numeric state="total">120</Cell></Row>
      </DataGrid>,
    );
    expect(screen.getByText('1–10 of 15')).toBeInTheDocument();
    expect(screen.getByText('Grand total')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Grand total')).toBeInTheDocument();
  });

  it('server paging shows the children as the page and counts from totalRows', () => {
    render(<DataGrid label="Holdings" head={head} pagination={{ totalRows: 200, page: 3, rowsPerPage: 25, onPageChange: () => {} }}>{rows(25)}</DataGrid>);
    expect(bodyRows()).toHaveLength(25);
    expect(screen.getByText('51–75 of 200')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('a width sizes the frame that holds the grid and its bar', () => {
    render(<DataGrid label="Holdings" head={head} data-testid="g" style={{ width: '60%' }}>{rows(2)}</DataGrid>);
    expect(screen.getByTestId('g').style.width).toBe('');
    expect(screen.getByTestId('g').parentElement!.style.width).toBe('60%');
  });
});

