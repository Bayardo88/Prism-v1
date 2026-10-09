/**
 * The categorical chart ramp.
 *
 * Assign series in order and never cycle. A ninth series folds into "Other" or
 * the chart becomes small multiples.
 *
 * Colour-blind safety: every pair in the eight-step ramp separates by at least
 * ΔE2000 6 under normal vision, deuteranopia, protanopia and tritanopia, in both
 * Light and Dark. `scripts/lint-contrast.mjs` enforces this in CI, so a token
 * change that breaks it cannot merge. Colour is still never the only channel in
 * stacked bars (see BarChart) and every chart ships a legend and data table.
 */
export const SERIES_COUNT = 8;

export const seriesColor = (i: number): string => `var(--color-chart-series-${(i % SERIES_COUNT) + 1})`;
export const seriesSubtleColor = (i: number): string => `var(--color-chart-series-${(i % SERIES_COUNT) + 1}-subtle)`;

/**
 * Returns a warning when a chart asks for more series than the ramp can keep
 * distinguishable. The ramp is CVD-validated up to `SERIES_COUNT` series; past
 * that colours would cycle, so fold the tail into "Other" or use small multiples.
 * `directLabels` is accepted for API compatibility and no longer changes the result.
 */
export function seriesAccessibilityWarning(seriesCount: number, _directLabels?: boolean): string | null {
  if (seriesCount > SERIES_COUNT) {
    return `A chart with ${seriesCount} series exceeds the ${SERIES_COUNT}-step colour-blind-safe ramp. ` +
      'Fold the smallest series into "Other" or use small multiples.';
  }
  return null;
}
