import type { ChartConfiguration } from 'chart.js';
import { ChartCanvas } from './ChartCanvas.js';
import { ChartLegend } from './ChartLegend.js';
import { baseChartOptions, chartScaffold, type ChartGrid } from './chartSetup.js';
import type { ChartTokens } from './chartTokens.js';

export interface LineChartProps {
  categories: string[];
  series: Array<{ label: string; values: number[] }>;
  /**
   * Area is for a single cumulative quantity or a part-to-whole over time.
   * With more than three overlapping series it becomes unreadable — use Line.
   */
  type?: 'line' | 'area';
  grid?: ChartGrid;
  title: string;
  format?: (value: number) => string;
  categoryLabel?: string;
  height?: number;
  className?: string;
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
export function LineChart({
  categories, series, type = 'line', grid = 'horizontal',
  title, format = String, categoryLabel = 'Category', height = 240, className,
}: LineChartProps) {
  const area = type === 'area';

  const build = (t: ChartTokens): ChartConfiguration<'line'> => {
    const scales = chartScaffold(t, grid, format);

    // Largest total first, so a bigger fill never buries a smaller one.
    const paintOrder = series
      .map((s, i) => ({ i, total: s.values.reduce((a, b) => a + b, 0) }))
      .sort((a, b) => b.total - a.total)
      .reduce<Record<number, number>>((acc, entry, rank) => ({ ...acc, [entry.i]: rank }), {});

    return {
      type: 'line',
      data: {
        labels: categories,
        datasets: series.map((s, i) => ({
          label: s.label,
          data: s.values,
          borderColor: t.series[i % 8],
          backgroundColor: area ? t.seriesSubtle[i % 8] : t.series[i % 8],
          fill: area ? 'origin' : false,
          order: paintOrder[i] ?? i,
          tension: 0,
          borderWidth: 2,
          borderCapStyle: 'round' as const,
          borderJoinStyle: 'round' as const,
          pointRadius: 4,
          pointHoverRadius: 5,
          pointBackgroundColor: t.series[i % 8],
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
      build={build}
      title={title}
      height={height}
      className={className}
      table={{
        columns: [categoryLabel, ...series.map((s) => s.label)],
        rows: categories.map((c, ci) => [c, ...series.map((s) => format(s.values[ci] ?? 0))]),
      }}
    >
      <ChartLegend labels={series.map((s) => s.label)} />
    </ChartCanvas>
  );
}
