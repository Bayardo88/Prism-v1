import { vi } from 'vitest';

// A canvas is not available in jsdom: replace Chart.js with a stub (as Charts.test.tsx does).
vi.mock('chart.js', () => {
  class Chart {
    static register() {}
    update = vi.fn();
    destroy = vi.fn();
    data: unknown;
    options: unknown;
    constructor(_canvas: unknown, config: { data: unknown; options: unknown }) {
      this.data = config.data;
      this.options = config.options;
    }
  }
  const stub = class {};
  return {
    Chart,
    ArcElement: stub, BarController: stub, BarElement: stub, CategoryScale: stub, DoughnutController: stub,
    Filler: stub, LineController: stub, LineElement: stub, LinearScale: stub, PointElement: stub, Tooltip: stub,
  };
});

const { render } = await import('@testing-library/react');
const { composeStories } = await import('@storybook/react-vite');
const { describe, expect, it } = await import('vitest');
const suites = {
  BarChart: composeStories(await import('./BarChart.stories.js')),
  LineChart: composeStories(await import('./LineChart.stories.js')),
  WaterfallChart: composeStories(await import('./WaterfallChart.stories.js')),
  DonutChart: composeStories(await import('./DonutChart.stories.js')),
  ChartLegend: composeStories(await import('./ChartLegend.stories.js')),
  ChartCanvas: composeStories(await import('./ChartCanvas.stories.js')),
};

describe('charts stories', () => {
  for (const [suite, composed] of Object.entries(suites)) {
    it.each(Object.entries(composed))(`${suite}: %s renders`, (_name, Story) => {
      expect(() => render(<Story />)).not.toThrow();
    });
  }
});
