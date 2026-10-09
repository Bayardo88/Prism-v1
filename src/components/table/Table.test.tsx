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
