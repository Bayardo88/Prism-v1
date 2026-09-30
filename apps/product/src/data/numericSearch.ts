/**
 * Numeric search over the Looking Glass (Intelligence → Summaries grid).
 *
 * Pure logic, no UI: parse a query like `10M`, `$10,000,000`, `12.5%`, `3.2x`
 * or `moic 3x`, then find grid values within tolerance for the active firm and
 * measurement date. Values are read from the same `summaryValues` the grid
 * renders, so a hit always matches the cell the user lands on.
 */
import { companies, firm, type Company } from './fixtures.js';
import { summaryColumns, summaryValues } from '../screens/p02-intelligence/data.js';

export type NumericKind = 'money' | 'percent' | 'multiple' | 'plain';

export interface NumericQuery {
  kind: NumericKind;
  /** Whether the user gave an explicit unit ($, k/M/B, %, x). Bare numbers match every kind. */
  explicit: boolean;
  /** Normalised value: 10M → 10_000_000, 12.5% → 12.5, 3.2x → 3.2. */
  value: number;
  /** Column keys the query text narrows to; empty = every column. */
  fields: string[];
  raw: string;
}

export interface NumericHit {
  id: string;
  companyId: string;
  company: string;
  fieldKey: string;
  field: string;
  /** Display value as the grid shows it. */
  display: string;
  value: number;
  /** ISO date of the measurement the value belongs to. */
  date: string;
  distance: number;
}

export type NumericSearchStatus = 'ok' | 'disabled' | 'unauthorized-firm' | 'unavailable-date';

export interface NumericSearchResult {
  status: NumericSearchStatus;
  hits: NumericHit[];
  /** Matches before the cap. */
  total: number;
  truncated: boolean;
}

/** Access rules for the prototype — the real product reads these from the session. */
export const numericSearchAccess = {
  enabled: true,
  authorizedFirmIds: ['spatical', 'union'],
  availableDates: ['2026-06-30', '2026-03-31', '2025-12-31', '2025-09-30', '2025-06-30', '2025-03-31'],
  activeFirmId: firm.id,
  selectedDate: '2026-06-30',
};

export const TOLERANCE = 0.1;
export const MAX_RESULTS = 25;

const SUFFIX: Record<string, number> = { k: 1e3, m: 1e6, mm: 1e6, b: 1e9, bn: 1e9 };
const NUMBER = /^(\(|-)?([$€£])?(-?(?:\d[\d,]*\.?\d*|\.\d+))(k|mm|m|bn|b)?(%|x)?\)?$/i;

const isNumberToken = (t: string) => NUMBER.test(t);

/** Non-date, non-text columns of the grid. */
const numericColumns = summaryColumns.filter((c) => c.numeric && !['init', 'mri', 'valDate'].includes(c.key));

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9% ]+/g, ' ').split(/\s+/).filter(Boolean);

/** Everyday names analysts use for grid columns. */
const ALIASES: Record<string, string[]> = {
  'fair value': ['cfv', 'total'],
  revenue: ['pr1', 'pr2', 'pr3'],
  ownership: ['fdo', 'outOwn'],
  preference: ['tip', 'fundPref', 'specPref', 'tcp'],
  ev: ['ev'],
};

/** Columns whose label contains every word of the narrowing text. */
function matchFields(text: string): string[] {
  const w = words(text);
  if (!w.length) return [];
  const alias = ALIASES[w.join(' ')];
  if (alias) return alias;
  return numericColumns.filter((c) => { const l = words(c.label); return w.every((x) => l.some((y) => y.startsWith(x))); }).map((c) => c.key);
}

/** Returns null when the text is not a numeric query (so it falls through to normal search). */
export function parseNumericQuery(input: string): NumericQuery | null {
  const raw = input.trim();
  if (!raw) return null;
  const tokens = raw.split(/\s+/);
  const at = tokens.findIndex(isNumberToken);
  if (at < 0) return null;
  const m = NUMBER.exec(tokens[at]!)!;
  const [, sign, currency, digits, suffix, unit] = m;
  let value = Number(digits!.replace(/,/g, ''));
  if (Number.isNaN(value)) return null;
  if (suffix) value *= SUFFIX[suffix.toLowerCase()]!;
  if (sign) value = -Math.abs(value);
  const kind: NumericKind = unit === '%' ? 'percent' : unit?.toLowerCase() === 'x' ? 'multiple' : currency || suffix ? 'money' : 'plain';
  const rest = tokens.filter((_, i) => i !== at).join(' ');
  const fields = matchFields(rest);
  // Leftover words that name no column mean this is not a numeric query ("Q2 2026", "Series 10").
  if (rest && !fields.length) return null;
  return { kind, explicit: kind !== 'plain', value, fields, raw };
}

/**
 * Tolerance on the normalised value. Zero matches only zero (a 10% band around
 * zero is empty); negatives compare by magnitude and must share the sign.
 */
export function withinTolerance(actual: number, target: number, tol = TOLERANCE): boolean {
  if (target === 0) return actual === 0;
  if (Math.sign(actual) !== Math.sign(target)) return false;
  return Math.abs(actual - target) <= Math.abs(target) * tol;
}

const kindOf = (display: string): NumericKind =>
  display.endsWith('%') ? 'percent' : display.endsWith('x') ? 'multiple' : display.startsWith('$') || display.startsWith('-$') ? 'money' : 'plain';

const toNumber = (display: string): number | null => {
  if (!/\d/.test(display)) return null;
  const n = Number(display.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? null : n;
};

const kindMatches = (q: NumericQuery, k: NumericKind) =>
  !q.explicit || q.kind === k || (q.kind === 'money' && k === 'plain');

/** Companies whose latest measurement is on or before the selected date. */
const inScope = (c: Company, date: string) => c.asOfIso <= date;

export function searchNumeric(
  q: NumericQuery,
  scope: { firmId?: string; date?: string; enabled?: boolean } = {},
): NumericSearchResult {
  const access = numericSearchAccess;
  const firmId = scope.firmId ?? access.activeFirmId;
  const date = scope.date ?? access.selectedDate;
  const none = (status: NumericSearchStatus): NumericSearchResult => ({ status, hits: [], total: 0, truncated: false });
  // Refuse before touching any data.
  if (!(scope.enabled ?? access.enabled)) return none('disabled');
  if (!access.authorizedFirmIds.includes(firmId)) return none('unauthorized-firm');
  if (!access.availableDates.includes(date)) return none('unavailable-date');

  const cols = q.fields.length ? numericColumns.filter((c) => q.fields.includes(c.key)) : numericColumns;
  const hits: NumericHit[] = [];
  for (const c of companies) {
    if (!inScope(c, date)) continue;
    const vals = summaryValues(c);
    for (const col of cols) {
      const display = vals[col.key];
      if (!display) continue;
      const n = toNumber(display);
      if (n === null || !kindMatches(q, kindOf(display))) continue;
      if (!withinTolerance(n, q.value)) continue;
      hits.push({
        id: `${c.id}|${col.key}`, companyId: c.id, company: c.name, fieldKey: col.key, field: col.label,
        display, value: n, date: c.asOfIso, distance: q.value === 0 ? 0 : Math.abs(n - q.value) / Math.abs(q.value),
      });
    }
  }
  hits.sort((a, b) => a.distance - b.distance || a.company.localeCompare(b.company));
  return { status: 'ok', hits: hits.slice(0, MAX_RESULTS), total: hits.length, truncated: hits.length > MAX_RESULTS };
}
