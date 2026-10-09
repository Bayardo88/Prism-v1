import { createRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { checkA11y } from '../../test/render.js';

// A canvas is not available in jsdom: replace the react-chartjs-2 binding with a recording stub.
// (The binding owns the Chart.js instance; what Scalar owns is the props it is handed and when it is re-keyed.)
const h = vi.hoisted(() => ({
  mounts: [] as Array<Record<string, unknown>>,
  renders: [] as Array<Record<string, unknown>>,
  unmounts: 0,
}));

vi.mock('react-chartjs-2', async () => {
  const React = await import('react');
  const Chart = (props: Record<string, unknown>) => {
    h.renders.push(props);
    React.useEffect(() => {
      h.mounts.push({});
      return () => { h.unmounts += 1; };
    }, []);
    return React.createElement('canvas', {
      role: props.role as string,
      'aria-label': props['aria-label'] as string,
      'aria-describedby': props['aria-describedby'] as string | undefined,
    });
  };
  return { Chart };
});

const { ChartCanvas } = await import('./ChartCanvas.js');
const { BarChart } = await import('./BarChart.js');
const { LineChart } = await import('./LineChart.js');
const { DonutChart } = await import('./DonutChart.js');
const { WaterfallChart } = await import('./WaterfallChart.js');
const { ChartLegend } = await import('./ChartLegend.js');

beforeEach(() => { h.mounts.length = 0; h.renders.length = 0; h.unmounts = 0; });
const lastData = () => (h.renders[h.renders.length - 1]!.data as { datasets: Array<{ data: number[] }> }).datasets[0]!.data;

const cfg = (values: number[]) => () => ({
  type: 'bar' as const,
  data: { labels: ['a', 'b'], datasets: [{ label: 'x', data: values }] },
  options: {},
});

describe('ChartCanvas', () => {
  it('creates one chart and destroys it on unmount', () => {
    const { unmount } = render(<ChartCanvas title="T" build={cfg([1, 2])} />);
    expect(h.mounts).toHaveLength(1);
    unmount();
    expect(h.unmounts).toBe(1);
  });

  it('updates the live chart in place when data changes (no stale chart)', () => {
    const { rerender } = render(<ChartCanvas title="T" build={cfg([1, 2])} />);
    expect(h.mounts).toHaveLength(1);

    rerender(<ChartCanvas title="T" build={cfg([5, 9])} />);
    expect(h.mounts).toHaveLength(1); // not recreated: same keyed instance
    expect(h.unmounts).toBe(0);
    expect(lastData()).toEqual([5, 9]);
  });

  it('recreates the chart when the chart type changes', () => {
    const { rerender } = render(<ChartCanvas title="T" build={cfg([1, 2])} />);
    rerender(<ChartCanvas title="T" build={() => ({ ...cfg([1, 2])(), type: 'line' as const })} />);
    expect(h.mounts).toHaveLength(2);
    expect(h.unmounts).toBe(1);
  });

  it('forwards ref, className and data-testid; names the canvas and links the table', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <ChartCanvas ref={ref} title="Revenue" className="x" data-testid="c" build={cfg([1])}
        table={{ columns: ['Cat', 'v'], rows: [['a', 1]] }} />,
    );
    expect(ref.current).toBe(screen.getByTestId('c'));
    expect(ref.current).toHaveClass('x');
    const canvas = screen.getByRole('img', { name: 'Revenue' });
    const tableId = canvas.getAttribute('aria-describedby')!;
    expect(container.querySelector(`table#${CSS.escape(tableId)}`)).not.toBeNull();
    expect((await checkA11y(container)).violations).toEqual([]);
  });
});

describe('chart components', () => {
  const base = { categories: ['Q1', 'Q2'], series: [{ label: 'A', values: [1, 2] }, { label: 'B', values: [3, 4] }] };

  it.each([
    ['BarChart', (p: object) => <BarChart title="Bars" {...base} {...p} />],
    ['LineChart', (p: object) => <LineChart title="Lines" {...base} {...p} />],
    ['DonutChart', (p: object) => <DonutChart title="Donut" slices={[{ label: 'A', value: 1 }, { label: 'B', value: 3 }]} {...p} />],
    ['WaterfallChart', (p: object) => <WaterfallChart title="Water" steps={[{ label: 'Start', value: 10, total: true }, { label: 'Up', value: 5 }, { label: 'Down', value: -3 }]} {...p} />],
  ])('%s: axe-clean, forwards ref/className/data-testid', async (_n, make) => {
    const ref = createRef<HTMLElement>();
    const { container } = render(make({ ref, className: 'extra', 'data-testid': 'chart' }));
    expect(ref.current).toBe(screen.getByTestId('chart'));
    expect(ref.current).toHaveClass('scalar-chart-figure', 'extra');
    expect((await checkA11y(container)).violations).toEqual([]);
  });

  it('BarChart redraws when its series change', () => {
    const { rerender } = render(<BarChart title="B" {...base} />);
    rerender(<BarChart title="B" {...base} series={[{ label: 'A', values: [9, 9] }]} />);
    expect(h.mounts).toHaveLength(1);
    expect(lastData()).toEqual([9, 9]);
  });

  it('Waterfall table signs deltas', () => {
    render(<WaterfallChart title="W" steps={[{ label: 'Start', value: 10, total: true }, { label: 'Up', value: 5 }, { label: 'Down', value: -3 }]} />);
    expect(screen.getByText('+5')).toBeInTheDocument();
    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  it('Donut formats the table values and marks the focused legend item', () => {
    render(<DonutChart title="D" slices={[{ label: 'A', value: 1 }, { label: 'B', value: 3 }]} format={(v) => `$${v}`} focusedIndex={1} />);
    expect(screen.getByText('$3')).toBeInTheDocument();
    expect(screen.getByText(/^B · 75%/).closest('li')).toHaveAttribute('aria-current', 'true');
  });
});

describe('ChartLegend', () => {
  it('is a named list, forwards ref/className/data-testid', async () => {
    const ref = createRef<HTMLUListElement>();
    const { container } = render(<ChartLegend ref={ref} labels={['A', 'B']} className="k" data-testid="lg" />);
    expect(screen.getByRole('list', { name: 'Legend' })).toBe(ref.current);
    expect(ref.current).toHaveClass('k');
    expect(screen.getByTestId('lg')).toBe(ref.current);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect((await checkA11y(container)).violations).toEqual([]);
  });
});
