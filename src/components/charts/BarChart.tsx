import type { ChartConfiguration } from 'chart.js';
import { ChartCanvas } from './ChartCanvas.js';
import { ChartLegend } from './ChartLegend.js';
import { baseChartOptions, chartScaffold, type ChartGrid } from './chartSetup.js';
import { directLabelsPlugin } from './plugins.js';
import type { ChartTokens } from './chartTokens.js';

export interface BarChartProps {
  categories: string[];
  /** One entry per series, each the length of `categories`. */
  series: Array<{ label: string; values: number[] }>;
  /**
   * Grouped compares series within each category. Stacked shows composition
   * and a total — use it only when the total is meaningful. If readers need to
   * compare the middle segments, use small multiples: a stacked segment that
   * does not sit on the baseline cannot be compared by eye.
   */
  type?: 'grouped' | 'stacked';
  grid?: ChartGrid;
  title: string;
  format?: (value: number) => string;
  /** The category axis name, used in the screen-reader table. */
  categoryLabel?: string;
  height?: number;
  className?: string;
}

/**
 * Bar Chart — magnitude compared across categories.
 *
 * Marks follow the house spec: bars anchored to the baseline with 4px rounded
 * tops only, and a 2px surface gap between adjacent bars and between stacked
 * segments.
 *
 * Accessibility: always ships a legend and a screen-reader data table. With
 * three or more series it also turns on direct labels, because the
 * Chart/Series ramp has not passed CVD validation.
 */
export function BarChart({
  categories, series, type = 'grouped', grid = 'horizontal',
  title, format = String, categoryLabel = 'Category', height = 240, className,
}: BarChartProps) {
  const stacked = type === 'stacked';

  /**
   * Direct labels, and where they go.
   *
   * Grouped: label every bar. Three or more series hits the unresolved
   * Series 2/3 CVD clash, so identity cannot rest on the legend alone, and a
   * label above a grouped bar lands on the page background where it is legible.
   *
   * Stacked: label the column total only. A per-segment label sits on top of
   * the segment above it, which puts dark text on a dark fill — and there is no
   * per-series on-colour token to switch to. Stacked bars carry identity by
   * stack order instead, which is a non-colour channel and is stable across
   * categories, and the total is the reason to stack in the first place.
   */
  const directLabels = stacked || series.length >= 3 || series.length === 1;
  const topDataset = series.length - 1;
  const columnTotal = (ci: number) => series.reduce((sum, s) => sum + (s.values[ci] ?? 0), 0);

  const build = (t: ChartTokens): ChartConfiguration<'bar'> => {
    const scales = chartScaffold(t, grid, format);
    return {
      type: 'bar',
      data: {
        labels: categories,
        datasets: series.map((s, i) => ({
          label: s.label,
          data: s.values,
          backgroundColor: t.series[i % 8],
          // Rounded tops only: the bar is anchored to the baseline. In a stack
          // only the topmost segment gets the radius.
          borderRadius: !stacked || i === series.length - 1 ? 4 : 0,
          borderSkipped: 'bottom' as const,
          // The 2px surface gap between stacked segments.
          ...(stacked ? { borderColor: t.surface, borderWidth: { top: 2 } } : {}),
        })),
      },
      options: {
        ...baseChartOptions(t),
        scales: {
          x: { ...scales.x, stacked },
          y: { ...scales.y, stacked },
        },
        // Leaves a 2px-equivalent gap between adjacent bars in a group.
        datasets: { bar: { categoryPercentage: 0.7, barPercentage: 0.9 } },
      },
      plugins: directLabels
        ? [
            directLabelsPlugin({
              tokens: t,
              format,
              valueAt: stacked
                ? (di, i) => (di === topDataset ? columnTotal(i) : null)
                : undefined,
            }),
          ]
        : [],
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
