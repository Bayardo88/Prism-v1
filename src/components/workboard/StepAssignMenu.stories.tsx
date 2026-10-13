import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusTrigger, StepAssignMenu, type StepAssignStep } from './index.js';
import { MODEL_STEPS, MODEL_STEPS_MIXED, MODEL_STEPS_STAFFED, PEOPLE, STATUS_PEOPLE } from './valuationFixtures.js';

const meta = {
  title: 'Workboard/Step Assign Menu',
  component: StepAssignMenu,
  tags: ['autodocs'],
  args: { label: 'Model status', steps: MODEL_STEPS, people: PEOPLE },
  // The Figma dropdown frames are 237px wide; three Avatar/XL steps (240px) stands in.
  decorators: [(Story) => <div style={{ width: 'calc(var(--size-avatar-xl) * 3)' }}><Story /></div>],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StepAssignMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 538:29138 — nobody on any step: every row ends in the assign button. */
export const Unassigned: Story = {};

/** 538:29209 — the picker open under Draft: empty filter, everyone listed. */
export const PickerOpen: Story = { args: { defaultAssigningStepId: 'draft' } };

/** 538:29339 — typing filters the list ("J"). */
export const PickerFiltered: Story = { args: { defaultAssigningStepId: 'draft', pickerDefaults: { query: 'J' } } };

/** 538:29433 — one person chosen: a removable chip in the field, checked in the list. */
export const PickerOneChosen: Story = {
  args: { defaultAssigningStepId: 'draft', pickerDefaults: { chosen: ['jl'], query: 'J' } },
};

/** 538:29528 — two people chosen. */
export const PickerTwoChosen: Story = {
  args: { defaultAssigningStepId: 'draft', pickerDefaults: { chosen: ['jl', 'jj'], query: 'J' } },
};

/** 538:29624 — some steps staffed (avatars), the rest still offer the assign button. */
export const PartlyAssigned: Story = { args: { steps: MODEL_STEPS_MIXED } };

/** 538:29694 — every step staffed; past two people the rest fold into "+N". */
export const FullyAssigned: Story = { args: { steps: MODEL_STEPS_STAFFED } };

/** 538:29764 — every step staffed and reached. */
export const AllReached: Story = { args: { steps: MODEL_STEPS_STAFFED.map((s) => ({ ...s, done: true })) } };

/** Flat inside a panel, as the Model panel shows it under Model Status. */
export const Inline: Story = { args: { surface: 'inline', steps: MODEL_STEPS_MIXED } };

function Interactive() {
  const [open, setOpen] = useState(true);
  const [steps, setSteps] = useState<StepAssignStep[]>(MODEL_STEPS);
  const current = [...steps].reverse().find((s) => s.done) ?? steps[0]!;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      <StatusTrigger
        size="l"
        fullWidth
        label="Model status"
        value={current.label}
        assignees={current.assignees}
        expanded={open}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <StepAssignMenu
          label="Model status"
          steps={steps}
          people={PEOPLE}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          onSelectStep={(id) => {
            const at = steps.findIndex((s) => s.id === id);
            setSteps(steps.map((s, i) => ({ ...s, done: i <= at })));
          }}
          onAssign={(stepId, ids) =>
            setSteps(steps.map((s) => (s.id === stepId ? { ...s, assignees: PEOPLE.filter((p) => ids.includes(p.id)) } : s)))}
        />
      )}
    </div>
  );
}

/** Pick a step to move the status; assign people from any row and Save. */
export const WithTrigger: Story = { render: () => <Interactive /> };

/** The trigger on its own: header size (`s`) and panel size (`l`), with and without people. */
export const Triggers: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-s)' }}>
      <StatusTrigger value="Client Docs Received" />
      <StatusTrigger value="Client Docs Received" assignees={STATUS_PEOPLE} />
      <StatusTrigger size="l" fullWidth label="Model status" value="In-Process USA" />
      <StatusTrigger size="l" fullWidth label="Model status" value="In-Process USA" assignees={STATUS_PEOPLE} />
    </div>
  ),
};
