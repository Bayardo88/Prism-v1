import { cx } from '../../utils/cx.js';
import { ChartFrame, PLOT, type ChartGrid } from './ChartFrame.js';
import { ChartLegend } from './ChartLegend.js';
import { seriesColor, seriesSubtleColor } from './series.js';

export interface LineChartProps {
  categories: string[];
  series: Array<{ label: string; values: number[] }>;
  /**
   * Area is for a single cumulative quantity or a part-to-whole over time.
   * With more than three overlapping series it becomes unreadable — use Line.
   */
  type?: 'line' | 'area';
  grid?: ChartGrid;
  title?: string;
  format?: (value: number) => string;
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
  categories, series, type = 'line', grid = 'horizontal', title, format = String, className,
}: LineChartProps) {
  const { x, y, width, height } = PLOT;
  const band = width / Math.max(categories.length, 1);
  const max = Math.max(...series.flatMap((s) => s.values), 0);
  const scale = max > 0 ? height / max : 0;
  const ticks = Array.from({ length: 5 }, (_, i) => format((max / 4) * (4 - i)));

  const pointsFor = (values: number[]) =>
    values.map((v, i) => ({ px: x + band * i + band / 2, py: y + height - v * scale }));

  // Largest first, so smaller series are never buried under a bigger fill.
  const paintOrder = series
    .map((s, i) => ({ s, i, total: s.values.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total);

  return (
    <figure className={cx('scalar-chart-figure', className)}>
      <ChartFrame ticks={ticks} categories={categories} grid={grid} title={title}>
        {type === 'area' &&
          paintOrder.map(({ s, i }) => {
            const pts = pointsFor(s.values);
            if (pts.length === 0) return null;
            const d =
              `M ${pts[0]!.px} ${y + height} ` +
              pts.map((p) => `L ${p.px} ${p.py}`).join(' ') +
              ` L ${pts[pts.length - 1]!.px} ${y + height} Z`;
            return <path key={`area-${i}`} d={d} fill={seriesSubtleColor(i)} />;
          })}

        {series.map((s, i) => {
          const pts = pointsFor(s.values);
          return (
            <polyline
              key={`line-${i}`}
              points={pts.map((p) => `${p.px},${p.py}`).join(' ')}
              fill="none"
              stroke={seriesColor(i)}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {series.map((s, i) =>
          pointsFor(s.values).map((p, pi) => (
            <circle
              key={`m-${i}-${pi}`}
              className="scalar-chart__marker-ring"
              cx={p.px}
              cy={p.py}
              r={4}
              fill={seriesColor(i)}
            />
          )),
        )}
      </ChartFrame>
      <ChartLegend labels={series.map((s) => s.label)} />
    </figure>
  );
}
