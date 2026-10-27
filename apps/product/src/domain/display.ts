/**
 * Empty is not zero (domain-logic.md §6, P5). Four situations, four renderings:
 *
 *   displayValue(0, usd.format)                       → "$0"            a real zero
 *   displayValue(undefined, usd.format)               → "—"             not entered
 *   displayValue(v, usd.format, 'not-calculated')     → "Not calculated" inputs missing / no approach yet
 *   displayValue(v, usd.format, 'draft')              → "Draft"         left out of a published report
 *
 * A placeholder `$0` for a value that does not exist yet is a bug.
 */
export type Absence = 'not-entered' | 'not-calculated' | 'draft';

export const ABSENCE_LABEL: Record<Absence, string> = {
  'not-entered': '—',
  'not-calculated': 'Not calculated',
  draft: 'Draft',
};

export function displayValue(
  value: number | null | undefined,
  format: (n: number) => string,
  absence?: Absence,
): string {
  if (absence) return ABSENCE_LABEL[absence];
  if (value === null || value === undefined || Number.isNaN(value)) return ABSENCE_LABEL['not-entered'];
  return format(value);
}

/** Percent with one decimal, the way weights are written ("50.0%"). */
export const pct1 = (v: number) => `${v.toFixed(1)}%`;
