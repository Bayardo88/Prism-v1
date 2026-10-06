import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarDay, DatePicker, Radio, RadioGroup, Switch } from './index.js';

const meta = {
  title: 'Forms/Controls',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj;

function RadioDemo({ error }: { error?: string }) {
  const [v, setV] = useState('quarterly');
  return (
    <RadioGroup label="Valuation cadence" hint="You can change this later." error={error} value={v} onValueChange={setV}>
      <Radio value="monthly">Monthly</Radio>
      <Radio value="quarterly">Quarterly</Radio>
      <Radio value="annual" disabled>Annual</Radio>
    </RadioGroup>
  );
}
/** Arrow keys move between radios in the group. */
export const RadioGroupDefault: Story = { render: () => <RadioDemo /> };
export const RadioGroupError: Story = { render: () => <RadioDemo error="Choose a cadence." /> };
export const RadioSmall: Story = {
  render: () => (<RadioGroup label="Size S" size="s" defaultValue="a"><Radio value="a">Option A</Radio><Radio value="b">Option B</Radio></RadioGroup>),
};
export const RadioStandalone: Story = { render: () => <Radio name="solo" aria-label="Standalone" defaultChecked /> };

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return <Switch checked={on} onChange={(e) => setOn(e.target.checked)}>Email me on new valuations</Switch>;
}
/** Space toggles the switch. */
export const SwitchDefault: Story = { render: () => <SwitchDemo /> };
export const SwitchWithDescription: Story = { render: () => <Switch description="Sent weekly on Mondays.">Weekly digest</Switch> };
export const SwitchSmall: Story = { render: () => <Switch size="s" defaultChecked>Compact</Switch> };
export const SwitchInvalid: Story = { render: () => <Switch invalid>Accept terms</Switch> };
export const SwitchDisabled: Story = { render: () => <Switch disabled defaultChecked>Locked setting</Switch> };

export const CalendarDays: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
      <CalendarDay day={12} />
      <CalendarDay day={13} today />
      <CalendarDay day={14} selected />
      <CalendarDay day={31} outside />
      <CalendarDay day={15} disabled />
    </div>
  ),
};

function DatePickerDemo() {
  const [d, setD] = useState<Date | undefined>(new Date(2026, 8, 21));
  return (
    <div style={{ display: 'grid', gap: 'var(--space-s)', width: 320 }}>
      <DatePicker value={d} onChange={setD} today={new Date(2026, 8, 10)} isDisabled={(x) => x.getDay() === 0 || x.getDay() === 6} />
      <span>Selected: {d?.toDateString()}</span>
    </div>
  );
}
/** Arrows move by day/week, Home/End jump to the week edges, PageUp/PageDown change month (Shift: year), Esc calls `onEscape`. Weekends are disabled here. */
export const DatePickerDefault: Story = { render: () => <DatePickerDemo /> };
export const DatePickerMondayStart: Story = { render: () => <DatePicker weekStartsOn={0} today={new Date(2026, 8, 10)} /> };
