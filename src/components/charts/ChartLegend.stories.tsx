import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartLegend, ChartLegendItem } from './ChartLegend.js';

const meta = {
  title: 'Charts/ChartLegend',
  component: ChartLegend,
  tags: ['autodocs'],
  args: { labels: ['North America', 'Europe', 'Asia Pacific'] },
} satisfies Meta<typeof ChartLegend>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** `current` marks the emphasised series with `aria-current`. */
export const WithCurrent: Story = { args: { current: 1 } };
export const EightSeries: Story = { args: { labels: Array.from({ length: 8 }, (_, i) => `Series ${i + 1}`) } };
/** `ChartLegendItem` on its own, inside your own list. */
export const SingleItem: Story = {
  render: () => <ul style={{ listStyle: 'none', padding: 0 }}><ChartLegendItem series={2}>Asia Pacific</ChartLegendItem></ul>,
};
