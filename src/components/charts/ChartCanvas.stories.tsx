import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChartCanvas } from './ChartCanvas.js';
import { baseChartOptions, chartScaffold } from './chartSetup.js';
import { ChartLegend } from './ChartLegend.js';

const meta = {
  title: 'Charts/ChartCanvas',
  component: ChartCanvas,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 640 }}><Story /></div>],
} satisfies Meta<typeof ChartCanvas>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The scaffold for a chart this package does not ship: build the Chart.js config from resolved
 * tokens with `chartScaffold` and `baseChartOptions`, and always pass a `table` for screen readers.
 */
export const CustomChart: Story = {
  args: {
    title: 'Deals closed per month',
    table: { columns: ['Month', 'Deals'], rows: [['Jan', 4], ['Feb', 7], ['Mar', 6]] },
    build: (t) => {
      const scales = chartScaffold(t, 'horizontal', String);
      return {
        type: 'bar',
        data: { labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'Deals', data: [4, 7, 6], backgroundColor: t.series[0], borderRadius: 4 }] },
        options: { ...baseChartOptions(t), scales: { x: scales.x, y: scales.y } },
      };
    },
  },
};

/** Children render between the canvas and the data table, e.g. a legend. */
export const WithLegend: Story = {
  args: {
    ...CustomChart.args,
    height: 180,
    children: <ChartLegend labels={['Deals']} />,
  },
};
