import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

/** Vertical gridlines are only worth their ink when readers compare across the
 * category axis, so Horizontal is the default. */
export type ChartGrid = 'horizontal' | 'both' | 'none';

export const PLOT = { x: 48, y: 8, width: 416, height: 192 } as const;
export const FRAME = { width: 528, height: 248 } as const;

export interface ChartFrameProps {
  /** Y-axis tick labels, top to bottom. */
  ticks?: string[];
  /** X-axis category labels, left to right. */
  categories?: string[];
  grid?: ChartGrid;
  children?: ReactNode;
  title?: string;
  className?: string;
}

/**
 * Chart Frame — the plot scaffold every chart is drawn on: y-axis ticks, x-axis
 * categories, axis rules and optional gridlines.
 *
 * Plot area is 416 × 192 at an origin of 48, 8. Geometry is deliberately
 * absolute rather than a flex stack — a plot area is a coordinate space.
 */
export function ChartFrame({ ticks = [], categories = [], grid = 'horizontal', children, title, className }: ChartFrameProps) {
  const { x, y, width, height } = PLOT;
  const rows = Math.max(ticks.length - 1, 1);
  const bandWidth = categories.length ? width / categories.length : width;

  return (
    <svg
      className={cx('scalar-chart', className)}
      viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
      role="img"
      aria-label={title}
    >
      {title && <title>{title}</title>}

      {/* Horizontal gridlines, one per tick. */}
      {(grid === 'horizontal' || grid === 'both') &&
        ticks.map((_, i) => {
          const gy = y + (height / rows) * i;
          return <line key={`h${i}`} className="scalar-chart__grid" x1={x} y1={gy} x2={x + width} y2={gy} />;
        })}

      {/* Vertical gridlines on band boundaries. */}
      {grid === 'both' &&
        categories.map((_, i) => {
          const gx = x + bandWidth * i;
          return <line key={`v${i}`} className="scalar-chart__grid" x1={gx} y1={y} x2={gx} y2={y + height} />;
        })}

      {/* Axis rules. */}
      <line className="scalar-chart__axis" x1={x} y1={y} x2={x} y2={y + height} />
      <line className="scalar-chart__axis" x1={x} y1={y + height} x2={x + width} y2={y + height} />

      {ticks.map((t, i) => (
        <text key={t + i} className="scalar-chart__tick" x={x - 8} y={y + (height / rows) * i + 4} textAnchor="end">
          {t}
        </text>
      ))}

      {categories.map((c, i) => (
        <text
          key={c + i}
          className="scalar-chart__category"
          x={x + bandWidth * i + bandWidth / 2}
          y={y + height + 20}
          textAnchor="middle"
        >
          {c}
        </text>
      ))}

      {children}
    </svg>
  );
}
