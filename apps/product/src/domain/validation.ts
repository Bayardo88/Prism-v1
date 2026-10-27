/**
 * Validation rules the prototype enforces (domain-logic.md §7, P7). Every rule
 * reports; none corrects. The user's numbers are never rescaled or reordered.
 */
import { isoFromUs } from './model.js';

/** Weights are compared in millionths of a percent, so 33.3 + 33.3 + 33.4 is exactly 100. */
const units = (v: number) => Math.round(v * 1_000_000);

export interface WeightIssue { total: number; difference: number; message: string }

/**
 * DOC: in a weighting group the weights total exactly 100%. Returns null when
 * they do; otherwise how far off they are, in words (never colour alone, R8).
 */
export function weightIssue(weights: readonly number[], what = 'Weights'): WeightIssue | null {
  const total = weights.reduce((a, w) => a + units(w), 0);
  const diff = total - units(100);
  if (diff === 0) return null;
  const t = (total / 1_000_000).toFixed(1);
  const d = (Math.abs(diff) / 1_000_000).toFixed(1);
  return {
    total: total / 1_000_000,
    difference: diff / 1_000_000,
    message: diff < 0
      ? `${what} total ${t}%. ${d}% is still to allocate.`
      : `${what} total ${t}%. Over-allocated by ${d}%.`,
  };
}

/**
 * DOC: custom breakpoints ascend. Returns the indexes of entered values that are
 * not greater than the last entered value before them. Blank entries are skipped.
 */
export function descendingAt(values: ReadonlyArray<number | undefined>): number[] {
  const bad: number[] = [];
  let prev: number | undefined;
  values.forEach((v, i) => {
    if (v === undefined) return;
    if (prev !== undefined && v <= prev) bad.push(i);
    else prev = v;
  });
  return bad;
}

/**
 * DOC: a transaction cannot be dated after the measurement it is entered for.
 * Accepts MM/DD/YYYY or ISO. Returns a message, or null when the date is valid
 * or not entered yet.
 */
export function transactionDateIssue(date: string | undefined, measurementIso: string): string | null {
  if (!date?.trim()) return null;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : isoFromUs(date);
  if (!iso) return 'Enter the date as MM/DD/YYYY.';
  if (iso > measurementIso) return 'The transaction date is after the measurement date.';
  return null;
}

/** Parse what a user typed into a numeric cell: "$1,234.5", "12%", "(300)". Undefined when blank or not a number. */
export function parseNumber(text: string): number | undefined {
  const t = text.trim();
  if (!t) return undefined;
  const negative = /^\(.*\)$/.test(t) || t.startsWith('-');
  const n = Number(t.replace(/[$,%()\s-]/g, ''));
  if (!Number.isFinite(n)) return undefined;
  return negative ? -n : n;
}
