import type { Meta, StoryObj } from '@storybook/react-vite';
import { DonutChart } from './DonutChart.js';

const meta = {
  title: 'Charts/DonutChart',
  component: DonutChart,
  tags: ['autodocs'],
  args: {
    title: 'Ownership by class',
    total: '10.0M',
    caption: 'Fully diluted shares',
    slices: [
      { label: 'Common', value: 4.2 },
      { label: 'Series A', value: 2.4 },
      { label: 'Series B', value: 1.9 },
      { label: 'Options pool', value: 1.5 },
    ],
    format: (v: number) => `${v}M`,
  },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
} satisfies Meta<typeof DonutChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** The focused slice stays at full strength; the others drop to their Subtle steps. */
export const Focused: Story = { args: { focusedIndex: 1 } };
export const NoCentre: Story = { args: { total: undefined, caption: undefined } };
export const EightSlices: Story = {
  args: {
    slices: ['Common', 'Series A', 'Series B', 'Series C', 'Options', 'Warrants', 'Notes', 'Other'].map((label, i) => ({ label, value: 8 - i })),
  },
};
