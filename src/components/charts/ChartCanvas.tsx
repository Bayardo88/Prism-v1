import { useEffect, useRef, type ReactNode } from 'react';
import { Chart, type ChartConfiguration, type ChartType } from 'chart.js';
import { cx } from '../../utils/cx.js';
import { registerScalarCharts } from './chartSetup.js';
import { useChartTokens } from './useChartTokens.js';
import type { ChartTokens } from './chartTokens.js';

export interface ChartDataTable {
  /** Column headings: the category axis label followed by one per series. */
  columns: string[];
  /** One row per category: the category name followed by its formatted values. */
  rows: Array<Array<string | number>>;
}

export interface ChartCanvasProps<T extends ChartType = ChartType> {
  /** Builds the Chart.js config from resolved tokens. Re-run on theme change. */
  build: (tokens: ChartTokens) => ChartConfiguration<T>;
  /**
   * The accessible name of the chart. A canvas is opaque to assistive
   * technology, so this is the only thing a screen reader gets from the
   * drawing itself.
   */
  title: string;
  /**
   * The same numbers as a table, rendered visually hidden beside the canvas.
   * Without it the data is unreachable without sight. Charts in this package
   * always supply one.
   */
  table?: ChartDataTable;
  height?: number;
  children?: ReactNode;
  className?: string;
}

/**
 * The canvas shell every Scalar chart is drawn in.
 *
 * Owns three things the individual charts should not each re-solve: the
 * Chart.js lifecycle, re-resolving tokens when the theme changes, and the
 * screen-reader fallback.
 */
export function ChartCanvas<T extends ChartType = ChartType>({
  build, title, table, height = 240, children, className,
}: ChartCanvasProps<T>) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const tokens = useChartTokens(hostRef);

  useEffect(() => {
    if (!tokens || !canvasRef.current) return;
    registerScalarCharts();

    const chart = new Chart(canvasRef.current, build(tokens) as ChartConfiguration);
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
    // `build` is rebuilt every render by design — the token object is the real
    // dependency, and it only changes when the theme does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens]);

  return (
    <figure ref={hostRef} className={cx('scalar-chart-figure', className)}>
      <div className="scalar-chart-canvas" style={{ height }}>
        <canvas ref={canvasRef} role="img" aria-label={title} />
      </div>
      {children}
      {table && (
        <table className="scalar-visually-hidden">
          <caption>{title}</caption>
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row">{cell}</th>
                  ) : (
                    <td key={j}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  );
}
