import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cell } from './Cell.js';
import { Footnote } from './Footnote.js';

const meta = {
  title: 'Data/Table/Cell',
  component: Cell,
  tags: ['autodocs'],
  args: { children: '1,250,000' },
  argTypes: {
    type: { control: 'inline-radio', options: ['readable', 'input', 'data', 'group', 'divider'] },
    state: { control: 'inline-radio', options: ['default', 'selected', 'error', 'draft', 'total'] },
    trailingIcon: { control: 'inline-radio', options: [undefined, 'dropdown', 'calendar'] },
  },
  decorators: [(Story) => <div role="table" style={{ width: 240 }}><div role="row" style={{ display: 'grid' }}><Story /></div></div>],
} satisfies Meta<typeof Cell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Readable: Story = {};
export const Numeric: Story = { args: { numeric: true } };
/** Editable input colour: the user typed this value. */
export const Input: Story = { args: { type: 'input' } };
/** Sourced colour: the number was pulled from a data source. */
export const Sourced: Story = { args: { type: 'data' } };
export const Group: Story = { args: { type: 'group', children: 'Operating expenses' } };
export const Selected: Story = { args: { state: 'selected' } };
export const Error: Story = { args: { state: 'error', errorMessage: 'Must be a positive number', children: '-4' } };
export const Draft: Story = { args: { state: 'draft' } };
export const Total: Story = { args: { state: 'total', numeric: true, children: '4,980,000' } };
export const WithFootnote: Story = { args: { numeric: true, footnote: <Footnote currency="USD">1</Footnote> } };
export const WithLabel: Story = { args: { children: 'FY2026', label: 'Projection' } };
export const WithTooltip: Story = { args: { tooltip: 'Converted at the closing rate on 31 Dec 2025.' } };
export const DropdownCell: Story = { args: { type: 'input', children: 'Annual', trailingIcon: 'dropdown' } };
export const DateCell: Story = { args: { type: 'input', children: '31 Dec 2025', trailingIcon: 'calendar' } };
