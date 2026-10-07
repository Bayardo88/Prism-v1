import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, ProgressBar, Skeleton, SkeletonGroup, Toast, ToastViewport } from './index.js';
import { Button } from '../button/Button.js';

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { title: 'Valuation saved', children: 'Your changes are available to the whole team.' },
  argTypes: { tone: { control: 'inline-radio', options: ['info', 'positive', 'warning', 'negative'] } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { tone: 'info', title: 'Market data refreshed' } };
export const Positive: Story = { args: { tone: 'positive' } };
export const Warning: Story = { args: { tone: 'warning', title: 'Financials are older than 90 days', children: 'Update them before publishing.' } };
export const Negative: Story = { args: { tone: 'negative', title: 'Could not save', children: 'Check your connection and try again.' } };
export const WithActions: Story = { args: { tone: 'warning', actions: <Button variant="secondary" size="s">Review</Button> } };
export const Dismissible: Story = {
  render: function Render(args) {
    const [shown, setShown] = useState(true);
    return shown ? <Alert {...args} onDismiss={() => setShown(false)} /> : <Button onClick={() => setShown(true)}>Show alert</Button>;
  },
};

export const ToastStory: StoryObj<typeof Toast> = {
  name: 'Toast',
  render: () => (
    <ToastViewport style={{ position: 'static' }}>
      <Toast tone="positive">Valuation published</Toast>
      <Toast tone="info">3 documents processing</Toast>
      <Toast tone="warning" onDismiss={() => undefined}>Connection is slow</Toast>
      <Toast tone="negative" onDismiss={() => undefined}>Upload failed</Toast>
    </ToastViewport>
  ),
};

export const ProgressDeterminate: StoryObj<typeof ProgressBar> = {
  name: 'ProgressBar',
  render: () => <div style={{ width: 360 }}><ProgressBar label="Upload progress" value={60} /></div>,
};
export const ProgressComplete: StoryObj<typeof ProgressBar> = {
  name: 'ProgressBar (complete)',
  render: () => <div style={{ width: 360 }}><ProgressBar label="Upload progress" value={100} /></div>,
};
export const ProgressIndeterminate: StoryObj<typeof ProgressBar> = {
  name: 'ProgressBar (indeterminate)',
  render: () => <div style={{ width: 360 }}><ProgressBar label="Processing document" /></div>,
};

export const SkeletonTypes: StoryObj<typeof Skeleton> = {
  name: 'Skeleton',
  render: () => (
    <SkeletonGroup label="Loading company" style={{ width: 360, display: 'grid', gap: 'var(--space-s)' }}>
      <Skeleton type="title" width="60%" />
      <Skeleton type="text" />
      <Skeleton type="text" width="80%" />
      <Skeleton type="circle" width={40} height={40} />
      <Skeleton type="block" height={96} />
    </SkeletonGroup>
  ),
};
