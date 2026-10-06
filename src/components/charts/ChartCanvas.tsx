import { forwardRef, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Chart, type ChartConfiguration, type Plugin } from 'chart.js';
import { composeRefs } from '../../utils/refs.js';
import { cx } from '../../utils/cx.js';
import { useLatestRef } from '../../utils/useLatestRef.js';
import { registerScalarCharts } from './chartSetup.js';
import { useChartTokens } from './useChartTokens.js';
import type { ChartTokens } from './chartTokens.js';

export interface ChartDataTable {
  /** Column headings: the category axis label followed by one per series. */
  columns: string[];
  /** One row per category: the category name followed by its formatted values. */
  rows: Array<Array<string | number>>;
}

/** Native `<figure>` props every chart accepts (ref, className, data-*, aria-*, handlers). `title` is the chart's name. */
export type ChartRootProps = Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'>;

export interface ChartCanvasProps extends ChartRootProps {
  /**
   * Builds the Chart.js config from resolved tokens. Called on every render;
   * the chart is updated in place whenever the data or options it returns
   * change, and recreated only when the theme tokens or chart type change.
   */
  // Chart.js config generics differ per chart type; the canvas is type-agnostic.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build: (tokens: ChartTokens) => ChartConfiguration<any>;
  /**
   * The accessible name of the chart. A canvas is opaque to assistive
   * technology, so this is the only thing a screen reader gets from the
   * drawing itself.
   */
  title: string;
  /**
   * The same numbers as a table, rendered visually hidden beside the canvas and
   * referenced from the canvas with `aria-describedby`. Without it the data is
   * unreachable without sight. Charts in this package always supply one.
   */
  table?: ChartDataTable;
  height?: number;
  children?: ReactNode;
}

/** The hooks the Scalar plugins use. Chart.js reads plugin hooks off the object, so each is delegated. */
const DELEGATED_HOOKS = ['beforeDatasetsDraw', 'afterDatasetsDraw', 'beforeDraw', 'afterDraw'] as const;

/**
 * Wraps a plugin so the chart keeps calling the *latest* built plugin of the
 * same id. Plugins close over data (labels, formatters); without this an
 * in-place update would keep drawing the first render's values.
 */
function delegatingPlugin(id: string, latest: { current: ChartConfiguration | null }): Plugin {
  const find = () => latest.current?.plugins?.find((p) => p.id === id) as Record<string, unknown> | undefined;
  const wrapper: Record<string, unknown> = { id };
  for (const hook of DELEGATED_HOOKS) {
    wrapper[hook] = (...args: unknown[]) => {
      const fn = find()?.[hook];
      if (typeof fn === 'function') (fn as (...a: unknown[]) => unknown)(...args);
    };
  }
  return wrapper as unknown as Plugin;
}

/**
 * The canvas shell every Scalar chart is drawn in.
 *
 * Owns three things the individual charts should not each re-solve: the
 * Chart.js lifecycle, re-resolving tokens when the theme changes, and the
 * screen-reader fallback. Data and option changes update the live chart in
 * place (`chart.update()`); the instance is destroyed on unmount.
 */
export const ChartCanvas = forwardRef<HTMLElement, ChartCanvasProps>(function ChartCanvas(
  { build, title, table, height = 240, children, className, ...rest },
  ref,
) {
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const appliedSig = useRef('');
  const tokens = useChartTokens(hostRef);
  const tableId = useId();

  const config = tokens ? build(tokens) : null;
  // Everything JSON can see: data, options, type and the formatted table. Formatters and
  // plugin closures are functions, so the table (which carries formatted values) stands in for them.
  const signature = config ? JSON.stringify([config.data, config.options, table]) : '';
  const chartType = config?.type;
  const latestConfig = useLatestRef<ChartConfiguration | null>(config as ChartConfiguration | null);
  const latestSignature = useLatestRef(signature);

  // Create: on first tokens, on theme change (tokens object), or on chart type change.
  useEffect(() => {
    const cfg = latestConfig.current;
    if (!tokens || !cfg || !canvasRef.current) return;
    registerScalarCharts();
    const plugins = (cfg.plugins ?? []).map((p) => delegatingPlugin(p.id, latestConfig));
    const chart = new Chart(canvasRef.current, { ...cfg, plugins });
    chartRef.current = chart;
    appliedSig.current = latestSignature.current;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [tokens, chartType, latestConfig, latestSignature]);

  // Update: data / options changed while the chart is alive.
  useEffect(() => {
    const chart = chartRef.current;
    const cfg = latestConfig.current;
    if (!chart || !cfg || appliedSig.current === signature) return;
    appliedSig.current = signature;
    chart.data = cfg.data;
    chart.options = cfg.options ?? {};
    chart.update();
  }, [signature, latestConfig]);

  return (
    <figure ref={composeRefs(hostRef, ref)} className={cx('scalar-chart-figure', className)} {...rest}>
      <div className="scalar-chart-canvas" style={{ height }}>
        <canvas ref={canvasRef} role="img" aria-label={title} aria-describedby={table ? tableId : undefined} />
      </div>
      {children}
      {table && (
        <table id={tableId} className="scalar-visually-hidden">
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
              <tr key={String(row[0]) + i}>
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
});
