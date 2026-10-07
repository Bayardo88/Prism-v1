import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalStatus, ValuationStatus } from './Status.js';
import type { ModalStatusState, ValuationStatusState } from './Status.js';

const meta = {
  title: 'Data/Table/Status',
  component: ModalStatus,
  tags: ['autodocs'],
  args: { state: 'draft' },
  argTypes: {
    state: { control: 'select', options: ['draft', 'review', 'in-process-usa', 'in-process-arg', 'final', 'complete', 'published'] },
  },
} satisfies Meta<typeof ModalStatus>;
export default meta;
type Story = StoryObj<typeof meta>;

const modalStates: ModalStatusState[] = ['draft', 'review', 'in-process-usa', 'in-process-arg', 'final', 'complete', 'published'];
const dealStates: ValuationStatusState[] = ['in-service', 'awaiting-payment', 'complete-deal', 'cancelled'];

export const Workflow: Story = {};
/** `published` shares Complete's tint and adds a check glyph. */
export const Published: Story = { args: { state: 'published' } };
export const CustomLabel: Story = { args: { state: 'review', children: 'In review (2)' } };
export const AllWorkflowStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
      {modalStates.map((s) => <ModalStatus key={s} state={s} />)}
    </div>
  ),
};
export const AllDealStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
      {dealStates.map((s) => <ValuationStatus key={s} state={s} />)}
    </div>
  ),
};
