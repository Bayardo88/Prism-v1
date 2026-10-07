import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox.js';
import { CheckboxItem } from './CheckboxItem.js';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: { children: 'Include archived companies' },
  argTypes: { size: { control: 'inline-radio', options: ['m', 's'] } },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Space toggles the focused checkbox. */
export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Small: Story = { args: { size: 's' } };
export const WithDescription: Story = { args: { description: 'Archived companies stay hidden from valuations.' } };
export const Invalid: Story = { args: { invalid: true, 'aria-describedby': 'cb-err', description: undefined } , decorators: [(Story) => <div><Story /><p id="cb-err">Select at least one option.</p></div>] };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const Indeterminate: Story = { args: { indeterminate: true, children: 'Select all' } };
function ParentChildren() {
  const [items, setItems] = useState({ a: true, b: false, c: false });
  const all = Object.values(items).every(Boolean);
  const some = Object.values(items).some(Boolean);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
      <Checkbox checked={all} indeterminate={some && !all} onChange={(e) => setItems({ a: e.target.checked, b: e.target.checked, c: e.target.checked })}>All funds</Checkbox>
      {(['a', 'b', 'c'] as const).map((k) => (
        <Checkbox key={k} checked={items[k]} onChange={(e) => setItems({ ...items, [k]: e.target.checked })}>Fund {k.toUpperCase()}</Checkbox>
      ))}
    </div>
  );
}
/** A parent checkbox shows the mixed state of its children. Space toggles. */
export const ParentAndChildren: Story = { render: () => <ParentChildren /> };
export const BareItem: StoryObj<typeof CheckboxItem> = { render: () => <CheckboxItem aria-label="Select row" /> };
