import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import {
  ActionPill, ActionTag, DueDatePill, StepMenu, StepMenuAction, StepMenuLink, StepMenuSection, StepMenuToggle,
  dueUrgency, formatIsoDate, shiftIsoDate,
} from './index.js';

async function expectNoViolations(container: Element) {
  expect((await checkA11y(container)).violations).toEqual([]);
}

describe('date helpers', () => {
  it('derives urgency against a given today', () => {
    expect(dueUrgency('', '2026-10-12')).toBe('none');
    expect(dueUrgency('2026-10-12', '2026-10-12')).toBe('today');
    expect(dueUrgency('2026-10-11', '2026-10-12')).toBe('overdue');
    expect(dueUrgency('2026-10-13', '2026-10-12')).toBe('upcoming');
  });
  it('shifts across month ends and formats', () => {
    expect(shiftIsoDate('2026-10-31', 1)).toBe('2026-11-01');
    expect(shiftIsoDate('', -1, '2026-10-12')).toBe('2026-10-11');
    expect(formatIsoDate('2026-10-12')).toBe('10/12/2026');
  });
});

describe('ActionTag', () => {
  it('forwards ref/className/testid, adds urgency words and has no axe violations', async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<ActionTag ref={ref} className="x" data-testid="t" tone="ai" urgency="overdue">Draft memo</ActionTag>);
    expect(ref.current).toBe(screen.getByTestId('t'));
    expect(ref.current).toHaveClass('scalar-action', 'scalar-wf--ai', 'scalar-action--overdue', 'x');
    expect(ref.current).toHaveTextContent('Draft memo, overdue');
    await expectNoViolations(container);
  });
});

describe('ActionPill', () => {
  it('names the group and its buttons, and has no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <ActionPill ref={ref} className="x" data-testid="p" label="Request financials" urgency="today" onComplete={() => undefined} onMenuToggle={() => undefined} />,
    );
    expect(ref.current).toBe(screen.getByTestId('p'));
    expect(ref.current).toHaveClass('scalar-action-pill', 'x');
    expect(screen.getByRole('group', { name: 'Request financials, due today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mark Request financials complete' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Show all steps' })).toHaveAttribute('aria-expanded', 'false');
    await expectNoViolations(container);
  });

  it('completes after the settle beat, and never bubbles the click', async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const onRow = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stands in for a clickable grid row
      <div onClick={onRow}><ActionPill label="Review" onComplete={onComplete} /></div>,
    );
    screen.getByRole('button', { name: 'Mark Review complete' }).click();
    expect(onComplete).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(600); });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onRow).not.toHaveBeenCalled();
    expect(document.querySelector('.scalar-action__label--arriving')).not.toBeNull();
    act(() => { vi.advanceTimersByTime(300); });
    expect(document.querySelector('.scalar-action__label--arriving')).toBeNull();
    vi.useRealTimers();
  });

  it('completes at once under reduced motion', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes('reduce') })) as typeof window.matchMedia;
    const onComplete = vi.fn();
    render(<ActionPill label="Review" onComplete={onComplete} />);
    screen.getByRole('button', { name: 'Mark Review complete' }).click();
    expect(onComplete).toHaveBeenCalledTimes(1);
    window.matchMedia = original;
  });

  it('opens the menu from the caret, or from the tick at a fork', async () => {
    const onMenuToggle = vi.fn();
    render(<ActionPill label="Support received?" completeOpensMenu onMenuToggle={onMenuToggle} menuOpen />);
    await userEvent.click(screen.getByRole('button', { name: 'Mark Support received? complete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Show all steps' }));
    expect(onMenuToggle).toHaveBeenCalledTimes(2);
    expect(onMenuToggle.mock.calls[0]?.[0]).toHaveClass('scalar-action-pill');
    expect(screen.getByRole('button', { name: 'Show all steps' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('locks the tick when paused or done', () => {
    const { rerender } = render(<ActionPill label="Review" paused onComplete={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Process paused' })).toBeDisabled();
    rerender(<ActionPill label="Done" done onComplete={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Every step completed' })).toBeDisabled();
  });
});

describe('DueDatePill', () => {
  it('nudges by a day, colours by urgency and has no axe violations', async () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(<DueDatePill ref={ref} className="x" value="2026-10-12" today="2026-10-12" onChange={onChange} withPicker />);
    expect(ref.current).toHaveClass('scalar-due-pill--today', 'x');
    expect(ref.current).toHaveTextContent('10/12/2026, due today');
    await userEvent.click(screen.getByRole('button', { name: 'One day later' }));
    await userEvent.click(screen.getByRole('button', { name: 'One day earlier' }));
    expect(onChange.mock.calls).toEqual([['2026-10-13'], ['2026-10-11']]);
    expect(screen.getByLabelText('Due date')).toHaveValue('2026-10-12');
    await expectNoViolations(container);
  });

  it('opens the native picker from the calendar button and takes its value, without bubbling', async () => {
    const onChange = vi.fn();
    const onRow = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stands in for a clickable grid row
      <div onClick={onRow}><DueDatePill value="2026-10-12" today="2026-10-12" onChange={onChange} withPicker /></div>,
    );
    const input = screen.getByLabelText('Due date') as HTMLInputElement;
    const showPicker = vi.fn();
    input.showPicker = showPicker;
    await userEvent.click(screen.getByRole('button', { name: 'Pick a due date' }));
    expect(showPicker).toHaveBeenCalledTimes(1);
    expect(input).toHaveFocus();
    await userEvent.click(input);
    fireEvent.change(input, { target: { value: '2026-11-02' } });
    expect(onChange).toHaveBeenLastCalledWith('2026-11-02');
    expect(onRow).not.toHaveBeenCalled();
  });
});

describe('StepMenu', () => {
  const steps = [
    { id: 'a', label: 'Send letter', state: 'done' as const },
    { id: 'b', label: 'Request financials', state: 'next' as const, tone: 'brand' as const },
    { id: 'c', label: 'Review model', state: 'pending' as const, tone: 'warning' as const },
  ];

  it('groups steps, marks the current one, reports progress and has no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <StepMenu ref={ref} className="x" label="Valuation status" steps={steps}>
        <StepMenuSection heading="Other">
          <StepMenuLink ai>Draft follow-up</StepMenuLink>
          <StepMenuToggle checked={false} onCheckedChange={() => undefined}>Rush deal</StepMenuToggle>
          <StepMenuAction action="Send">Final invoice</StepMenuAction>
        </StepMenuSection>
      </StepMenu>,
    );
    expect(ref.current).toHaveClass('scalar-step-menu', 'x');
    expect(screen.getByRole('menu', { name: 'Valuation status' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Request financials/ })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('menuitem', { name: /Review model/ })).toBeDisabled();
    expect(screen.getByRole('menu')).toHaveAccessibleDescription('1 of 3 steps completed');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rush deal' })).toHaveAttribute('aria-checked', 'false');
    await expectNoViolations(container);
  });

  it('runs the menu keyboard model and selects steps', async () => {
    const onSelectStep = vi.fn();
    const onClose = vi.fn();
    const onToggle = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/no-autofocus -- APG: an opened menu focuses its first item
      <StepMenu label="Status" steps={steps} onSelectStep={onSelectStep} onClose={onClose} autoFocus>
        <StepMenuToggle checked onCheckedChange={onToggle}>Rush deal</StepMenuToggle>
      </StepMenu>,
    );
    expect(screen.getByRole('menuitem', { name: /Send letter/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /Request financials/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rush deal' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledWith(false);
    await userEvent.keyboard('{Home}{Enter}');
    expect(onSelectStep).toHaveBeenCalledWith('a');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledWith('escape');
  });

  it('locks every step when locked', () => {
    render(<StepMenu label="Status" steps={steps} locked />);
    screen.getAllByRole('menuitem').forEach((item) => expect(item).toBeDisabled());
  });
});
