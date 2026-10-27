/**
 * ILLUSTRATIVE PROTOTYPE MATHS — NOT AUTHORITATIVE. DO NOT PORT.
 *
 * The prototype needs some numbers to look plausible. Every formula it uses is
 * here and nowhere else, so none of them leaks into a screen or a DS component
 * (domain-logic.md §9, P6). These are simplifications for demo data only:
 * they ignore participation, seniority, dividends, conversion mechanics and
 * notes. The real formulas are a P0 open question that needs finance sign-off.
 *
 * Never extend this file into Waterfall, OPM, DCF, note conversion or IRR.
 */

export interface SecurityLike {
  type?: string;
  sharesOutstanding?: number;
  originalIssuePrice?: number;
  conversionRate?: number;
}

const isPreferred = (s: SecurityLike) => s.type === 'Preferred Stock';

/** Shares as converted: shares × conversion rate (1 when not set). */
export const fullyDiluted = (s: SecurityLike) => (s.sharesOutstanding ?? 0) * (s.conversionRate ?? 1);

/** Liquidation preference: shares × issue price, for preferred stock only. */
export const liquidationPreference = (s: SecurityLike) =>
  (isPreferred(s) ? (s.sharesOutstanding ?? 0) * (s.originalIssuePrice ?? 0) : 0);

export const sum = <T>(xs: readonly T[], f: (x: T) => number) => xs.reduce((a, x) => a + f(x), 0);

/** Share of a total as a percent; 0 when the total is 0. */
export const shareOf = (part: number, total: number) => (total ? (part / total) * 100 : 0);

export interface IllustrativeBreakpoint {
  /** Equity value where the range starts. */
  from: number;
  /** Where it ends; Infinity for the last. */
  to: number;
  /** Price per common share at the start of the range; Infinity for the last. */
  price: number;
  /** Amount per security in the range; undefined = pro rata. */
  bySecurity: Array<number | undefined>;
}

/**
 * Three illustrative breakpoints: preferences first, then common catching up to
 * the highest issue price, then pro rata.
 */
export function illustrativeBreakpoints(secs: readonly SecurityLike[]): IllustrativeBreakpoint[] {
  const totalLp = sum(secs.filter(isPreferred), liquidationPreference);
  const topPrice = Math.max(0, ...secs.filter(isPreferred).map((s) => s.originalIssuePrice ?? 0));
  const catchUp = sum(secs.filter((s) => !isPreferred(s)), (s) => (s.sharesOutstanding ?? 0) * topPrice);
  const top = totalLp + catchUp;
  return [
    { from: 0, to: totalLp, price: 0, bySecurity: secs.map((s) => (isPreferred(s) ? liquidationPreference(s) : 0)) },
    { from: totalLp, to: top, price: topPrice, bySecurity: secs.map((s) => (isPreferred(s) ? liquidationPreference(s) : (s.sharesOutstanding ?? 0) * topPrice)) },
    { from: top, to: Infinity, price: Infinity, bySecurity: secs.map(() => undefined) },
  ];
}

/** Return multiple: value ÷ invested. Undefined when nothing was invested (not 0x). */
export const moic = (value: number, invested: number) => (invested ? value / invested : undefined);
