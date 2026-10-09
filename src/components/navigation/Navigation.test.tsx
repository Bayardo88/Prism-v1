import { createRef, useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { checkA11y, renderWithProvider } from '../../test/render.js';
import { Breadcrumb, PageItem, Pagination, Step, Stepper, TabItem, TabPanel, Tabs, TabsGroup } from './index.js';

const clean = async (c: Element) => expect((await checkA11y(c)).violations).toEqual([]);

function Demo() {
  const [v, setV] = useState('a');
  return (
    <TabsGroup>
      <Tabs label="Sections">
        {['a', 'b', 'c'].map((k) => (
          <TabItem key={k} value={k} active={v === k} onClick={() => setV(k)}>{`Tab ${k}`}</TabItem>
        ))}
      </Tabs>
      {['a', 'b', 'c'].map((k) => (
        <TabPanel key={k} value={k} hidden={v !== k}>{`Panel ${k}`}</TabPanel>
      ))}
    </TabsGroup>
  );
}

describe('Tabs', () => {
  it('has no axe violations, forwards ref/className/data-testid', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(<Tabs ref={ref} label="L" className="x" data-testid="t"><TabItem active>One</TabItem><TabItem>Two</TabItem></Tabs>);
    await clean(container);
    expect(ref.current).toBe(screen.getByTestId('t'));
    expect(ref.current).toHaveClass('scalar-tabs', 'x');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'false');
  });

  it('wires aria-controls <-> aria-labelledby and passes axe', async () => {
    const { container } = renderWithProvider(<Demo />);
    const tab = screen.getByRole('tab', { name: 'Tab a' });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    await clean(container);
  });

  it('arrows, Home, End move focus and activate; inactive tabs are tabIndex -1', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Demo />);
    expect(screen.getByRole('tab', { name: 'Tab b' })).toHaveAttribute('tabindex', '-1');
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Tab a' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab b' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Tab b' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel b');
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Tab c' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Tab a' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Tab c' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Tab a' })).toHaveFocus();
  });
});

describe('Breadcrumb', () => {
  it('is a labelled nav with ol/li, aria-current, no axe violations, forwards ref', async () => {
    const ref = createRef<HTMLElement>();
    const onClick = vi.fn();
    const { container } = renderWithProvider(
      <Breadcrumb ref={ref} className="x" data-testid="b" items={[{ label: 'Home', href: '/' }, { label: 'Mid', onClick }, { label: 'Here' }]} />,
    );
    await clean(container);
    expect(ref.current).toBe(screen.getByTestId('b'));
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveClass('x');
    expect(screen.getByText('Here')).toHaveAttribute('aria-current', 'page');
    expect(container.querySelectorAll('ol > li').length).toBe(3);
    expect(container.querySelectorAll('ol > svg, ol > span').length).toBe(0);
  });
  it('renders a button when an item has onClick but no href', async () => {
    const onClick = vi.fn();
    renderWithProvider(<Breadcrumb items={[{ label: 'Mid', onClick }, { label: 'Here' }]} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Mid' }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('Pagination', () => {
  it('has no axe violations, forwards ref/className/data-testid, custom label', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderWithProvider(
      <Pagination ref={ref} label="Results pages" className="x" data-testid="p" page={2} pageCount={5} onPageChange={() => {}} />,
    );
    await clean(container);
    expect(ref.current).toBe(screen.getByTestId('p'));
    expect(screen.getByRole('navigation', { name: 'Results pages' })).toHaveClass('x');
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 2' })).not.toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Page 2 of 5');
  });
  it('works uncontrolled with keyboard', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    renderWithProvider(<Pagination pageCount={4} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onPageChange).toHaveBeenCalledTimes(1);
    screen.getByRole('button', { name: 'Page 4' }).focus();
    await user.keyboard('{Enter}');
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });
  it('PageItem forwards ref and className', () => {
    const ref = createRef<HTMLButtonElement>();
    renderWithProvider(<PageItem ref={ref} page={3} className="x" data-testid="pi" />);
    expect(ref.current).toBe(screen.getByTestId('pi'));
    expect(ref.current).toHaveClass('scalar-page-item', 'x');
  });
});

describe('Stepper', () => {
  it('is nav > ol > li, announces state, passes axe, forwards ref', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderWithProvider(
      <Stepper ref={ref} className="x" data-testid="s" label="Onboarding" steps={[
        { label: 'One', state: 'complete' }, { label: 'Two', state: 'current' }, { label: 'Three', state: 'error', className: 'y' }, { label: 'Four' },
      ]} />,
    );
    await clean(container);
    expect(ref.current).toBe(screen.getByTestId('s'));
    expect(ref.current).toHaveClass('x');
    expect(screen.getByRole('navigation', { name: 'Onboarding' })).toBeInTheDocument();
    expect(screen.getByText('Two').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('One').closest('li')).toHaveTextContent('completed');
    expect(screen.getByText('Three').closest('li')).toHaveClass('y');
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
  it('Step forwards ref', () => {
    const ref = createRef<HTMLLIElement>();
    renderWithProvider(<ol><Step ref={ref} index={1} label="A" data-testid="st" /></ol>);
    expect(ref.current).toBe(screen.getByTestId('st'));
  });
});

describe('Pagination controls', () => {
  it('Previous steps back, End buttons disable at the bounds, status announces', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithProvider(<Pagination defaultPage={3} pageCount={3} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Page 3 of 3');
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('status')).toHaveTextContent('Page 2 of 3');
  });
  it('collapses long ranges with aria-hidden ellipses and custom statusText', () => {
    const { container } = renderWithProvider(
      <Pagination page={10} pageCount={20} onPageChange={() => {}} statusText={(p, n) => `${p}/${n}`} />,
    );
    expect(container.querySelectorAll('.scalar-pagination__ellipsis')).toHaveLength(2);
    expect(container.querySelector('.scalar-pagination__ellipsis')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('10/20');
  });
  it('rows-per-page select reports a number, adds a missing option, and routes ref/className to the bar', async () => {
    const user = userEvent.setup();
    const onRows = vi.fn();
    const ref = createRef<HTMLElement>();
    renderWithProvider(
      <Pagination ref={ref} className="bar" data-testid="bar" page={1} pageCount={3} onPageChange={() => {}}
        rowsPerPage={15} onRowsPerPageChange={onRows} rowsPerPageLabel="Per page" />,
    );
    expect(ref.current).toBe(screen.getByTestId('bar'));
    expect(ref.current).toHaveClass('scalar-pagination-bar', 'bar');
    const select = screen.getByLabelText('Per page');
    expect(Array.from((select as HTMLSelectElement).options).map((o) => o.value)).toEqual(['10', '15', '25', '50', '100']);
    await user.selectOptions(select, '50');
    expect(onRows).toHaveBeenCalledWith(50);
  });
});
