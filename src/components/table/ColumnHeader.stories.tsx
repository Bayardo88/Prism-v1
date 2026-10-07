import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColumnHeader } from './ColumnHeader.js';

const meta = {
  title: 'Data/Table/ColumnHeader',
  component: ColumnHeader,
  tags: ['autodocs'],
  args: { children: 'Revenue' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['brand', 'subtle'] },
    kind: { control: 'inline-radio', options: ['default', 'action-button'] },
    sort: { control: 'inline-radio', options: [null, 'asc', 'desc'] },
  },
  decorators: [(Story) => <div role="table" style={{ width: 240 }}><div role="row" style={{ display: 'grid' }}><Story /></div></div>],
} satisfies Meta<typeof ColumnHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {};
export const Subtle: Story = { args: { tone: 'subtle' } };
export const Numeric: Story = { args: { numeric: true } };
export const SortedAscending: Story = { args: { sort: 'asc' } };
export const SortedDescending: Story = { args: { sort: 'desc' } };
export const Marked: Story = { args: { mark: true, children: 'FY2026' } };
export const WithLabel: Story = { args: { children: 'FY2026', label: 'Projection' } };
export const WithTooltip: Story = { args: { tooltip: 'Net revenue after returns and discounts.' } };
export const ActionButton: Story = { args: { kind: 'action-button', input: true, children: 'Add column' } };

/** Click or press Enter / Space on the header label to toggle the sort direction. */
export const Sortable: Story = {
  render: function Render(args) {
    const [dir, setDir] = useState<'asc' | 'desc'>('asc');
    return <ColumnHeader {...args} sort={dir} onSortChange={setDir} />;
  },
};
