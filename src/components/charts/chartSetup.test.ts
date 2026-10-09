import { describe, it, expect, vi, afterEach } from 'vitest';
import { Chart } from 'chart.js';
import { registerScalarCharts, chartScaffold as rawScaffold, baseChartOptions, type ChartGrid } from './chartSetup.js';
import type { ChartTokens } from './chartTokens.js';

const tokens: ChartTokens = {
  series: [], seriesSubtle: [], positive: 'g', negative: 'r', total: 't',
  grid: 'GRID', axis: 'AXIS', labelColor: 'LABEL', valueColor: 'VALUE', surface: 's',
  fontFamily: 'Inter', fontSize: 12, valueFontSize: 12, spaceS: 8, spaceM: 12,
};

afterEach(() => vi.unstubAllGlobals());

describe('registerScalarCharts', () => {
  it('registers the controllers and is idempotent', () => {
    const spy = vi.spyOn(Chart, 'register');
    registerScalarCharts();
    registerScalarCharts();
    expect(spy.mock.calls.length).toBeLessThanOrEqual(1);
    expect(Chart.registry.getController('bar')).toBeDefined();
    expect(Chart.registry.getController('doughnut')).toBeDefined();
    spy.mockRestore();
  });
});

interface Scale {
  grid: { display: boolean; color: string; lineWidth: number };
  border: { color: string; width: number };
  ticks: { color: string; padding: number; callback: (v: string | number) => string };
  beginAtZero: boolean;
}
const chartScaffold = (t: ChartTokens, g: ChartGrid, f?: (v: number) => string) =>
  rawScaffold(t, g, f) as unknown as { x: Scale; y: Scale };

describe('chartScaffold', () => {
  it('shows only horizontal gridlines by default grid="horizontal"', () => {
    const s = chartScaffold(tokens, 'horizontal');
    expect(s.x.grid.display).toBe(false);
    expect(s.y.grid.display).toBe(true);
  });

  it('shows both axes grids for "both" and none for "none"', () => {
    const both = chartScaffold(tokens, 'both');
    expect([both.x.grid.display, both.y.grid.display]).toEqual([true, true]);
    const none = chartScaffold(tokens, 'none');
    expect([none.x.grid.display, none.y.grid.display]).toEqual([false, false]);
  });

  it('applies recessive token styling', () => {
    const s = chartScaffold(tokens, 'both');
    expect(s.y.grid).toMatchObject({ color: 'GRID', lineWidth: 1 });
    expect(s.y.border).toMatchObject({ color: 'AXIS', width: 1 });
    expect(s.y.ticks).toMatchObject({ color: 'LABEL', padding: 8 });
    expect(s.y.beginAtZero).toBe(true);
  });

  it('formats y ticks with the supplied formatter, else stringifies', () => {
    const cb = (opts: ReturnType<typeof chartScaffold>) => opts.y.ticks.callback;
    expect(cb(chartScaffold(tokens, 'none', (v) => `$${v}k`))('5')).toBe('$5k');
    expect(cb(chartScaffold(tokens, 'none'))(7)).toBe('7');
  });
});

describe('baseChartOptions', () => {
  it('turns the built-in legend off and themes the tooltip', () => {
    const o = baseChartOptions(tokens);
    expect(o.plugins?.legend?.display).toBe(false);
    expect(o.plugins?.tooltip).toMatchObject({ backgroundColor: 'VALUE', padding: 8 });
    expect(o.layout?.padding).toEqual({ top: 12, right: 8, bottom: 0, left: 0 });
    expect(o.maintainAspectRatio).toBe(false);
  });

  it('animates for 250ms normally', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(baseChartOptions(tokens).animation).toEqual({ duration: 250 });
  });

  it('disables animation under prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(baseChartOptions(tokens).animation).toBe(false);
  });
});
