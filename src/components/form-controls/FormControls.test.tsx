import { createRef, useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProvider, checkA11y } from '../../test/render.js';
import { CalendarDay, DatePicker, Radio, RadioGroup, Switch } from './index.js';

describe('Switch', () => {
  it('is role=switch, toggles with Space, forwards ref, no axe violations', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(<Switch ref={ref} className="s" data-testid="sw" description="Applies immediately">Alerts</Switch>);
    const sw = screen.getByRole('switch', { name: 'Alerts' });
    expect(ref.current).toBe(sw);
    expect(sw).toBe(screen.getByTestId('sw'));
    expect(sw).toHaveAccessibleDescription('Applies immediately');
    expect(sw.closest('label')).toHaveClass('s');
    expect(sw).not.toHaveAttribute('aria-selected');
    expect(sw).not.toBeChecked();
    sw.focus();
    await userEvent.keyboard(' ');
    expect(sw).toBeChecked();
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('supports controlled use and invalid', async () => {
    const onChange = vi.fn();
    function C() {
      const [on, setOn] = useState(true);
      return <Switch checked={on} invalid onChange={(e) => { setOn(e.target.checked); onChange(); }}>Controlled</Switch>;
    }
    renderWithProvider(<C />);
    const sw = screen.getByRole('switch');
    expect(sw).toBeChecked();
    expect(sw).toBeInvalid();
    await userEvent.click(sw);
    expect(sw).not.toBeChecked();
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Radio / RadioGroup', () => {
  it('forwards ref and has no axe violations', async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = renderWithProvider(
      <RadioGroup label="Plan" defaultValue="a" hint="Pick one" data-testid="rg" className="g">
        <Radio ref={ref} value="a" data-testid="ra">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    expect(ref.current).toBe(screen.getByTestId('ra'));
    const group = screen.getByRole('radiogroup', { name: 'Plan' });
    expect(group).toBe(screen.getByTestId('rg'));
    expect(group).toHaveClass('g');
    expect(group).toHaveAccessibleDescription('Pick one');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('arrow keys move and select within the group; Tab leaves it', async () => {
    const onValueChange = vi.fn();
    renderWithProvider(
      <>
        <RadioGroup label="Plan" defaultValue="a" onValueChange={onValueChange}>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
          <Radio value="c">C</Radio>
        </RadioGroup>
        <button>after</button>
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'A' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'B' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('b');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('radio', { name: 'C' })).toBeChecked();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
  });
  it('is controllable and shows the group error', () => {
    renderWithProvider(
      <RadioGroup label="Plan" value="b" error="Required" required>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'B' })).toBeChecked();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Required');
  });
  it('works standalone (native radios)', async () => {
    renderWithProvider(<><Radio name="n" defaultChecked>One</Radio><Radio name="n">Two</Radio></>);
    await userEvent.click(screen.getByRole('radio', { name: 'Two' }));
    expect(screen.getByRole('radio', { name: 'Two' })).toBeChecked();
  });
});

describe('CalendarDay', () => {
  it('names the button by the full date and marks today', () => {
    renderWithProvider(<CalendarDay day={5} date={new Date(2026, 2, 5)} today selected />);
    const b = screen.getByRole('button', { name: 'Thursday, March 5, 2026, today' });
    expect(b).toHaveAttribute('aria-pressed', 'true');
    expect(b).toHaveAttribute('aria-current', 'date');
  });
  it('puts aria-selected on the gridcell when rendered as a cell', () => {
    renderWithProvider(<div role="grid"><div role="row"><CalendarDay cell day={1} date={new Date(2026, 0, 1)} selected /></div></div>);
    expect(screen.getByRole('gridcell')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-selected');
  });
});

describe('DatePicker', () => {
  const today = new Date(2026, 2, 5); // Thu 5 Mar 2026
  const day = (name: RegExp | string) => screen.getByRole('button', { name });

  it('has the APG grid structure, forwards ref/className/data-testid, no axe violations, no role=application', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(<DatePicker ref={ref} today={today} className="dp" data-testid="dp" />);
    expect(ref.current).toBe(screen.getByTestId('dp'));
    expect(ref.current).toHaveClass('scalar-date-picker', 'dp');
    expect(container.querySelector('[role="application"]')).toBeNull();
    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(7);
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(day('Thursday, March 5, 2026, today')).toHaveAttribute('aria-current', 'date');
    expect(await checkA11y(container)).toHaveNoViolations();
  });
  it('has exactly one tab stop and Tab moves out of the grid', async () => {
    renderWithProvider(<><DatePicker today={today} /><button>after</button></>);
    const stops = screen.getAllByRole('button').filter((b) => b.getAttribute('tabindex') === '0' && b.dataset.date);
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(day('Thursday, March 5, 2026, today'));
  });
  it('uncontrolled: Enter selects, aria-selected lands on the gridcell, onChange fires', async () => {
    const onChange = vi.fn();
    renderWithProvider(<DatePicker today={today} onChange={onChange} />);
    day('Thursday, March 5, 2026, today').focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0]![0] as Date).getDate()).toBe(6);
    expect(day('Friday, March 6, 2026').closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
  });
  it('controlled value is shown and not mutated internally', async () => {
    renderWithProvider(<DatePicker today={today} value={new Date(2026, 2, 10)} />);
    await userEvent.click(day('Friday, March 6, 2026'));
    expect(day('Tuesday, March 10, 2026').closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
    expect(day('Friday, March 6, 2026').closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'false');
  });
  it('arrows move by day and week; Home/End go to week edges (Monday start)', async () => {
    renderWithProvider(<DatePicker today={today} />);
    day('Thursday, March 5, 2026, today').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(day('Wednesday, March 4, 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(day('Wednesday, March 11, 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(day('Wednesday, February 25, 2026')).toHaveFocus();
    expect(screen.getByRole('grid', { name: 'February 2026' })).toBeInTheDocument();
    await userEvent.keyboard('{Home}');
    expect(day('Monday, February 23, 2026')).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(day('Sunday, March 1, 2026')).toHaveFocus();
    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
  });
  it('PageUp/PageDown move a month (clamping the day); Shift moves a year', async () => {
    renderWithProvider(<DatePicker today={new Date(2026, 0, 31)} />);
    day(/January 31, 2026/).focus();
    await userEvent.keyboard('{PageDown}');
    expect(day('Saturday, February 28, 2026')).toHaveFocus();
    await userEvent.keyboard('{PageUp}');
    expect(screen.getByRole('grid', { name: 'January 2026' })).toBeInTheDocument();
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(screen.getByRole('grid', { name: 'January 2027' })).toBeInTheDocument();
    expect(document.activeElement).toHaveAttribute('data-date', '2027-01-28');
  });
  it('Escape calls onEscape; month buttons change the month with a live heading', async () => {
    const onEscape = vi.fn();
    renderWithProvider(<DatePicker today={today} onEscape={onEscape} />);
    day('Thursday, March 5, 2026, today').focus();
    await userEvent.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'April 2026' })).toBeInTheDocument();
    expect(screen.getByText('April 2026')).toHaveAttribute('aria-live', 'polite');
  });
  it('disabled days stay focusable but cannot be picked', async () => {
    const onChange = vi.fn();
    renderWithProvider(<DatePicker today={today} onChange={onChange} isDisabled={(d) => d.getDate() === 6} />);
    day('Thursday, March 5, 2026, today').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(day('Friday, March 6, 2026')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
    expect(day('Friday, March 6, 2026').closest('[role="gridcell"]')).toHaveAttribute('aria-disabled', 'true');
  });
  it('autoFocus focuses the active day on mount', () => {
    // eslint-disable-next-line jsx-a11y/no-autofocus -- exercising DatePicker's own opt-in autoFocus prop
    renderWithProvider(<DatePicker today={today} autoFocus />);
    expect(day('Thursday, March 5, 2026, today')).toHaveFocus();
  });
});
