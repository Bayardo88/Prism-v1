import type { Meta, StoryObj } from '@storybook/react-vite';
import { RowHeader } from './RowHeader.js';
import type { RowHeaderBaseProps } from './RowHeader.js';
import { Footnote } from './Footnote.js';
import { Plus as Add } from '../icon/glyphs.js';

const meta = {
  title: 'Data/Table/RowHeader',
  component: RowHeader,
  tags: ['autodocs'],
  args: { children: 'Apple Inc.' },
  argTypes: {
    type: { control: 'inline-radio', options: ['readable', 'data', 'input', 'total', 'divider'] },
  },
  decorators: [(Story) => <div role="table" style={{ width: 280 }}><div role="row" style={{ display: 'grid' }}><Story /></div></div>],
} satisfies Meta<RowHeaderBaseProps & { iconLabel?: string }>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Readable: Story = {};
export const Sourced: Story = { args: { type: 'data' } };
export const Input: Story = { args: { type: 'input' } };
export const Total: Story = { args: { type: 'total', children: 'Total revenue' } };
export const Divider: Story = { args: { type: 'divider', children: 'Operating expenses' } };
export const Marked: Story = { args: { mark: true } };
/** The bulk checkbox is a separate tab stop from the label. */
export const Bulk: Story = { args: { bulk: true, selectLabel: 'Select Apple Inc.' } };
export const BulkChecked: Story = { args: { bulk: true, defaultChecked: true, selectLabel: 'Select Apple Inc.' } };
export const Grouped: Story = { args: { group: true } };
export const GroupStart: Story = { args: { type: 'input', groupStart: true } };
export const GroupEnd: Story = { args: { type: 'input', groupEnd: true } };
export const WithFootnote: Story = { args: { footnote: <Footnote>1</Footnote> } };
export const AsLink: Story = { args: { href: '#company' } };
export const WithDecorativeIcon: Story = { args: { icon: <Add /> } };
/** The trailing glyph becomes a named button when `onIconClick` is passed. */
export const ExpandButton: Story = { render: (args) => <RowHeader {...args} icon={<Add />} onIconClick={() => {}} iconLabel="Expand Apple Inc." /> };
