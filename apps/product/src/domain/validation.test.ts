import { describe, expect, it } from 'vitest';
import { descendingAt, parseNumber, transactionDateIssue, weightIssue } from './validation.js';
import { displayValue } from './display.js';
import { illustrativeBreakpoints, moic } from './illustrative-calcs.js';

describe('weights total exactly 100% (P7)', () => {
  it('accepts 100 without float drift', () => {
    expect(weightIssue([50, 50])).toBeNull();
    expect(weightIssue([33.3, 33.3, 33.4])).toBeNull();
    expect(weightIssue([0.1, 0.2, 99.7])).toBeNull();
  });
  it('says what is left or over, in words', () => {
    expect(weightIssue([75])!.message).toBe('Weights total 75.0%. 25.0% is still to allocate.');
    expect(weightIssue([75, 50], 'Scenario weights')!.message).toBe('Scenario weights total 125.0%. Over-allocated by 25.0%.');
  });
});

describe('breakpoints ascend', () => {
  it('flags each entry not above the last entered one', () => {
    expect(descendingAt([10, 20, 30])).toEqual([]);
    expect(descendingAt([10, undefined, 5, 30, 30])).toEqual([2, 4]);
  });
});

describe('transaction date ≤ measurement date', () => {
  it('rejects a later date and accepts the same day', () => {
    expect(transactionDateIssue('01/15/2025', '2024-12-31')).toMatch(/after the measurement/);
    expect(transactionDateIssue('12/31/2024', '2024-12-31')).toBeNull();
    expect(transactionDateIssue('', '2024-12-31')).toBeNull();
    expect(transactionDateIssue('31/12/2024', '2024-12-31')).toMatch(/MM\/DD\/YYYY/);
  });
});

describe('parseNumber', () => {
  it('reads money, percent and accounting negatives', () => {
    expect(parseNumber('$1,234.5')).toBe(1234.5);
    expect(parseNumber('12%')).toBe(12);
    expect(parseNumber('(300)')).toBe(-300);
    expect(parseNumber('')).toBeUndefined();
    expect(parseNumber('abc')).toBeUndefined();
  });
});

describe('empty is not zero (P5)', () => {
  const f = (n: number) => `$${n}`;
  it('renders the four situations differently', () => {
    expect(displayValue(0, f)).toBe('$0');
    expect(displayValue(undefined, f)).toBe('—');
    expect(displayValue(5, f, 'not-calculated')).toBe('Not calculated');
    expect(displayValue(5, f, 'draft')).toBe('Draft');
  });
});

describe('illustrative maths', () => {
  it('ends in an open, pro-rata range', () => {
    const bp = illustrativeBreakpoints([
      { type: 'Common Stock', sharesOutstanding: 100 },
      { type: 'Preferred Stock', sharesOutstanding: 10, originalIssuePrice: 2 },
    ]);
    expect(bp.map((b) => b.to)).toEqual([20, 220, Infinity]);
    expect(bp[2]!.bySecurity).toEqual([undefined, undefined]);
  });
  it('has no return multiple when nothing was invested', () => {
    expect(moic(10, 0)).toBeUndefined();
    expect(moic(30, 10)).toBe(3);
  });
});
