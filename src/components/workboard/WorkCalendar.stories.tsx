import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/index.js';
import { Icon } from '../icon/index.js';
import * as m from '../icon/material.js';
import {
  ActionTag, CalendarTaskCard, PeriodToolbar, WorkCalendar, dueUrgency, shiftIsoDate,
  type WorkCalendarEvent, type WorkCalendarView, type WorkflowTone,
} from './index.js';

/** Fixed "today" so the urgency colours never drift with the calendar. */
const TODAY = '2026-10-12';

const STEPS: { label: string; tone: WorkflowTone }[] = [
  { label: 'Send engagement letter', tone: 'pink' },
  { label: 'Request financials', tone: 'blue' },
  { label: 'Draft valuation memo', tone: 'ai' },
  { label: 'Prepare model', tone: 'orange' },
  { label: 'Review model', tone: 'cyan' },
  { label: 'Deliver final report', tone: 'positive' },
];
const COMPANIES = ['Helios Bio', 'Northwind Robotics', 'Kestrel Payments', 'Orbit Labs', 'Vega Health', 'Lumen AI', 'Atlas Freight', 'Cinder Energy', 'Moss & Co', 'Juniper Pay', 'Quill Legal', 'Tide Marine'];
const OFFSETS = [-9, -6, -3, -1, 0, 0, 2, 2, 2, 2, 5, 9, 12, 16, 23];

interface Task extends WorkCalendarEvent {
  company: string;
  step: string;
  tags: string[];
  comments: number;
  rush: boolean;
}

const TASKS: Task[] = OFFSETS.map((d, i) => {
  const step = STEPS[i % STEPS.length] as (typeof STEPS)[number];
  const company = COMPANIES[i % COMPANIES.length] as string;
  return {
    id: String(i),
    date: shiftIsoDate(TODAY, d),
    label: `${step.label} · ${company}`,
    tone: step.tone,
    company,
    step: step.label,
    tags: i % 3 === 0 ? ['409A', 'ASC 820'] : ['409A'],
    comments: i % 4,
    rush: i % 7 === 3,
  };
});

const meta = {
  title: 'Workboard/Calendar',
  component: WorkCalendar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'Valuations due', date: TODAY, today: TODAY, events: TASKS },
} satisfies Meta<typeof WorkCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Tab into the grid, then arrows between days; Enter steps into a day's items, Escape steps out. */
export const Month: Story = {};
export const Week: Story = { args: { view: 'week' } };

const monthTitle = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(`${iso}T00:00`));

function shiftPeriod(iso: string, view: WorkCalendarView, by: number) {
  if (view === 'week') return shiftIsoDate(iso, by * 7);
  const [y, mo] = iso.split('-').map(Number);
  const d = new Date(y ?? 2026, (mo ?? 1) - 1 + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/** The Workboard calendar: toolbar, Month | Week, "+N more", and the full task cards for the Models view. */
function CalendarScreen({ cards }: { cards?: boolean }) {
  const [view, setView] = useState<WorkCalendarView>('month');
  const [date, setDate] = useState(TODAY);
  const [opened, setOpened] = useState<string>('—');
  const title = view === 'month' ? monthTitle(date) : `Week of ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00`))}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)' }}>
      <PeriodToolbar
        title={title}
        onToday={() => setDate(TODAY)}
        onPrevious={() => setDate(shiftPeriod(date, view, -1))}
        onNext={() => setDate(shiftPeriod(date, view, 1))}
        previousLabel={view === 'month' ? 'Previous month' : 'Previous week'}
        nextLabel={view === 'month' ? 'Next month' : 'Next week'}
        views={[{ value: 'month', label: 'Month' }, { value: 'week', label: 'Week' }]}
        view={view}
        onViewChange={(v) => { setView(v); setDate(TODAY); }}
        viewLabel="Calendar range"
        actions={<Button variant="primary" leadingIcon={<Icon size="s" tone="inherit"><m.Add /></Icon>}>New task</Button>}
      />
      <WorkCalendar<Task>
        label={`Valuations due, ${title}`}
        view={view}
        date={date}
        today={TODAY}
        events={TASKS}
        maxPerDay={cards && view === 'month' ? 2 : undefined}
        onShowMore={(iso) => { setView('week'); setDate(iso); }}
        onEventClick={(t) => setOpened(t.label)}
        renderEvent={cards ? (t, itemProps) => (
          <CalendarTaskCard
            {...itemProps}
            title={t.company}
            status={<ActionTag tone={t.tone} urgency={dueUrgency(t.date, TODAY)}>{t.step}</ActionTag>}
            tags={t.tags}
            due={t.date}
            today={TODAY}
            comments={t.comments}
            rush={t.rush}
            people={[{ name: 'Jordan Lee', role: 'Preparer' }, { name: 'Casey Rivera', role: 'Reviewer' }]}
          />
        ) : undefined}
      />
      <p style={{ margin: 0 }}>Last opened: {opened}</p>
    </div>
  );
}

export const WithToolbar: Story = { name: 'With toolbar', render: () => <CalendarScreen /> };
export const ModelsTaskCards: Story = { name: 'Models: task cards', render: () => <CalendarScreen cards /> };

export const TaskCard: StoryObj<typeof CalendarTaskCard> = {
  name: 'Task card',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--space-m)', maxWidth: 'calc(var(--size-avatar-xl) * 9)' }}>
      <CalendarTaskCard
        title="Helios Bio"
        status={<ActionTag tone="blue">Request financials</ActionTag>}
        tags={['409A']}
        due="2026-10-15"
        today={TODAY}
        comments={2}
        people={[{ name: 'Jordan Lee', role: 'Preparer' }]}
      />
      <CalendarTaskCard
        title="Kestrel Payments"
        status={<ActionTag tone="cyan" urgency="overdue">Review model</ActionTag>}
        tags={['409A', 'ASC 820']}
        due="2026-10-08"
        today={TODAY}
        rush
        people={[{ name: 'Jordan Lee', role: 'Preparer' }, { name: 'Casey Rivera', role: 'Reviewer' }]}
      />
      <CalendarTaskCard title="Orbit Labs" status={<ActionTag tone="orange" urgency="today">Prepare model</ActionTag>} due="not a date" />
    </div>
  ),
};
