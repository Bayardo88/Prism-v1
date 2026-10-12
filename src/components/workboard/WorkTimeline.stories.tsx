import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PeriodToolbar, WorkTimeline, formatIsoDate, shiftIsoDate, type WorkTimelineItem, type WorkflowTone } from './index.js';

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
const COMPANIES = ['Helios Bio', 'Northwind Robotics', 'Kestrel Payments', 'Orbit Labs', 'Vega Health', 'Lumen AI', 'Atlas Freight', 'Cinder Energy', 'Moss & Co', 'Juniper Pay'];

const ITEMS: WorkTimelineItem[] = COMPANIES.map((name, i) => {
  const step = STEPS[i % STEPS.length] as (typeof STEPS)[number];
  const end = shiftIsoDate(TODAY, [-4, 0, 3, 6, 9, 13, 17, 1, 22, 30][i] ?? 0);
  return { id: String(i), name, start: shiftIsoDate(end, -(3 + (i % 6))), end, label: step.label, tone: step.tone };
});

const meta = {
  title: 'Workboard/Timeline',
  component: WorkTimeline,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'Valuation timeline', start: shiftIsoDate(TODAY, -7), days: 35, today: TODAY, items: ITEMS },
} satisfies Meta<typeof WorkTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Month: Story = {};
export const Quarter: Story = { args: { days: 91 } };

type Range = 'week' | 'month' | 'quarter';
const DAYS: Record<Range, number> = { week: 14, month: 35, quarter: 91 };

/** Range switch and stepping, as in the Workboard's Timeline view. Row names open the item. */
function TimelineScreen() {
  const [range, setRange] = useState<Range>('month');
  const [start, setStart] = useState(shiftIsoDate(TODAY, -7));
  const [opened, setOpened] = useState('—');
  const days = DAYS[range];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-m)' }}>
      <PeriodToolbar
        title={`${formatIsoDate(start).slice(0, 5)} – ${formatIsoDate(shiftIsoDate(start, days - 1)).slice(0, 5)}`}
        onToday={() => setStart(shiftIsoDate(TODAY, -7))}
        onPrevious={() => setStart(shiftIsoDate(start, -7))}
        onNext={() => setStart(shiftIsoDate(start, 7))}
        previousLabel="Previous week"
        nextLabel="Next week"
        views={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'quarter', label: 'Quarter' }]}
        view={range}
        onViewChange={setRange}
        viewLabel="Timeline range"
      />
      <WorkTimeline label="Valuation timeline" start={start} days={days} today={TODAY} items={ITEMS} onItemClick={(item) => setOpened(String(item.name))} />
      <p style={{ margin: 0 }}>Last opened: {opened}</p>
    </div>
  );
}

export const WithToolbar: Story = { name: 'With toolbar', render: () => <TimelineScreen /> };
