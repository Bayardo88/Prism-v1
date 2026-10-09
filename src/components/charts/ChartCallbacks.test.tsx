/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

const h = vi.hoisted(() => ({ renders: [] as Array<Record<string, any>> }));

vi.mock('react-chartjs-2', async () => {
  const React = await import('react');
  return { Chart: (props: Record<string, unknown>) => { h.renders.push(props); return React.createElement('canvas'); } };
});

const { BarChart } = await import('./BarChart.js');
const { WaterfallChart } = await import('./WaterfallChart.js');

beforeEach(() => { h.renders.length = 0; });
const last = () => h.renders[h.renders.length - 1]!;

const makeCtx = () => ({
  save: vi.fn(), restore: vi.fn(), fillText: vi.fn(), beginPath: vi.fn(),
  moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
});
const el = (x: number, y: number, width = 10) => ({ getProps: () => ({ x, y, width }) });
const runLabels = (plugins: any[], datasets: unknown[][], elements: unknown[][]) => {
  const plugin = plugins.find((p) => p.id === 'scalarDirectLabels');
  const ctx = makeCtx();
  plugin.afterDatasetsDraw({
    ctx,
    data: { datasets: datasets.map((data) => ({ data })) },
    getDatasetMeta: (i: number) => ({ data: elements[i] }),
  });
  return ctx;
};

const steps = [
  { label: 'Start', value: 100, total: true },
  { label: 'Up', value: 20 },
  { label: 'Down', value: -30 },
  { label: 'End', value: 90, total: true },
];

describe('WaterfallChart config', () => {
  const fmt = (v: number) => `$${v}`;
  const render_ = () => { render(<WaterfallChart title="W" steps={steps} format={fmt} />); return last(); };

  it('builds floating spans, colours and corner radii', () => {
    const { data } = render_();
    expect(data.labels).toEqual(['Start', 'Up', 'Down', 'End']);
    expect(data.datasets[0].data).toEqual([[0, 100], [100, 120], [120, 90], [0, 90]]);
    expect(data.datasets[0].borderRadius).toEqual([{ topLeft: 4, topRight: 4 }, 4, 4, { topLeft: 4, topRight: 4 }]);
    expect(data.datasets[0].backgroundColor).toHaveLength(4);
  });

  it('formats y ticks with the format prop', () => {
    const { options } = render_();
    expect(options.scales.y.ticks.callback(50)).toBe('$50');
  });

  it('tooltip signs deltas, shows totals unsigned, and tolerates unknown indexes', () => {
    const cb = render_().options.plugins.tooltip.callbacks.label;
    expect(cb({ dataIndex: 0 })).toBe('$100');
    expect(cb({ dataIndex: 1 })).toBe('+$20');
    expect(cb({ dataIndex: 2 })).toBe('$-30');
    expect(cb({ dataIndex: 9 })).toBe('');
  });

  it('direct labels the delta (signed) for steps and the end point for totals', () => {
    render_();
    const ctx = runLabels(last().plugins, [steps.map(() => [0, 0])], [[el(0, 50), el(10, 40), el(20, 30), el(30, 20)]]);
    expect(ctx.fillText.mock.calls.map((c) => c[0])).toEqual(['$100', '+$20', '$-30', '$90']);
  });

  it('direct labels skip bars with no step', () => {
    render_();
    const ctx = runLabels(last().plugins, [[[0, 0], [0, 0]]], [[el(0, 5), el(1, 5)]]);
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    const extra = runLabels(last().plugins, [[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]], [Array.from({ length: 5 }, () => el(0, 5))]);
    expect(extra.fillText).toHaveBeenCalledTimes(4);
  });

  it('connectors run at each bar running total', () => {
    render_();
    const plugin = last().plugins.find((p: any) => p.id === 'scalarWaterfallConnectors');
    const ctx = makeCtx();
    plugin.beforeDatasetsDraw({
      ctx,
      data: { datasets: [{ data: last().data.datasets[0].data }] },
      scales: { y: { getPixelForValue: (v: number) => 1000 - v } },
      getDatasetMeta: () => ({ data: [el(0, 0), el(100, 0), el(200, 0), el(300, 0)] }),
    });
    expect(ctx.moveTo.mock.calls.map((c) => c[1])).toEqual([900, 880, 910]);
  });

  it('defaults format to String', () => {
    render(<WaterfallChart title="W" steps={steps} />);
    expect(last().options.plugins.tooltip.callbacks.label({ dataIndex: 1 })).toBe('+20');
    expect(last().options.scales.y.ticks.callback(3)).toBe('3');
  });
});

describe('BarChart config', () => {
  const series2 = [{ label: 'A', values: [1, 2] }, { label: 'B', values: [3, 4] }];

  it('grouped with two series has no direct labels', () => {
    render(<BarChart title="B" categories={['x', 'y']} series={series2} />);
    expect(last().plugins).toEqual([]);
    expect(last().options.scales.x.stacked).toBe(false);
    expect(last().data.datasets[0].borderRadius).toBe(4);
  });

  it('formats y ticks', () => {
    render(<BarChart title="B" categories={['x', 'y']} series={series2} format={(v) => `${v}%`} />);
    expect(last().options.scales.y.ticks.callback(40)).toBe('40%');
  });

  it('a single grouped series labels every bar', () => {
    render(<BarChart title="B" categories={['x', 'y']} series={[series2[0]!]} format={(v) => `#${v}`} />);
    const ctx = runLabels(last().plugins, [[1, 2]], [[el(0, 10), el(5, 10)]]);
    expect(ctx.fillText.mock.calls.map((c) => c[0])).toEqual(['#1', '#2']);
  });

  it('stacked labels only the column total on the top dataset', () => {
    render(<BarChart title="B" type="stacked" categories={['x', 'y']} series={series2} format={(v) => `#${v}`} />);
    expect(last().options.scales.y.stacked).toBe(true);
    expect(last().data.datasets.map((d: any) => d.borderRadius)).toEqual([0, 4]);
    const ctx = runLabels(last().plugins, [[1, 2], [3, 4]], [[el(0, 10), el(5, 10)], [el(0, 20), el(5, 20)]]);
    expect(ctx.fillText.mock.calls.map((c) => c[0])).toEqual(['#4', '#6']);
  });

  it('stacked total treats missing values as zero', () => {
    render(<BarChart title="B" type="stacked" categories={['x', 'y']} series={[{ label: 'A', values: [1] }, { label: 'B', values: [3, 4] }]} />);
    const ctx = runLabels(last().plugins, [[1], [3, 4]], [[el(0, 10)], [el(0, 20), el(5, 20)]]);
    expect(ctx.fillText.mock.calls.map((c) => c[0])).toEqual(['4', '4']);
  });
});
