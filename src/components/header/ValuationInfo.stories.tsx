import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ValuationInfo } from './ValuationInfo.js';
import type { ValuationInfoOpen } from './ValuationInfo.js';

const meta = {
  title: 'Header/ValuationInfo',
  component: ValuationInfo,
  tags: ['autodocs'],
  args: {
    equityValue: '$34,560,000',
    unrealizedFirmTotal: '$48,871,695',
    marketDate: '06/01/2026',
    version: '2026/06/01',
  },
  argTypes: {
    open: { control: 'inline-radio', options: [undefined, 'none', 'values', 'dates', 'both'] },
  },
} satisfies Meta<typeof ValuationInfo>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Both toggles collapsed — the resting state. Click a toggle (Enter / Space) to reveal it. */
export const Collapsed: Story = {};
export const Values: Story = { args: { open: 'values' } };
export const Dates: Story = { args: { open: 'dates' } };
export const Both: Story = { args: { open: 'both' } };
export const PickerOpen: Story = { args: { open: 'dates', marketDateExpanded: true } };
export const Interactive: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState<ValuationInfoOpen>('none');
    return <ValuationInfo {...args} open={open} onOpenChange={setOpen} onMarketDateClick={() => {}} onVersionClick={() => {}} />;
  },
};
