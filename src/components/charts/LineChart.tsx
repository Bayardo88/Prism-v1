import type { ChartConfiguration } from 'chart.js';
import { forwardRef } from 'react';
import { ChartCanvas, type ChartRootProps } from './ChartCanvas.js';
import { ChartLegend } from './ChartLegend.js';
import { baseChartOptions, chartScaffold, type ChartGrid } from './chartSetup.js';
import { SERIES_COUNT } from './series.js';
import type { ChartTokens } from './chartTokens.js';

export type LineChartType = 'line' | 'area';

export interface LineChartProps extends ChartRootProps {
  categories: string[];
  series: Array<{ label: string; values: number[] }>;
  /**
   * Area is for a single cumulative quantity or a part-to-whole over time.
   * With more than three overlapping series it becomes unreadable — use Line.
   */
  type?: LineChartType;
  grid?: ChartGrid;
  title: string;
  format?: (value: number) => string;
  categoryLabel?: string;
  height?: number;
}

/**
 * Line Chart — change over time.
 *
 * Marks: 2px strokes with round caps and joins, 8px markers ringed 2px in the
 * surface colour so overlapping points stay separable. Points sit at band
 * centres so they align with the category labels.
 *
 * Area fills are painted largest first so smaller series are never buried.
 *
 * Never use two y-scales on one chart: two measures of different magnitude
 * become two charts, or one indexed to a common base.
 */
export const LineChart = forwardRef<HTMLElement, LineChartProps>(function LineChart({
  categories, series, type = 'line', grid = 'horizontal',
  title, format = String, categoryLabel = 'Category', height = 240, ...rest
}, ref) {
  const area = type === 'area';

  const build = (t: ChartTokens): ChartConfiguration<'line'> => {
    const scales = chartScaffold(t, grid, format);

    // Largest total first, so a bigger fill never buries a smaller one.
    const paintOrder: Record<number, number> = {};
    series
      .map((s, i) => ({ i, total: s.values.reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total)
      .forEach((entry, rank) => { paintOrder[entry.i] = rank; });

    return {
      type: 'line',
      data: {
        labels: categories,
        datasets: series.map((s, i) => ({
          label: s.label,
          data: s.values,
          borderColor: t.series[i % SERIES_COUNT],
          backgroundColor: area ? t.seriesSubtle[i % SERIES_COUNT] : t.series[i % SERIES_COUNT],
          fill: area ? 'origin' : false,
          order: paintOrder[i] ?? i,
          tension: 0,
          borderWidth: 2,
          borderCapStyle: 'round' as const,
          borderJoinStyle: 'round' as const,
          pointRadius: 4,
          pointHoverRadius: 5,
          pointBackgroundColor: t.series[i % SERIES_COUNT],
          pointBorderColor: t.surface,
          pointBorderWidth: 2,
        })),
      },
      options: {
        ...baseChartOptions(t),
        scales: { x: scales.x, y: scales.y },
        interaction: { mode: 'index' as const, intersect: false },
      },
    };
  };

  return (
    <ChartCanvas
      ref={ref}
      {...rest}
      build={build}
      title={title}
      height={height}
      table={{
        columns: [categoryLabel, ...series.map((s) => s.label)],
        rows: categories.map((c, ci) => [c, ...series.map((s) => s.values[ci] === undefined ? '' : format(s.values[ci]))]),
      }}
    >
      <ChartLegend labels={series.map((s) => s.label)} />
    </ChartCanvas>
  );
});
