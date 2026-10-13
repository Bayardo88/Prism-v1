import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/Button.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Chip } from '../chip/Chip.js';
import { EmptyState } from '../core/EmptyState.js';
import { Input } from '../input/Input.js';
import { Link } from '../core/Link.js';
import { Icon } from '../icon/Icon.js';
import * as m from '../icon/material.js';
import { SegmentedControl } from '../actions-menus/Actions.js';
import type { RichTextFormat } from '../admin/Admin.js';
import {
  AssigneeCard, DealCard, FigureList, NoteCard, NoteComposer, StatusTrigger, StepAssignMenu, ValuationModal,
  ValuationPanel, ValuationSummary, type StepAssignStep,
} from './index.js';
import { ENGAGEMENT_STEPS, MODEL_STEPS, PEOPLE, STATUS_PEOPLE } from './valuationFixtures.js';
import linkedinMark from './story-assets/linkedin.svg';
import xMark from './story-assets/x.svg';

/**
 * Which Figma frame of the "Assign users form Modal" section (538:27917) to show.
 * closed 536:23865 · open 536:19922 · picker 536:20963 · chosen 536:21717 ·
 * staffed 536:23253 · assigned 532:18149 · noModel 461:8408.
 */
type FrameState = 'closed' | 'open' | 'picker' | 'chosen' | 'staffed' | 'assigned' | 'noModel';

interface DemoProps { state: FrameState }

const FIGURES = [
  { label: 'Valuation Date:', value: '12/31/2025' },
  { label: 'Valuation Fee:', value: '$3,500' },
  { label: 'Net Value:', value: '$3,500' },
  { label: 'Split:', value: '$3,500' },
  { label: 'Booking Date:', value: '12/17/2025' },
];

const noop = () => undefined;

/* Story-level layout only; every value is a token. */
const column = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-s)' } as const;
const row = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-s)' } as const;
const caption = { color: 'var(--color-text-primary)', fontSize: 'var(--font-size-text-s)', lineHeight: 'var(--line-height-text-s)' } as const;
const iconLink = { display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)' } as const;
const field = {
  display: 'flex', alignItems: 'center', gap: 'var(--space-l)', color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-text-l)', lineHeight: 'var(--line-height-text-l)',
} as const;
const fit = <Icon size="s" tone="inherit"><m.FitScreen /></Icon>;
const notesButton = (label: string) => (
  <Button variant="secondary" size="xs" trailingIcon={<Icon size="s" tone="inherit"><m.Description /></Icon>} aria-label={label}>
    Notes
  </Button>
);

function Summary({ state }: DemoProps) {
  const staffed = state === 'chosen' || state === 'staffed' || state === 'assigned';
  return (
    <ValuationSummary
      tags={(
        <>
          <Chip styleVariant="positive">New Business</Chip>
          <Chip styleVariant="info">NOTICE: This Valuation has a special Notice message on it in Attio</Chip>
        </>
      )}
      status={(
        <>
          <span aria-hidden>Status:</span>
          <StatusTrigger value="Client Docs Received" assignees={staffed ? STATUS_PEOPLE : undefined} onClick={noop} />
        </>
      )}
      subject={<Link href="#company">7Learnings GmbH (409A)</Link>}
      meta={(
        <>
          <span>Folder:</span>
          <Link href="#folder" size="l" style={iconLink}>
            <Icon size="l" tone="inherit"><m.CreateNewFolder /></Icon>IRC 409A 2025.12
          </Link>
          <Chip styleVariant="info">5 Documents</Chip>
          <Button variant="secondary" size="xs" trailingIcon={fit}>
            Start Onboarding Email:
            <Chip styleVariant="default">0/0 Documents</Chip>
            <Chip styleVariant="default">0/0 Questions</Chip>
          </Button>
          <Button variant="secondary" size="xs" trailingIcon={fit}>Process Report</Button>
        </>
      )}
      people={(
        <>
          <AssigneeCard emphasis="lead" roleLabel="Engagement Manager" name="James Hemingway" onEdit={noop} />
          <AssigneeCard emphasis="outline" roleLabel="Valuation Lead" name="Jimmy Hendrix" onEdit={noop} />
          <AssigneeCard emphasis="outline" roleLabel="Valuation Lead" name="Kurt Cobain" onEdit={noop} editLabel="Change second valuation lead" />
          <AssigneeCard roleLabel="Other Consultant" name="Ernest Davinci" onEdit={noop} />
          <AssigneeCard roleLabel="Other Consultant" name="Pablo Picasso" onEdit={noop} editLabel="Change second other consultant" />
        </>
      )}
      figures={<FigureList items={FIGURES} />}
      aside={(
        <DealCard
          tone="deal"
          title="Deal"
          stage="In Service"
          onStageClick={noop}
          company="7Learnings GmbH (409A)"
          companyHref="#deal"
          notice="NOTICE: Per Matt, no need to send an EL for this"
          contract="Signed_EL"
          contractHref="#contract"
          contractAction={(
            <Button variant="secondary" size="xs" trailingIcon={<Icon size="s" tone="inherit"><m.ReceiptLong /></Icon>}>
              Send Final Invoice
            </Button>
          )}
          totals={[{ label: 'NET', value: '$3,500' }, { label: 'DUE', value: '$3,500' }]}
          owner={{ name: 'James Hemingway', role: 'EM' }}
          onEditOwner={noop}
        />
      )}
    />
  );
}

function EntityPanel() {
  return (
    <ValuationPanel
      title="Valued Entity"
      action={notesButton('Valued entity notes')}
      footer={(
        <>
          <AssigneeCard emphasis="inverse" roleLabel="Primary Contact" name="Bob Dylan" onEdit={noop} editPlacement="person">
            {notesButton('Primary contact notes')}
          </AssigneeCard>
          <AssigneeCard emphasis="muted" roleLabel="Sales Rep" name="Leonel Messi" onEdit={noop} />
        </>
      )}
    >
      <div style={column}>
        <Link href="#company" size="m" style={{ fontWeight: 'var(--font-weight-semi-bold)' }}>7Learnings GmbH (409A)</Link>
        <span style={caption}>Categories:</span>
        <span style={row}>
          <Chip styleVariant="info">Technology</Chip>
          <Chip styleVariant="info">Venture Capital</Chip>
          <Chip styleVariant="info">Business Supplies</Chip>
        </span>
        <span style={row}>
          <Link href="#web" size="s">7learnings.com</Link>
          <a href="#linkedin" aria-label="LinkedIn"><img src={linkedinMark} alt="" width={14} height={14} /></a>
          <a href="#x" aria-label="X"><img src={xMark} alt="" width={14} height={14} /></a>
        </span>
        <span style={caption}>Folder:</span>
        <span style={row}>
          <Link href="#folder" size="l" style={iconLink}>
            <Icon size="l" tone="inherit"><m.CreateNewFolder /></Icon>Folder_name
          </Link>
          <Chip styleVariant="default">Folder Not Checked</Chip>
        </span>
      </div>
    </ValuationPanel>
  );
}

function ModelPanel({ state }: DemoProps) {
  const [team, setTeam] = useState(state === 'noModel' ? 'slc' : 'arg');
  const [steps, setSteps] = useState<StepAssignStep[]>(state === 'staffed' ? ENGAGEMENT_STEPS : MODEL_STEPS);
  const open = state === 'open' || state === 'picker' || state === 'chosen' || state === 'staffed';
  const staffed = state === 'staffed' || state === 'assigned';
  const action = (
    <span className="scalar-segmented-group">
      <SegmentedControl
        variant="outline"
        label="Model team"
        value={team}
        onChange={setTeam}
        options={[{ value: 'arg', label: 'ARG' }, { value: 'slc', label: 'SLC' }, { value: 'waiting', label: 'Is Waiting' }]}
      />
      <span className="scalar-segmented-group__trailing">
        <ButtonIcon variant="tertiary" size="xs" label="Remove model" icon={<Icon size="s" tone="inherit"><m.Delete /></Icon>} className="scalar-note__delete" />
      </span>
    </span>
  );
  if (state === 'noModel') {
    return (
      <ValuationPanel title="Model" action={action}>
        <EmptyState
          title="A model support needs to be created before this area becomes available"
          body="Model Support Required"
          actions={<Button variant="primary" size="m">Create Model Support</Button>}
        />
      </ValuationPanel>
    );
  }
  return (
    <ValuationPanel
      title="Model"
      action={action}
      footer={(
        <>
          <AssigneeCard emphasis="muted" roleLabel="Preparer" name="Leonel Messi" onEdit={noop} />
          <AssigneeCard emphasis="muted" roleLabel="Reviewer" name="Leonel Messi" onEdit={noop} />
        </>
      )}
    >
      <div style={field}>
        <span aria-hidden style={{ whiteSpace: 'nowrap' }}>Model Status:</span>
        <StatusTrigger size="l" fullWidth label="Model status" value="In-Process USA" expanded={open} assignees={staffed ? STATUS_PEOPLE : undefined} />
      </div>
      {open && (
        <StepAssignMenu
          surface="inline"
          label="Model status"
          style={{ maxHeight: 'calc(var(--size-control-l) * 3)', overflowY: 'auto' }}
          steps={state === 'open' ? [steps[0]!, { ...steps[5]!, done: true }, steps[1]!] : steps}
          people={PEOPLE}
          defaultAssigningStepId={state === 'picker' || state === 'chosen' ? 'draft' : null}
          pickerDefaults={state === 'chosen' ? { chosen: ['jl', 'jj'] } : undefined}
          onAssign={(id, ids) => setSteps(steps.map((s) => (s.id === id ? { ...s, assignees: PEOPLE.filter((p) => ids.includes(p.id)) } : s)))}
        />
      )}
      <div style={field}>
        <label htmlFor={`due-${state}`} style={{ whiteSpace: 'nowrap' }}>Supporting Due Date</label>
        <Input
          id={`due-${state}`}
          defaultValue="01/21/2026"
          trailingIcon={<Icon size="s" tone="brand"><m.CalendarMonth /></Icon>}
          style={{ flex: '1 1 auto' }}
        />
      </div>
    </ValuationPanel>
  );
}

function NotesPanel() {
  const [tab, setTab] = useState('valuation');
  const [formats, setFormats] = useState<RichTextFormat[]>([]);
  const toggle = (f: RichTextFormat) => setFormats((on) => (on.includes(f) ? on.filter((x) => x !== f) : [...on, f]));
  return (
    <ValuationPanel aria-label="Notes">
      <SegmentedControl
        variant="outline"
        fullWidth
        checkSelected={false}
        label="Notes"
        value={tab}
        onChange={setTab}
        options={[{ value: 'valuation', label: 'Valuation Notes', count: 2 }, { value: 'model', label: 'Model Support Notes', count: 1 }]}
      />
      <div style={{ ...column, alignItems: 'stretch', gap: 'var(--space-xs)' }}>
        <NoteCard author="James Hemingway" timestamp="Sep 18, 2025 12:11 PM" dateTime="2025-09-18T12:11" onDelete={noop}>Note test</NoteCard>
        <NoteCard author="Olivia Barrand" timestamp="Sep 18, 2025 12:11 PM" dateTime="2025-09-18T12:11" onDelete={noop}>Note test</NoteCard>
      </div>
      <NoteComposer activeFormats={formats} onToggleFormat={toggle} onSave={noop} />
    </ValuationPanel>
  );
}

function Demo({ state }: DemoProps) {
  return (
    <ValuationModal open onClose={noop} aria-label="Valuation: 7Learnings GmbH (409A)" summary={<Summary state={state} />}>
      <EntityPanel />
      <ModelPanel state={state} />
      <NotesPanel />
    </ValuationModal>
  );
}

const meta = {
  title: 'Workboard/Valuation Modal',
  component: ValuationModal,
  parameters: { layout: 'fullscreen' },
  args: { open: true, onClose: noop, 'aria-label': 'Valuation', summary: null },
} satisfies Meta<typeof ValuationModal>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 536:23865 — Model Status closed. */
export const Default: Story = { render: () => <Demo state="closed" /> };
/** 536:19922 — Model Status open: the step list inline, each step with its assign button. */
export const ModelStatusOpen: Story = { render: () => <Demo state="open" /> };
/** 536:20963 — assigning people to Draft: the picker under the step. */
export const AssigningPeople: Story = { render: () => <Demo state="picker" /> };
/** 536:21717 — two people chosen; the header Status shows who is on it. */
export const PeopleChosen: Story = { render: () => <Demo state="chosen" /> };
/** 536:23253 — every step staffed: avatars in place of the assign buttons. */
export const StepsStaffed: Story = { render: () => <Demo state="staffed" /> };
/** 532:18149 — staffed and closed: both status triggers carry their people. */
export const Assigned: Story = { render: () => <Demo state="assigned" /> };
/** 461:8408 — SLC with no model support yet: the Model panel explains and offers the action. */
export const NoModelSupport: Story = { render: () => <Demo state="noModel" /> };
