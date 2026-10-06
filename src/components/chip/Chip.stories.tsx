import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../avatar/Avatar.js';
import { Chip } from './Chip.js';

const meta = {
  title: 'Core/Chip',
  component: Chip,
  tags: ['autodocs'],
  args: { children: 'Series B' },
  argTypes: {
    styleVariant: { control: 'inline-radio', options: ['default', 'info', 'positive', 'negative', 'warning', 'ai'] },
    size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
  },
} satisfies Meta<typeof Chip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllStyles: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
      {(['default', 'info', 'positive', 'negative', 'warning', 'ai'] as const).map((s) => <Chip key={s} {...args} styleVariant={s}>{s}</Chip>)}
    </div>
  ),
};
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
      {(['s', 'm', 'l'] as const).map((s) => <Chip key={s} {...args} size={s}>Size {s}</Chip>)}
    </div>
  ),
};
export const WithLeading: Story = { args: { leadingIcon: <Avatar size="xs" initials="AR" alt="Ana Rivera" />, children: 'Ana Rivera' } };
function Interactive(args: React.ComponentProps<typeof Chip>) {
  const [on, setOn] = useState(false);
  const [gone, setGone] = useState(false);
  if (gone) return <button type="button" onClick={() => setGone(false)}>Restore chip</button>;
  return <Chip {...args} selected={on} onClick={() => setOn(!on)} onRemove={() => setGone(true)}>Healthcare</Chip>;
}
/** Enter or Space toggles; Backspace/Delete on the label removes. */
export const SelectableAndRemovable: Story = { render: (args) => <Interactive {...args} /> };
export const AsLink: Story = { render: (args) => <Chip {...args} asChild><a href="#company">Northwind</a></Chip> };
