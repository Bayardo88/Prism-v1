import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColumnHeader, DataGrid, Row, RowHeader, Cell } from '../table/index.js';
import { Avatar } from '../avatar/index.js';
import {
  ActionPill, ActionTag, DueDatePill, StepMenu, StepMenuAction, StepMenuLink, StepMenuSection, StepMenuToggle,
  dueUrgency, type DueUrgency, type StepMenuStep, type WorkflowTone,
} from './index.js';

/** Fixed "today" so the urgency colours never drift with the calendar. */
const TODAY = '2026-10-12';
const tones: WorkflowTone[] = ['brand', 'ai', 'warning', 'positive', 'blue', 'pink', 'cyan', 'orange'];
const urgencies: DueUrgency[] = ['upcoming', 'today', 'overdue'];

const meta = {
  title: 'Workboard/Action Pill',
  component: ActionPill,
  tags: ['autodocs'],
  args: { label: 'Request financials', tone: 'brand', urgency: 'upcoming', size: 'm' },
  argTypes: {
    tone: { control: 'inline-radio', options: tones },
    urgency: { control: 'inline-radio', options: ['none', ...urgencies] },
    size: { control: 'inline-radio', options: ['s', 'm'] },
  },
} satisfies Meta<typeof ActionPill>;
export default meta;
type Story = StoryObj<typeof meta>;

/* --- Workflow fixture: the valuation process, in prototype order ---------- */

const PROCESS: { label: string; tone: WorkflowTone }[] = [
  { label: 'Send engagement letter', tone: 'pink' },
  { label: 'Request financials', tone: 'blue' },
  { label: 'Draft valuation memo', tone: 'ai' },
  { label: 'Prepare model', tone: 'orange' },
  { label: 'Review model', tone: 'cyan' },
  { label: 'Deliver final report', tone: 'positive' },
];

function stepsAt(position: number): StepMenuStep[] {
  return PROCESS.map((s, i) => ({
    id: String(i),
    label: s.label,
    tone: s.tone,
    state: i < position ? 'done' : i === position ? 'next' : 'pending',
  }));
}

/** Tick a step off, open the caret, rewind from the menu. */
function PillWithMenu({ size = 'm' as 's' | 'm', urgency = 'upcoming' as DueUrgency }) {
  const [position, setPosition] = useState(1);
  const [open, setOpen] = useState(false);
  const [rush, setRush] = useState(false);
  const [paused, setPaused] = useState(false);
  const step = PROCESS[position];
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      <ActionPill
        size={size}
        label={step?.label ?? 'All steps complete'}
        tone={step?.tone ?? 'positive'}
        urgency={step ? urgency : 'upcoming'}
        done={!step}
        paused={paused}
        onComplete={() => setPosition((p) => p + 1)}
        onMenuToggle={() => setOpen((o) => !o)}
        menuOpen={open}
      />
      {open && (
        <StepMenu
          label="Valuation status"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- the menu mounts on open; APG moves focus to its first item
          autoFocus
          locked={paused}
          steps={stepsAt(position)}
          onSelectStep={(id) => { setPosition(Number(id)); setOpen(false); }}
          onClose={() => setOpen(false)}
        >
          <StepMenuSection heading="Recurrent actions">
            <StepMenuLink ai>Draft client follow-up</StepMenuLink>
            <StepMenuLink>Open data request</StepMenuLink>
          </StepMenuSection>
          <StepMenuSection heading="Other">
            <StepMenuToggle checked={rush} onCheckedChange={setRush}>Rush deal</StepMenuToggle>
            <StepMenuToggle checked={paused} onCheckedChange={setPaused}>Pause engagement</StepMenuToggle>
            <StepMenuAction action="Send">Final invoice</StepMenuAction>
            <StepMenuAction action="Cancel" tone="destructive">Engagement</StepMenuAction>
          </StepMenuSection>
        </StepMenu>
      )}
    </div>
  );
}

export const Playground: Story = {};

/** Click the circle or the label to tick the step off; the caret opens the step list. */
export const Interactive: Story = { render: () => <PillWithMenu /> };
export const InteractiveGridSize: Story = { name: 'Interactive (grid size)', render: () => <PillWithMenu size="s" urgency="today" /> };

/** Every tone — the four status families and the four Workflow tones — at every urgency, both sizes. */
export const ToneByUrgency: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 'var(--space-s)', alignItems: 'center' }}>
      {tones.flatMap((tone) =>
        urgencies.map((urgency) => (
          <ActionPill key={`${tone}-${urgency}`} label={`${tone} · ${urgency}`} tone={tone} urgency={urgency} onComplete={() => undefined} onMenuToggle={() => undefined} />
        )),
      )}
      {tones.flatMap((tone) =>
        urgencies.map((urgency) => (
          <ActionPill key={`s-${tone}-${urgency}`} size="s" label={`${tone} · ${urgency}`} tone={tone} urgency={urgency} onComplete={() => undefined} onMenuToggle={() => undefined} />
        )),
      )}
    </div>
  ),
};

export const Paused: Story = { args: { paused: true, onMenuToggle: () => undefined } };
export const Done: Story = { args: { done: true, label: 'All steps complete', tone: 'positive' } };
/** A chase is standing in for the step while the client owes something. */
export const FollowUp: Story = { args: { followUp: true, label: 'Follow up: financials', onComplete: () => undefined, onMenuToggle: () => undefined } };
/** The last action is in its undo window: the tint drains over 8s. */
export const PendingUndo: Story = { args: { pendingMs: 8000, onComplete: () => undefined, onMenuToggle: () => undefined } };

/* --- Siblings: tag, due date, step menu ----------------------------------- */

export const Tags: Story = {
  name: 'Action Tag',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 'var(--space-s)' }}>
      {tones.flatMap((tone) => urgencies.map((u) => <ActionTag key={`${tone}-${u}`} tone={tone} urgency={u}>{`${tone} · ${u}`}</ActionTag>))}
    </div>
  ),
};

function DueDemo({ size, start, withPicker }: { size: 's' | 'm'; start: string; withPicker?: boolean }) {
  const [value, setValue] = useState(start);
  return <DueDatePill size={size} value={value} onChange={setValue} today={TODAY} withPicker={withPicker} />;
}

/** Quiet while ahead, Warning on the day, Negative once passed. Nudge with − / +. */
export const DueDates: Story = {
  name: 'Due Date Pill',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: 'var(--space-m)', alignItems: 'center' }}>
      <DueDemo size="m" start="2026-10-15" withPicker />
      <DueDemo size="m" start={TODAY} withPicker />
      <DueDemo size="m" start="2026-10-08" withPicker />
      <DueDemo size="m" start="" withPicker />
      <DueDemo size="s" start="2026-10-15" />
      <DueDemo size="s" start={TODAY} />
      <DueDemo size="s" start="2026-10-08" />
      <DueDemo size="s" start="" />
    </div>
  ),
};

export const StepMenuOpen: Story = {
  name: 'Step Menu',
  render: () => (
    <StepMenu label="Valuation status" steps={[...stepsAt(3).slice(0, 2), { id: 'x', label: 'Skip model (support provided)', tone: 'orange', state: 'skipped' }, ...stepsAt(3).slice(2)]}>
      <StepMenuSection heading="Recurrent actions">
        <StepMenuLink ai>Draft client follow-up</StepMenuLink>
        <StepMenuLink href="#data-request">Open data request</StepMenuLink>
      </StepMenuSection>
      <StepMenuSection heading="Other">
        <StepMenuToggle checked onCheckedChange={() => undefined}>Rush deal</StepMenuToggle>
        <StepMenuToggle checked={false} onCheckedChange={() => undefined}>Pause engagement</StepMenuToggle>
        <StepMenuAction action="Send">Final invoice</StepMenuAction>
        <StepMenuAction action="Cancel" tone="destructive">Engagement</StepMenuAction>
      </StepMenuSection>
    </StepMenu>
  ),
};

/* --- In context: the Workboard grid row ----------------------------------- */

const ROWS = [
  { company: 'Northwind Robotics', lead: 'AM', step: 1, due: '2026-10-15' },
  { company: 'Helios Bio', lead: 'JR', step: 2, due: TODAY },
  { company: 'Kestrel Payments', lead: 'SK', step: 4, due: '2026-10-07' },
];

function WorkboardGrid() {
  const [rows, setRows] = useState(ROWS);
  const update = (i: number, patch: Partial<(typeof ROWS)[number]>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  return (
    <DataGrid
      label="Workboard"
      columns={["200px", "220px", "150px", "60px"]}
      head={<><ColumnHeader>Company</ColumnHeader><ColumnHeader>Actions</ColumnHeader><ColumnHeader>Due date</ColumnHeader><ColumnHeader>Lead</ColumnHeader></>}
    >
      {rows.map((row, i) => {
        const step = PROCESS[row.step];
        return (
          <Row key={row.company}>
            <RowHeader>{row.company}</RowHeader>
            <Cell>
              <ActionPill
                size="s"
                fullWidth
                label={step?.label ?? 'All steps complete'}
                tone={step?.tone ?? 'positive'}
                urgency={step ? dueUrgency(row.due, TODAY) : 'upcoming'}
                done={!step}
                onComplete={() => update(i, { step: row.step + 1 })}
                onMenuToggle={() => undefined}
              />
            </Cell>
            <Cell><DueDatePill size="s" value={row.due} today={TODAY} onChange={(due) => update(i, { due })} /></Cell>
            <Cell><Avatar size="xs" initials={row.lead} /></Cell>
          </Row>
        );
      })}
    </DataGrid>
  );
}

export const InAGridRow: Story = { name: 'In a grid row', render: () => <WorkboardGrid /> };
