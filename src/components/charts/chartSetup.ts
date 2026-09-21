/**
 * Chart.js registration and the shared scaffold.
 *
 * Only the controllers, elements and scales the system actually uses are
 * registered, so a bundler can drop the rest of Chart.js.
 */
import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, DoughnutController,
  Filler, LineController, LineElement, LinearScale, PointElement, Tooltip,
  type ChartOptions, type ChartType,
} from 'chart.js';

/** One scale's options, as Chart.js accepts them: deeply partial. */
type ScaleOpts = NonNullable<ChartOptions<'bar'>['scales']>[string];
import type { ChartTokens } from './chartTokens.js';
import { prefersReducedMotion } from './chartTokens.js';

let registered = false;

/** Registers the Chart.js pieces this package uses. Idempotent. */
export function registerScalarCharts(): void {
  if (registered) return;
  Chart.register(
    BarController, LineController, DoughnutController,
    BarElement, LineElement, PointElement, ArcElement,
    CategoryScale, LinearScale, Filler, Tooltip,
  );
  registered = true;
}

/**
 * Grid variants, carried over from the Figma Chart Frame component.
 *
 * Horizontal is the default — vertical gridlines are only worth their ink when
 * readers compare across the category axis.
 */
export type ChartGrid = 'horizontal' | 'both' | 'none';

/**
 * The plot scaffold: axis rules, gridlines and tick labels.
 *
 * This replaces the Figma `Chart Frame` component. With Chart.js the scaffold
 * is scale configuration rather than drawn geometry, so it is expressed as
 * options rather than as a React component.
 *
 * Grid and axes stay recessive: one pixel, never darker than the marks they
 * sit behind.
 */
export function chartScaffold(
  t: ChartTokens,
  grid: ChartGrid,
  format?: (value: number) => string,
): { x: ScaleOpts; y: ScaleOpts } {
  const font = { family: t.fontFamily, size: t.fontSize };

  return {
    x: {
      type: 'category',
      grid: {
        display: grid === 'both',
        color: t.grid,
        lineWidth: 1,
        drawTicks: false,
      },
      border: { color: t.axis, width: 1 },
      ticks: { color: t.labelColor, font, padding: t.spaceS },
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      grid: {
        display: grid === 'horizontal' || grid === 'both',
        color: t.grid,
        lineWidth: 1,
        drawTicks: false,
      },
      border: { color: t.axis, width: 1 },
      ticks: {
        color: t.labelColor,
        font,
        padding: t.spaceS,
        callback: (value) => (format ? format(Number(value)) : String(value)),
      },
    },
  };
}

/**
 * Options every Scalar chart shares.
 *
 * The built-in legend is always off: the Figma legend is a real component, it
 * has to be reachable by a screen reader, and a canvas-drawn legend is neither.
 * Charts render `ChartLegend` in the DOM instead.
 */
export function baseChartOptions<T extends ChartType = ChartType>(t: ChartTokens): ChartOptions<T> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: prefersReducedMotion() ? false : { duration: 250 },
    layout: { padding: { top: t.spaceM, right: t.spaceS, bottom: 0, left: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.valueColor,
        titleFont: { family: t.fontFamily, size: t.fontSize },
        bodyFont: { family: t.fontFamily, size: t.fontSize },
        padding: t.spaceS,
        displayColors: true,
      },
    },
    // These options are valid for every chart type in the system; TypeScript
    // cannot prove that for an unresolved generic, so the cast states it.
  } as ChartOptions<T>;
}
