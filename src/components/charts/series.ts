/**
 * The categorical chart ramp.
 *
 * Assign series in order and never cycle. A ninth series folds into "Other" or
 * the chart becomes small multiples.
 *
 * KNOWN GAP — Chart/Series has not passed CVD validation in Light mode. Series 2
 * and Series 3 separate by only ΔE 4.9 under deuteranopia, below the ΔE 6 floor,
 * and Series 3 shares a hex with Chart/Negative (#cb0000 in Light). Until those
 * tokens are re-stepped, every chart using them MUST carry direct labels or
 * texture in addition to a legend. `assertSeriesAccessible` below is the guard.
 */
export const SERIES_COUNT = 8;

export const seriesColor = (i: number): string => `var(--color-chart-series-${(i % SERIES_COUNT) + 1})`;
export const seriesSubtleColor = (i: number): string => `var(--color-chart-series-${(i % SERIES_COUNT) + 1}-subtle)`;

/**
 * Returns a warning when a chart's series selection hits the unresolved CVD
 * clash and the chart is not carrying direct labels. Call it from a chart's
 * own code rather than relying on reviewers to remember.
 */
export function seriesAccessibilityWarning(seriesCount: number, directLabels: boolean): string | null {
  if (directLabels) return null;
  // Series index 1 and 2 are Chart/Series 2 and 3 — the unresolved pair.
  if (seriesCount >= 3) {
    return 'Chart/Series 2 and 3 separate by only ΔE 4.9 under deuteranopia. ' +
      'Add direct labels or texture, or reduce to two series.';
  }
  return null;
}
