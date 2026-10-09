import { describe, it, expect } from 'vitest';
import { SERIES_COUNT, seriesColor, seriesSubtleColor, seriesAccessibilityWarning } from './series.js';

describe('series ramp', () => {
  it('has eight steps', () => expect(SERIES_COUNT).toBe(8));

  it('maps index to a 1-based token', () => {
    expect(seriesColor(0)).toBe('var(--color-chart-series-1)');
    expect(seriesColor(7)).toBe('var(--color-chart-series-8)');
  });

  it('wraps modulo 8', () => {
    expect(seriesColor(8)).toBe(seriesColor(0));
    expect(seriesColor(19)).toBe(seriesColor(3));
  });

  it('has matching subtle tokens that wrap too', () => {
    expect(seriesSubtleColor(2)).toBe('var(--color-chart-series-3-subtle)');
    expect(seriesSubtleColor(10)).toBe(seriesSubtleColor(2));
  });

  it('warns only above eight series', () => {
    expect(seriesAccessibilityWarning(8)).toBeNull();
    expect(seriesAccessibilityWarning(1)).toBeNull();
    const msg = seriesAccessibilityWarning(9);
    expect(msg).toContain('9 series');
    expect(msg).toContain('8-step');
    expect(msg).toContain('Other');
  });

  it('ignores the legacy directLabels flag', () => {
    expect(seriesAccessibilityWarning(9, true)).toBe(seriesAccessibilityWarning(9, false));
    expect(seriesAccessibilityWarning(3, true)).toBeNull();
  });
});
