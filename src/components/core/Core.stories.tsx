import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button/Button.js';
import { Icon } from '../icon/Icon.js';
import { icons } from '../icon/index.js';
import { Divider, EmptyState, Link, Scrim, Tooltip } from './index.js';

const meta = {
  title: 'Core/Primitives',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const DividerHorizontal: Story = {
  render: () => (<div style={{ width: 320 }}><p>Fund overview</p><Divider /><p>Holdings</p></div>),
};
export const DividerVertical: Story = {
  render: () => (<div style={{ display: 'flex', gap: 'var(--space-s)', height: 32, alignItems: 'stretch' }}><span>Summary</span><Divider orientation="vertical" /><span>Financials</span></div>),
};
export const DividerDecorative: Story = { render: () => <div style={{ width: 320 }}><Divider decorative /></div> };

export const LinkSizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
      {(['s', 'm', 'l'] as const).map((s) => <Link key={s} size={s} href="#valuations">Open valuation ({s})</Link>)}
      <Link href="https://example.com" target="_blank">External link</Link>
    </div>
  ),
};
export const LinkAsChild: Story = { render: () => <Link asChild><a href="#cap-table">Cap table</a></Link> };

const positions = ['top', 'bottom', 'left', 'right'] as const;
/** Hover or focus the trigger; Esc closes the tooltip. */
export const TooltipPositions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-xl)', padding: 'var(--space-2xl)' }}>
      {positions.map((p) => (
        <Tooltip key={p} content={`Tooltip on ${p}`} position={p}><Button variant="secondary">{p}</Button></Tooltip>
      ))}
    </div>
  ),
};
export const TooltipOpen: Story = {
  render: () => (<div style={{ padding: 'var(--space-2xl)' }}><Tooltip open content="Always visible"><Button variant="secondary">Pinned</Button></Tooltip></div>),
};

function ScrimDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', minHeight: 160 }}>
      <Button onClick={() => setOpen(true)}>Show scrim</Button>
      {open && <Scrim style={{ position: 'absolute', inset: 0 }} onDismiss={() => setOpen(false)} />}
    </div>
  );
}
/** Click the scrim to dismiss. */
export const ScrimBehindModal: Story = { render: () => <ScrimDemo /> };

const empty = <Icon size="xl" tone="secondary"><icons.Search /></Icon>;
export const EmptyNoData: Story = {
  render: () => (<EmptyState icon={empty} title="No companies yet" body="Add your first portfolio company to start valuing it." actions={<Button>Add company</Button>} />),
};
export const EmptyNoResults: Story = {
  render: () => (<EmptyState type="no-results" icon={empty} title="No matches for “Acme”" body="Try a different name or clear the filters." actions={<Button variant="secondary">Clear filters</Button>} />),
};
export const EmptyError: Story = {
  render: () => (<EmptyState type="error" role="status" icon={empty} title="We couldn't load valuations" body="Check your connection and try again." actions={<Button>Retry</Button>} />),
};
