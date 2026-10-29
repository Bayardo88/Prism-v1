/**
 * The display unit and display currency the Currency Selector controls, shared
 * by the toolbar chip and the tables under it.
 *
 * - Unit: a click on the unit part steps Hundreds → Thousands → Millions → Hundreds.
 * - Currency: the currency part opens a list of world currencies.
 *
 * Both live outside any screen so they survive moving between the Financials
 * tabs (each tab mounts its own frame). Statement figures are recorded in USD
 * Thousands; tables re-express them for display with `rescaleAmountText`. The
 * recorded figure never changes. Currency uses illustrative rates
 * (`domain/illustrative-calcs.ts`) because the FX source is an open question (P1).
 */
import { useSyncExternalStore } from 'react';
import { currencySymbol, formatCurrencyDisplayUnit, type CurrencyDisplayUnit } from '@scalar/design-system';
import { fromUsdIllustrative } from '../domain/illustrative-calcs.js';

/** The unit and currency statement figures are recorded in. */
export const RECORDED_UNIT: CurrencyDisplayUnit = 'Thousands';
export const RECORDED_CURRENCY = 'USD';

let unit: CurrencyDisplayUnit = RECORDED_UNIT;
let currency = RECORDED_CURRENCY;
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function setDisplayUnit(next: CurrencyDisplayUnit) { unit = next; emit(); }
export function setDisplayCurrency(next: string) { currency = next; emit(); }

export function useDisplayUnit(): CurrencyDisplayUnit {
  return useSyncExternalStore(subscribe, () => unit, () => RECORDED_UNIT);
}
export function useDisplayCurrency(): string {
  return useSyncExternalStore(subscribe, () => currency, () => RECORDED_CURRENCY);
}

const AMOUNT = /^(\()?(-)?\$([\d,]+(?:\.\d+)?)(\))?$/;

/**
 * A recorded statement amount ("$22,118", "($2,503)") in the display unit and
 * currency. Anything that is not a dollar amount — a percentage, "N/A", an
 * absence label — passes through untouched.
 */
export function rescaleAmountText(text: string, to: CurrencyDisplayUnit, code: string = RECORDED_CURRENCY): string {
  if (to === RECORDED_UNIT && code === RECORDED_CURRENCY) return text;
  const m = AMOUNT.exec(text.trim());
  if (!m) return text;
  const value = Number(m[3]!.replace(/,/g, ''));
  const negative = (!!m[1] && !!m[4]) || !!m[2];
  return formatCurrencyDisplayUnit(fromUsdIllustrative(negative ? -value : value, code), RECORDED_UNIT, to, currencySymbol(code));
}
