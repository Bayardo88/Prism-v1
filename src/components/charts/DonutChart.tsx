import type { ChartConfiguration } from 'chart.js';
import { forwardRef } from 'react';
import { ChartCanvas, type ChartRootProps } from './ChartCanvas.js';
import { ChartLegend } from './ChartLegend.js';
import { baseChartOptions } from './chartSetup.js';
import { donutCenterPlugin } from './plugins.js';
import { SERIES_COUNT } from './series.js';
import type { ChartTokens } from './chartTokens.js';

export interface DonutSlice {
  label: string;
  value: number;
}

export interface DonutChartProps extends ChartRootProps {
  /** Eight slices is the ceiling. Past that, sort descending and fold the tail. */
  slices: DonutSlice[];
  /** The figure held in the middle. */
  total?: string;
  caption?: string;
  /**
   * Keeps one series at full strength and drops the rest to their Subtle steps,
   * for hover and for drill-down.
   */
  focusedIndex?: number;
  title: string;
  /** Formats the Value column of the screen-reader table. Defaults to the raw number. */
  format?: (value: number) => string;
  height?: number;
}

/**
 * Donut Chart — part-to-whole for a single composition, with the total held in
 * the middle.
 *
 * A donut answers "what is the split". It cannot answer "how did the split
 * change" — that is a stacked bar over time.
 *
 * Segments are separated by a 2px surface gap, and every slice is labelled with
 * its share in the legend, so identity never rests on colour.
 */
export const DonutChart = forwardRef<HTMLElement, DonutChartProps>(function DonutChart({
  slices, total, caption, focusedIndex, title, format = String, height = 260, ...rest
}, ref) {
  const sum = slices.reduce((a, s) => a + s.value, 0) || 1;
  const share = (v: number) => `${Math.round((v / sum) * 100)}%`;

  const build = (t: ChartTokens): ChartConfiguration<'doughnut'> => ({
    type: 'doughnut',
    data: {
      labels: slices.map((s) => s.label),
      datasets: [
        {
          data: slices.map((s) => s.value),
          backgroundColor: slices.map((_, i) =>
            focusedIndex !== undefined && focusedIndex !== i
              ? t.seriesSubtle[i % SERIES_COUNT]
              : t.series[i % SERIES_COUNT],
          ),
          // The 2px surface gap between segments.
          borderColor: t.surface,
          borderWidth: 2,
        },
      ],
    },
    options: {
      ...baseChartOptions<'doughnut'>(t),
      cutout: '62%',
    },
    plugins: [donutCenterPlugin({ tokens: t, total, caption })],
  });

  return (
    <ChartCanvas
      ref={ref}
      {...rest}
      build={build}
      title={title}
      height={height}
      table={{
        columns: ['Slice', 'Value', 'Share'],
        rows: slices.map((s) => [s.label, format(s.value), share(s.value)]),
      }}
    >
      <ChartLegend current={focusedIndex} labels={slices.map((s) => `${s.label} · ${share(s.value)}`)} />
    </ChartCanvas>
  );
});
