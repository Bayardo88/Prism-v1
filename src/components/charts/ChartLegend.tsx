import { forwardRef, type HTMLAttributes, type LiHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { seriesColor } from './series.js';

export interface ChartLegendItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** Zero-based series index. The ramp is a fixed categorical order. */
  series: number;
  children?: ReactNode;
}

/**
 * Chart Legend Item — a colour swatch plus the series name. Render inside a
 * `ChartLegend` (a list).
 *
 * A legend is mandatory whenever a chart shows two or more series: identity
 * must never rest on colour alone. Where four or fewer series are plotted, also
 * direct-label them on the chart. The swatch is decorative (`aria-hidden`); the
 * text is the content. The legend is a static key, not a toggle.
 */
export const ChartLegendItem = forwardRef<HTMLLIElement, ChartLegendItemProps>(function ChartLegendItem(
  { series, children, className, ...rest },
  ref,
) {
  return (
    <li ref={ref} className={cx('scalar-chart-legend-item', className)} {...rest}>
      <span className="scalar-chart-legend-item__swatch" aria-hidden style={{ background: seriesColor(series) }} />
      {children}
    </li>
  );
});

export interface ChartLegendProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  labels: ReactNode[];
  /** Index of the series currently emphasised on the chart; marked `aria-current`. */
  current?: number;
}

/** Chart Legend — the list of legend items under a chart. Named "Legend" unless you pass `aria-label`. */
export const ChartLegend = forwardRef<HTMLUListElement, ChartLegendProps>(function ChartLegend(
  { labels, current, className, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  return (
    <ul
      ref={ref}
      className={cx('scalar-chart-legend', className)}
      aria-label={rest['aria-labelledby'] ? undefined : (ariaLabel ?? 'Legend')}
      {...rest}
    >
      {labels.map((label, i) => (
        <ChartLegendItem
          key={typeof label === 'string' || typeof label === 'number' ? `${label}-${i}` : i}
          series={i}
          aria-current={current === i ? 'true' : undefined}
        >
          {label}
        </ChartLegendItem>
      ))}
    </ul>
  );
});
