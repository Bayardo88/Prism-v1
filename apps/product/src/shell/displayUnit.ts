/**
 * The display unit and display currency the Currency Selector controls, shared
 * by the toolbar chip and the tables under it.
 *
 * - Unit: a click on the unit part steps Hundreds → Thousands → Millions → Hundreds.
 * - Currency: the currency part opens a list of world currencies.
 *
 * Both are platform-wide and live outside any screen, so a choice made on one
 * screen holds on every other. Until the user picks a unit, each screen shows
 * its own recorded unit (Financials and Valuations: Thousands; Waterfalls:
 * Millions), so nothing changes until someone clicks. Screens format money
 * through `useMoney(recordedUnit)`. The recorded figure never changes. Currency uses illustrative rates
 * (`domain/illustrative-calcs.ts`) because the FX source is an open question (P1).
 */
import { useSyncExternalStore } from 'react';
import { convertCurrencyDisplayUnit, currencySymbol, formatCurrencyDisplayUnit, type CurrencyDisplayUnit } from '@scalar/design-system';
import { fromUsdIllustrative } from '../domain/illustrative-calcs.js';

/** The unit and currency statement figures are recorded in. */
export const RECORDED_UNIT: CurrencyDisplayUnit = 'Thousands';
export const RECORDED_CURRENCY = 'USD';

/** `null` until the user picks one: each screen then shows its recorded unit. */
let unit: CurrencyDisplayUnit | null = null;
let currency = RECORDED_CURRENCY;
const listeners = new Set<() => void>();
const emit = () => { for (const l of listeners) l(); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function setDisplayUnit(next: CurrencyDisplayUnit) { unit = next; emit(); }
export function setDisplayCurrency(next: string) { currency = next; emit(); }

/** The unit the user picked, or `null` (show each screen's recorded unit). */
export function useDisplayUnit(): CurrencyDisplayUnit | null {
  return useSyncExternalStore(subscribe, () => unit, () => null);
}
export function useDisplayCurrency(): string {
  return useSyncExternalStore(subscribe, () => currency, () => RECORDED_CURRENCY);
}

const AMOUNT = /^(\()?(-)?\$([\d,]+(?:\.\d+)?)(\))?$/;

/** What a money string is: an amount (scales with the unit) or a per-share price / rate (currency only). */
export type MoneyKind = 'amount' | 'price';

export interface MoneyOptions {
  /** The unit the screen records its amounts in. Default Thousands. */
  recorded?: CurrencyDisplayUnit;
  /** Default `amount`. */
  kind?: MoneyKind;
}

/** A USD amount (a number in `recorded` units) written in the display unit and currency. */
export function formatAmount(value: number, to: CurrencyDisplayUnit, code: string, recorded: CurrencyDisplayUnit = RECORDED_UNIT): string {
  return formatCurrencyDisplayUnit(fromUsdIllustrative(value, code), recorded, to, currencySymbol(code));
}

/**
 * A recorded money string ("$22,118", "($2,503)", "$1.25") in the display unit
 * and currency. An `amount` rescales from its recorded unit; a `price` only
 * changes currency and keeps its decimals. Anything that is not a dollar figure
 * — a percentage, a multiple, "N/A", an absence label — passes through untouched.
 */
export function rescaleAmountText(text: string, to: CurrencyDisplayUnit, code: string = RECORDED_CURRENCY, opts: MoneyOptions = {}): string {
  const recorded = opts.recorded ?? RECORDED_UNIT;
  const kind = opts.kind ?? 'amount';
  if (code === RECORDED_CURRENCY && (kind === 'price' || to === recorded)) return text;
  const m = AMOUNT.exec(text.trim());
  if (!m) return text;
  const value = Number(m[3]!.replace(/,/g, ''));
  const negative = (!!m[1] && !!m[4]) || !!m[2];
  const signed = negative ? -value : value;
  if (kind === 'price') {
    const digits = m[3]!.includes('.') ? m[3]!.split('.')[1]!.length : 0;
    const n = fromUsdIllustrative(Math.abs(signed), code);
    const out = `${currencySymbol(code)}${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
    return signed < 0 ? `(${out})` : out;
  }
  return formatAmount(signed, to, code, recorded);
}

/**
 * The money formatter for a screen under the Currency Selector. Re-renders when
 * the unit or currency changes. `recorded` is the unit the screen's amounts are
 * stored in.
 */
export function useMoney(recorded: CurrencyDisplayUnit = RECORDED_UNIT) {
  const unit = useDisplayUnit() ?? recorded;
  const currency = useDisplayCurrency();
  return {
    unit,
    currency,
    /** Figures show as recorded (no rescale, no conversion), so in-cell edits can commit them. */
    isRecorded: unit === recorded && currency === RECORDED_CURRENCY,
    /** A number already in the display unit and currency, formatted (chart ticks). */
    formatShown: (v: number) => formatCurrencyDisplayUnit(v, unit, unit, currencySymbol(currency)),
    /** An amount in `recorded` units, written in the display unit but kept in `symbol`'s own currency (a reporting-currency column). */
    scaleOnly: (v: number, symbol: string) => formatCurrencyDisplayUnit(v, recorded, unit, symbol),
    /** An amount string, rescaled and converted. */
    amount: (text: string) => rescaleAmountText(text, unit, currency, { recorded }),
    /** A per-share price or rate string: currency only. */
    price: (text: string) => rescaleAmountText(text, unit, currency, { recorded, kind: 'price' }),
    /** A numeric amount in `recorded` units, formatted for display. */
    format: (value: number) => formatAmount(value, unit, currency, recorded),
    /** A numeric amount re-expressed in the display unit and currency (for charts). */
    value: (v: number) => convertCurrencyDisplayUnit(fromUsdIllustrative(v, currency), recorded, unit),
  };
}
