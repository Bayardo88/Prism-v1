import type { ChartConfiguration } from 'chart.js';
import { ChartCanvas } from './ChartCanvas.js';
import { baseChartOptions, chartScaffold } from './chartSetup.js';
import { directLabelsPlugin, waterfallConnectorsPlugin } from './plugins.js';
import type { ChartTokens } from './chartTokens.js';

export interface WaterfallStep {
  label: string;
  /** Positive or negative delta. When `total` is true this is the absolute figure. */
  value: number;
  /** An anchored total bar rather than a floating delta. */
  total?: boolean;
}

export interface WaterfallChartProps {
  steps: WaterfallStep[];
  title: string;
  format?: (value: number) => string;
  height?: number;
  className?: string;
}

/**
 * Waterfall Chart — how a starting figure becomes an ending figure, step by
 * step.
 *
 * Totals are anchored to the baseline and rounded on top only, because they
 * touch it. Deltas float and are rounded on all four corners, because they do
 * not. Totals take Chart/Total; deltas take Chart/Positive or Chart/Negative.
 *
 * Every bar is directly labelled — a waterfall is read as arithmetic, not as a
 * shape, so the numbers are not optional. Connectors carry the running total
 * between steps.
 */
export function WaterfallChart({ steps, title, format = String, height = 260, className }: WaterfallChartProps) {
  // Walk the steps once to find each bar's span on the value axis.
  let running = 0;
  const bars = steps.map((step) => {
    if (step.total) {
      running = step.value;
      return { from: 0, to: step.value, step };
    }
    const from = running;
    running += step.value;
    return { from, to: running, step };
  });

  const build = (t: ChartTokens): ChartConfiguration<'bar'> => {
    const scales = chartScaffold(t, 'horizontal', format);
    return {
      type: 'bar',
      data: {
        labels: steps.map((s) => s.label),
        datasets: [
          {
            label: title,
            // Floating bars: Chart.js takes a [from, to] pair per point.
            data: bars.map((b) => [b.from, b.to] as [number, number]),
            backgroundColor: bars.map((b) =>
              b.step.total ? t.total : b.to >= b.from ? t.positive : t.negative,
            ),
            // Totals touch the baseline so they round on top only; deltas float
            // and round on all four corners.
            borderRadius: bars.map((b) => (b.step.total ? { topLeft: 4, topRight: 4 } : 4)),
            borderSkipped: false as const,
          },
        ],
      },
      options: {
        ...baseChartOptions(t),
        scales: { x: scales.x, y: scales.y },
        plugins: {
          ...baseChartOptions(t).plugins,
          tooltip: {
            ...baseChartOptions(t).plugins?.tooltip,
            callbacks: {
              label: (ctx) => {
                const bar = bars[ctx.dataIndex];
                if (!bar) return '';
                return bar.step.total ? format(bar.to) : format(bar.step.value);
              },
            },
          },
        },
      },
      plugins: [
        waterfallConnectorsPlugin(t),
        directLabelsPlugin({
          tokens: t,
          format,
          // Label the delta, not the end point — the delta is what the step did.
          valueAt: (_di, i) => {
            const bar = bars[i];
            if (!bar) return null;
            return bar.step.total ? bar.to : bar.step.value;
          },
        }),
      ],
    };
  };

  return (
    <ChartCanvas
      build={build}
      title={title}
      height={height}
      className={className}
      table={{
        columns: ['Step', 'Change', 'Running total'],
        rows: bars.map((b) => [
          b.step.label,
          b.step.total ? '—' : format(b.step.value),
          format(b.to),
        ]),
      }}
    />
  );
}
