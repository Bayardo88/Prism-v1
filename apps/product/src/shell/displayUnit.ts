/**
 * The display unit the Currency Selector cycles (Hundreds → Thousands →
 * Millions → Hundreds), shared by the toolbar chip and the tables under it.
 *
 * It lives outside any screen so it survives moving between the Financials
 * tabs (each tab mounts its own frame). Statement figures are recorded in
 * Thousands; tables rescale them for display with `rescaleAmountText`. The
 * recorded figure never changes — this is a display concern, never a conversion.
 */
import { useSyncExternalStore } from 'react';
import { formatCurrencyDisplayUnit, type CurrencyDisplayUnit } from '@scalar/design-system';

/** The unit statement figures are recorded in. */
export const RECORDED_UNIT: CurrencyDisplayUnit = 'Thousands';

let unit: CurrencyDisplayUnit = RECORDED_UNIT;
const listeners = new Set<() => void>();

export function setDisplayUnit(next: CurrencyDisplayUnit) {
  unit = next;
  for (const l of listeners) l();
}

export function useDisplayUnit(): CurrencyDisplayUnit {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => unit,
    () => RECORDED_UNIT,
  );
}

const AMOUNT = /^(\()?(-)?\$([\d,]+(?:\.\d+)?)(\))?$/;

/**
 * A recorded statement amount ("$22,118", "($2,503)") in the display unit.
 * Anything that is not a dollar amount — a percentage, "N/A", an absence
 * label — passes through untouched.
 */
export function rescaleAmountText(text: string, to: CurrencyDisplayUnit): string {
  if (to === RECORDED_UNIT) return text;
  const m = AMOUNT.exec(text.trim());
  if (!m) return text;
  const value = Number(m[3]!.replace(/,/g, ''));
  const negative = (!!m[1] && !!m[4]) || !!m[2];
  return formatCurrencyDisplayUnit(negative ? -value : value, RECORDED_UNIT, to);
}
