import type { Meta, StoryObj } from '@storybook/react-vite';
import { LineChart } from './LineChart.js';

const meta = {
  title: 'Charts/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  args: {
    title: 'Enterprise value over time',
    categoryLabel: 'Quarter',
    categories: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1 26'],
    series: [
      { label: 'Enterprise value', values: [120, 128, 141, 150, 167] },
      { label: 'Equity value', values: [90, 98, 104, 118, 131] },
    ],
    format: (v: number) => `$${v}M`,
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['line', 'area'] },
    grid: { control: 'inline-radio', options: ['horizontal', 'both', 'none'] },
  },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
} satisfies Meta<typeof LineChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {};
/** Area suits one cumulative quantity; with more than three series use Line. */
export const Area: Story = { args: { type: 'area', series: [{ label: 'Enterprise value', values: [120, 128, 141, 150, 167] }] } };
export const AreaTwoSeries: Story = { args: { type: 'area' } };
export const SingleSeries: Story = { args: { series: [{ label: 'Enterprise value', values: [120, 128, 141, 150, 167] }] } };
export const GridBoth: Story = { args: { grid: 'both' } };
export const NoGrid: Story = { args: { grid: 'none' } };
