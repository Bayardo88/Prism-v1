import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { seriesColor } from './series.js';

export interface ChartLegendItemProps {
  /** Zero-based series index. The ramp is a fixed categorical order. */
  series: number;
  children?: ReactNode;
  className?: string;
}

/**
 * Chart Legend Item — a colour swatch plus the series name.
 *
 * A legend is mandatory whenever a chart shows two or more series: identity
 * must never rest on colour alone. Where four or fewer series are plotted, also
 * direct-label them on the chart.
 */
export function ChartLegendItem({ series, children, className }: ChartLegendItemProps) {
  return (
    <span className={cx('scalar-chart-legend-item', className)}>
      <span className="scalar-chart-legend-item__swatch" style={{ background: seriesColor(series) }} />
      {children}
    </span>
  );
}

export interface ChartLegendProps {
  labels: ReactNode[];
  className?: string;
}

/** Chart Legend — the run of legend items under a chart. */
export function ChartLegend({ labels, className }: ChartLegendProps) {
  return (
    <div className={cx('scalar-chart-legend', className)}>
      {labels.map((label, i) => (
        <ChartLegendItem key={i} series={i}>
          {label}
        </ChartLegendItem>
      ))}
    </div>
  );
}
