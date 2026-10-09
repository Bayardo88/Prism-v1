import { vi } from 'vitest';

// A canvas is not available in jsdom: replace the react-chartjs-2 binding with a stub (as Charts.test.tsx does).
vi.mock('react-chartjs-2', async () => {
  const React = await import('react');
  return { Chart: () => React.createElement('canvas') };
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
