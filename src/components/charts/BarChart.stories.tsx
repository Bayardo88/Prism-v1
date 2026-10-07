import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart } from './BarChart.js';

const money = (v: number) => `$${v.toFixed(1)}M`;

const meta = {
  title: 'Charts/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  args: {
    title: 'Revenue by region',
    categoryLabel: 'Year',
    categories: ['FY2023', 'FY2024', 'FY2025'],
    series: [
      { label: 'North America', values: [4.1, 5.2, 6.4] },
      { label: 'Europe', values: [2.3, 2.9, 3.4] },
    ],
    format: money,
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['grouped', 'stacked'] },
    grid: { control: 'inline-radio', options: ['horizontal', 'both', 'none'] },
  },
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {};
/** Stacked bars label the column total only. Use when the total is meaningful. */
export const Stacked: Story = {
  args: {
    type: 'stacked',
    series: [
      { label: 'North America', values: [4.1, 5.2, 6.4] },
      { label: 'Europe', values: [2.3, 2.9, 3.4] },
      { label: 'Asia Pacific', values: [1.2, 1.9, 2.8] },
    ],
  },
};
/** Three or more series turn on direct labels automatically. */
export const ThreeSeries: Story = {
  args: {
    series: [
      { label: 'North America', values: [4.1, 5.2, 6.4] },
      { label: 'Europe', values: [2.3, 2.9, 3.4] },
      { label: 'Asia Pacific', values: [1.2, 1.9, 2.8] },
    ],
  },
};
export const SingleSeries: Story = { args: { series: [{ label: 'Revenue', values: [6.5, 8.1, 9.8] }] } };
export const GridBoth: Story = { args: { grid: 'both' } };
export const NoGrid: Story = { args: { grid: 'none' } };
export const Short: Story = { args: { height: 160 } };
