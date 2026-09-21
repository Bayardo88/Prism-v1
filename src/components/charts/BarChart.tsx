import { cx } from '../../utils/cx.js';
import { ChartFrame, PLOT, type ChartGrid } from './ChartFrame.js';
import { ChartLegend } from './ChartLegend.js';
import { seriesColor } from './series.js';

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
  title?: string;
  /** Formats the y-axis ticks and any direct labels. */
  format?: (value: number) => string;
  className?: string;
}

const GAP = 2; // 2px surface gap between adjacent bars and stacked segments.
const RADIUS = 4; // Rounded tops only — bars are anchored to the baseline.

/**
 * Bar Chart — magnitude compared across categories.
 *
 * Marks follow the house spec: bars anchored to the baseline with 4px rounded
 * tops only, and a 2px surface gap between adjacent bars and stacked segments.
 *
 * Accessibility: the Chart/Series ramp has not passed CVD validation in Light
 * mode, so this chart always ships a legend. With three or more series, add
 * direct labels or spatial separation as well.
 */
export function BarChart({
  categories, series, type = 'grouped', grid = 'horizontal', title, format = String, className,
}: BarChartProps) {
  const { x, y, width, height } = PLOT;
  const bandWidth = width / Math.max(categories.length, 1);

  const max =
    type === 'stacked'
      ? Math.max(...categories.map((_, ci) => series.reduce((sum, s) => sum + (s.values[ci] ?? 0), 0)), 0)
      : Math.max(...series.flatMap((s) => s.values), 0);
  const scale = max > 0 ? height / max : 0;

  const ticks = Array.from({ length: 5 }, (_, i) => format((max / 4) * (4 - i)));

  return (
    <figure className={cx('scalar-chart-figure', className)}>
      <ChartFrame ticks={ticks} categories={categories} grid={grid} title={title}>
        {categories.map((_, ci) => {
          const bandX = x + bandWidth * ci;

          if (type === 'stacked') {
            let cursor = y + height;
            return series.map((s, si) => {
              const value = s.values[ci] ?? 0;
              const h = Math.max(value * scale - GAP, 0);
              cursor -= h + GAP;
              const isTop = si === series.length - 1;
              return (
                <rect
                  key={`${ci}-${si}`}
                  x={bandX + bandWidth * 0.2}
                  y={cursor}
                  width={bandWidth * 0.6}
                  height={h}
                  rx={isTop ? RADIUS : 0}
                  fill={seriesColor(si)}
                />
              );
            });
          }

          const slot = (bandWidth * 0.7) / Math.max(series.length, 1);
          return series.map((s, si) => {
            const value = s.values[ci] ?? 0;
            const h = value * scale;
            return (
              <rect
                key={`${ci}-${si}`}
                x={bandX + bandWidth * 0.15 + slot * si + GAP / 2}
                y={y + height - h}
                width={Math.max(slot - GAP, 1)}
                height={h}
                rx={RADIUS}
                fill={seriesColor(si)}
              />
            );
          });
        })}
      </ChartFrame>
      <ChartLegend labels={series.map((s) => s.label)} />
    </figure>
  );
}
