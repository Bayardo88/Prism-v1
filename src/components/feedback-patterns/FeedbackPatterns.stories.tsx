import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AiOutline, Banner, DataFreshness, ProgressRing, SaveState, Spinner } from './index.js';
import { Button } from '../button/Button.js';

const meta = {
  title: 'Feedback/Banner',
  component: Banner,
  tags: ['autodocs'],
  args: { title: 'Valuation is in draft', children: 'Finalise it to share with your client.' },
  argTypes: { tone: { control: 'inline-radio', options: ['info', 'warning', 'negative', 'positive', 'neutral'] } },
  parameters: { layout: 'padded' },
  decorators: [(S) => <div style={{ width: 640 }}><S /></div>],
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { tone: 'info' } };
export const Warning: Story = { args: { tone: 'warning', title: 'Missing inputs' } };
export const Negative: Story = { args: { tone: 'negative', title: 'Calculation failed' } };
export const Positive: Story = { args: { tone: 'positive', title: 'Valuation finalised' } };
export const Neutral: Story = { args: { tone: 'neutral', title: 'Read-only view' } };
export const WithAction: Story = { args: { tone: 'info', action: <Button variant="secondary" size="s">Finalise</Button>, onDismiss: () => undefined } };
export const WithIssues: Story = {
  args: {
    tone: 'warning',
    title: '3 issues to resolve before finalising',
    issues: [{ label: 'Discount rate is empty', onClick: () => undefined }, { label: 'No guideline companies selected', onClick: () => undefined }],
  },
};

export const Spinners: StoryObj<typeof Spinner> = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-l)', alignItems: 'center' }}>
      <Spinner size="s" />
      <Spinner size="m" />
      <Spinner size="l" />
      <Spinner label="Loading valuations…" />
    </div>
  ),
};

export const ProgressRings: StoryObj<typeof ProgressRing> = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-l)' }}>
      <ProgressRing label="Fields reviewed" value={3} max={12} />
      <ProgressRing label="Upload" value={64} max={100} display="percent" />
      <ProgressRing label="Complete" value={12} max={12} />
    </div>
  ),
};

export const Freshness: StoryObj<typeof DataFreshness> = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-s)' }}>
      <DataFreshness onRefresh={() => undefined}>Updated 2 minutes ago</DataFreshness>
      <DataFreshness state="refreshing" onRefresh={() => undefined}>Refreshing…</DataFreshness>
      <DataFreshness state="stale" onRefresh={() => undefined}>Updated 3 days ago</DataFreshness>
      <DataFreshness>No refresh action</DataFreshness>
    </div>
  ),
};

export const SaveStates: StoryObj<typeof SaveState> = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-s)' }}>
      <SaveState state="saved" />
      <SaveState state="unsaved" />
      <SaveState state="saving" />
      <SaveState state="no-changes" />
      <SaveState state="error" />
      <SaveState state="saved">Saved to Q3 review</SaveState>
    </div>
  ),
};

/**
 * The AI working outline: the gradient (violet → blue → teal → pink) orbits
 * the outline every 6s while `active`, and holds still once the work is done.
 * Always pair it with words or a Spinner (R8). `play` checks that the active
 * outline turns and the still one does not.
 */
export const AiOutlines: StoryObj<typeof AiOutline> = {
  name: 'AiOutline',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-l)', maxWidth: 360 }}>
      <AiOutline data-testid="active" style={{ padding: 'var(--space-m)' }}>
        <Spinner size="s" label="Reading Annual Report 2026.pdf…" />
      </AiOutline>
      <AiOutline active={false} data-testid="still" style={{ padding: 'var(--space-m)' }}>
        Annual Report 2026.pdf has been analyzed and categorized.
      </AiOutline>
    </div>
  ),
  play: async ({ canvas }) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(canvas.getByTestId('active').getAnimations()).toHaveLength(reduce ? 0 : 1);
    await expect(canvas.getByTestId('still').getAnimations()).toHaveLength(0);
  },
};
