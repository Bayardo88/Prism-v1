/**
 * Token bridge for Chart.js.
 *
 * Chart.js draws to a canvas, and canvas cannot read CSS custom properties.
 * Every token a chart needs therefore has to be resolved to a concrete value
 * before it is handed over, and re-resolved whenever the theme changes.
 *
 * Resolution is done against the chart's own container rather than
 * `documentElement`, so a scoped `<ScalarProvider target="scope">` themes its
 * charts correctly too.
 */

export interface ChartTokens {
  series: string[];
  seriesSubtle: string[];
  positive: string;
  negative: string;
  total: string;
  grid: string;
  axis: string;
  /** Tick and category labels. */
  labelColor: string;
  /** Direct labels on the marks themselves. */
  valueColor: string;
  /** Marker rings and the gap between adjacent bars and stacked segments. */
  surface: string;
  fontFamily: string;
  fontSize: number;
  valueFontSize: number;
  /** Semantic: Spacing/S — the gap between the plot and its furniture. */
  spaceS: number;
  spaceM: number;
}

const px = (value: string, fallback: number): number => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Reads the chart tokens off a live element.
 *
 * Returns `null` on the server or before mount, where there is no computed
 * style to read — callers skip rendering until an element exists.
 */
export function resolveChartTokens(el: HTMLElement | null): ChartTokens | null {
  if (!el || typeof window === 'undefined') return null;
  const cs = window.getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim();

  return {
    series: Array.from({ length: 8 }, (_, i) => v(`--color-chart-series-${i + 1}`)),
    seriesSubtle: Array.from({ length: 8 }, (_, i) => v(`--color-chart-series-${i + 1}-subtle`)),
    positive: v('--color-chart-positive'),
    negative: v('--color-chart-negative'),
    total: v('--color-chart-total'),
    grid: v('--color-chart-grid'),
    axis: v('--color-chart-axis'),
    labelColor: v('--color-text-secondary'),
    valueColor: v('--color-text-primary'),
    surface: v('--color-bg-surface'),
    fontFamily: v('--font-family-default'),
    // Charts sit on the Text/S step (contract rule R10: nothing below 12px).
    fontSize: px(v('--font-size-text-s'), 12),
    valueFontSize: px(v('--font-size-text-s'), 12),
    spaceS: px(v('--space-s'), 8),
    spaceM: px(v('--space-m'), 12),
  };
}

/** Whether the viewer has asked for reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
