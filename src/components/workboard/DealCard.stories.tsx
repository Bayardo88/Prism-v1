import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/index.js';
import { SelectMenu, SelectMenuOption } from '../form-patterns/index.js';
import { DealCard } from './index.js';

const meta = {
  title: 'Workboard/Deal Card',
  component: DealCard,
  tags: ['autodocs'],
  args: {
    title: '409A Valuation 2026',
    stage: 'Proposal',
    company: 'Helios Bio',
    companyHref: '#company',
    notice: 'Renewal due in 30 days',
    contract: 'MSA-2026-014',
    contractHref: '#contract',
    totals: [{ label: 'NET', value: '$12,000.00' }, { label: 'DUE', value: '$4,000.00' }],
    owner: { name: 'Jordan Lee', role: 'Engagement Manager' },
    onEditOwner: () => undefined,
  },
  decorators: [(Story) => <div style={{ maxWidth: 'calc(var(--size-avatar-xl) * 5)' }}><Story /></div>],
} satisfies Meta<typeof DealCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const STAGES = ['Proposal', 'Negotiation', 'Contract sent', 'Closed won', 'Closed lost'];

/** The stage is a `Selector`; the screen owns its menu (here a `SelectMenu`). */
function WithStageMenu() {
  const [stage, setStage] = useState('Proposal');
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <DealCard
        {...meta.args}
        stage={stage}
        stageExpanded={open}
        onStageClick={() => setOpen((o) => !o)}
        actions={<Button variant="secondary">Send final invoice</Button>}
      />
      {open && (
        <SelectMenu label="Deal stage" style={{ position: 'absolute', top: 'var(--space-3xl)', right: 'var(--space-m)', zIndex: 'var(--z-overlay)' }}>
          {STAGES.map((s) => (
            <SelectMenuOption key={s} selected={s === stage} onSelect={() => { setStage(s); setOpen(false); }}>{s}</SelectMenuOption>
          ))}
        </SelectMenu>
      )}
    </div>
  );
}

export const StageMenu: Story = { name: 'Stage menu + action', render: () => <WithStageMenu /> };

/** Only a title: every other part is optional. */
export const Minimal: Story = { args: { stage: undefined, company: undefined, notice: undefined, contract: undefined, totals: undefined, owner: undefined, onEditOwner: undefined } };

/** A stage with no handler reads as a Chip, not a dead button. */
export const ReadOnly: Story = { args: { onEditOwner: undefined } };
