import { cx } from '../../utils/cx.js';
import { ChartLegend } from './ChartLegend.js';
import { seriesColor, seriesSubtleColor } from './series.js';

export interface DonutSlice {
  label: string;
  value: number;
}

export interface DonutChartProps {
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
  title?: string;
  className?: string;
}

const SIZE = 200;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2; // 2px surface gap between segments.

/**
 * Donut Chart — part-to-whole for a single composition, with the total held in
 * the middle.
 *
 * A donut answers "what is the split". It cannot answer "how did the split
 * change" — that is a stacked bar over time.
 *
 * Every slice is labelled with its share in the legend, so identity never rests
 * on colour.
 */
export function DonutChart({ slices, total, caption, focusedIndex, title, className }: DonutChartProps) {
  const sum = slices.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;

  return (
    <figure className={cx('scalar-chart-figure', className)}>
      <svg className="scalar-chart" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={title}>
        {title && <title>{title}</title>}
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {slices.map((slice, i) => {
            const fraction = slice.value / sum;
            const length = Math.max(fraction * CIRCUMFERENCE - GAP, 0);
            const dash = `${length} ${CIRCUMFERENCE - length}`;
            const dashOffset = -offset;
            offset += fraction * CIRCUMFERENCE;

            const dimmed = focusedIndex !== undefined && focusedIndex !== i;
            return (
              <circle
                key={slice.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={dimmed ? seriesSubtleColor(i) : seriesColor(i)}
                strokeWidth={STROKE}
                strokeDasharray={dash}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </g>
        {total && (
          <text
            x={SIZE / 2}
            y={SIZE / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="scalar-chart__value"
            style={{ fontSize: 'var(--font-size-heading-2xl)' }}
          >
            {total}
          </text>
        )}
        {caption && (
          <text x={SIZE / 2} y={SIZE / 2 + 22} textAnchor="middle" className="scalar-chart__category">
            {caption}
          </text>
        )}
      </svg>
      <ChartLegend
        labels={slices.map((s) => `${s.label} · ${Math.round((s.value / sum) * 100)}%`)}
      />
    </figure>
  );
}
