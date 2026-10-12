import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkA11y } from '../../test/render.js';
import { ActionTag, CalendarTaskCard, PeriodToolbar, WorkCalendar, parseIsoDate, type WorkCalendarEvent } from './index.js';

const TODAY = '2026-10-12';
const events: WorkCalendarEvent[] = [
  { id: 'a', date: '2026-10-12', label: 'Request financials · Helios Bio', tone: 'blue' },
  { id: 'b', date: '2026-10-12', label: 'Review model · Kestrel', tone: 'cyan' },
  { id: 'c', date: '2026-10-14', label: 'Draft memo · Northwind', tone: 'ai' },
  { id: 'd', date: '2026-10-14', label: 'Prepare model · Orbit', tone: 'orange' },
  { id: 'e', date: '2026-10-14', label: 'Send letter · Vega', tone: 'pink' },
  { id: 'f', date: '2026-10-14', label: 'Deliver report · Lumen', tone: 'positive' },
];

describe('parseIsoDate', () => {
  it('accepts real dates only', () => {
    expect(parseIsoDate('2026-02-28')?.getDate()).toBe(28);
    expect(parseIsoDate('2026-02-30')).toBeUndefined();
    expect(parseIsoDate('10/12/2026')).toBeUndefined();
  });
});

describe('WorkCalendar', () => {
  it('draws six weeks with one tab stop, forwards ref/className/testid and has no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <WorkCalendar ref={ref} className="x" data-testid="cal" label="Due this month" date={TODAY} today={TODAY} events={events} onShowMore={() => undefined} />,
    );
    expect(ref.current).toBe(screen.getByTestId('cal'));
    expect(ref.current).toHaveClass('scalar-work-calendar', 'x');
    const grid = screen.getByRole('grid', { name: 'Due this month' });
    expect(within(grid).getAllByRole('row')).toHaveLength(7);
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(42);
    const tabStops = within(grid).getAllByRole('gridcell').filter((c) => c.tabIndex === 0);
    expect(tabStops).toHaveLength(1);
    expect(tabStops[0]).toHaveAttribute('aria-current', 'date');
    expect(tabStops[0]).toHaveTextContent('Monday, October 12, 2026, today, 2 items');
    expect(screen.getByRole('button', { name: '+1 more' })).toBeInTheDocument();
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('moves between days with arrows / Home / End and walks into and out of a day', async () => {
    const onEventClick = vi.fn();
    render(<WorkCalendar label="Due" date={TODAY} today={TODAY} events={events} onEventClick={onEventClick} />);
    await userEvent.tab();
    const cell = (iso: string) => document.querySelector<HTMLElement>(`[data-date="${iso}"]`);
    expect(cell('2026-10-12')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(cell('2026-10-14')).toHaveFocus();
    expect(cell('2026-10-14')).toHaveAttribute('tabindex', '0');
    expect(cell('2026-10-12')).toHaveAttribute('tabindex', '-1');
    await userEvent.keyboard('{ArrowDown}');
    expect(cell('2026-10-21')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{Home}');
    expect(cell('2026-10-11')).toHaveFocus();
    await userEvent.keyboard('{End}{ArrowLeft}{ArrowLeft}{ArrowLeft}');
    expect(cell('2026-10-14')).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: /Draft memo · Northwind/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: /Prepare model · Orbit/ })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onEventClick).toHaveBeenCalledWith(events[3]);
    await userEvent.keyboard('{Escape}');
    expect(cell('2026-10-14')).toHaveFocus();

    await userEvent.keyboard('{Control>}{Home}{/Control}');
    expect(cell('2026-09-27')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(cell('2026-09-27')).toHaveFocus();
  });

  it('shows one week in week view, with every event and custom cards', () => {
    render(
      <WorkCalendar
        label="Week"
        view="week"
        date={TODAY}
        today={TODAY}
        events={events}
        renderEvent={(e, itemProps) => <CalendarTaskCard title={e.label} {...itemProps} />}
      />,
    );
    expect(screen.getAllByRole('gridcell')).toHaveLength(7);
    expect(screen.getAllByRole('button')).toHaveLength(6);
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('data-work-calendar-item');
  });
});

describe('CalendarTaskCard', () => {
  it('speaks status, rush, due, comments and people; forwards ref/className/testid; no axe violations', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { container } = render(
      <CalendarTaskCard
        ref={ref}
        className="x"
        data-testid="card"
        title="Helios Bio"
        status={<ActionTag tone="cyan" urgency="overdue">Review model</ActionTag>}
        tags={['409A', 'ASC 820']}
        due="2026-10-09"
        today={TODAY}
        comments={3}
        people={[{ name: 'Jordan Lee', role: 'Preparer' }, { name: 'Casey Rivera', role: 'Reviewer' }]}
        rush
        onClick={onClick}
      />,
    );
    expect(ref.current).toBe(screen.getByTestId('card'));
    expect(ref.current).toHaveClass('scalar-task-card', 'scalar-task-card--rush', 'x');
    const name = ref.current?.textContent ?? '';
    for (const part of ['Review model, overdue', 'Rush', 'Helios Bio', '409A', 'Due 10/09/2026, overdue', '3 comments']) expect(name).toContain(part);
    expect(screen.getByRole('img', { name: 'Reviewer: Casey Rivera' })).toBeInTheDocument();
    ref.current?.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('shows an invalid date instead of hiding it', () => {
    render(<CalendarTaskCard title="Orbit" due="2026-13-45" />);
    expect(screen.getByRole('button')).toHaveTextContent('Due Invalid date');
  });
});

describe('PeriodToolbar', () => {
  it('steps periods and switches range by keyboard; forwards ref/className; no axe violations', async () => {
    const ref = createRef<HTMLDivElement>();
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    const onToday = vi.fn();
    const onViewChange = vi.fn();
    const { container } = render(
      <PeriodToolbar
        ref={ref}
        className="x"
        title="October 2026"
        onPrevious={onPrevious}
        onNext={onNext}
        onToday={onToday}
        views={[{ value: 'month', label: 'Month' }, { value: 'week', label: 'Week' }]}
        view="month"
        onViewChange={onViewChange}
      />,
    );
    expect(ref.current).toHaveClass('scalar-period-toolbar', 'x');
    expect(screen.getByRole('heading', { name: 'October 2026' })).toHaveAttribute('aria-live', 'polite');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect([onToday, onPrevious, onNext].map((f) => f.mock.calls.length)).toEqual([1, 1, 1]);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(onViewChange).toHaveBeenCalledWith('week');
    expect((await checkA11y(container)).violations).toEqual([]);
  });
});
