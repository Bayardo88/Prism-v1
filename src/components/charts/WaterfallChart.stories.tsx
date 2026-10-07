import type { Meta, StoryObj } from '@storybook/react-vite';
import { WaterfallChart } from './WaterfallChart.js';

const meta = {
  title: 'Charts/WaterfallChart',
  component: WaterfallChart,
  tags: ['autodocs'],
  args: {
    title: 'Equity bridge',
    format: (v: number) => `$${v}M`,
    steps: [
      { label: 'Enterprise value', value: 150, total: true },
      { label: 'Debt', value: -40 },
      { label: 'Cash', value: 12 },
      { label: 'Preferred', value: -18 },
      { label: 'Equity value', value: 104, total: true },
    ],
  },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
} satisfies Meta<typeof WaterfallChart>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Totals anchor to the baseline; deltas float and carry an explicit sign. */
export const Default: Story = {};
export const AllIncreases: Story = {
  args: {
    title: 'Revenue build',
    steps: [
      { label: 'FY2024', value: 80, total: true },
      { label: 'New logos', value: 14 },
      { label: 'Expansion', value: 9 },
      { label: 'FY2025', value: 103, total: true },
    ],
  },
};
export const Short: Story = { args: { height: 180 } };
