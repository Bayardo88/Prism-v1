/**
 * Audit log demo rows. The first nine follow the Figma frame (same users, objects, payloads); the companies
 * come from the database — the frame's "Anthropic" / "Airbus SAS" are not portfolio companies, so the log
 * names real db records instead. Later rows continue the pattern across other db companies.
 */
import { db, type CompanyRecord } from '../../data/db.js';
export interface LogEntry {
  id: string;
  time: string;
  user: string;
  feature: string;
  companyId: string;
  company: string;
  object: string;
  action: 'UPDATE' | 'CREATE' | 'DELETE';
  details: string;
}

const zeros = '"0.000000000000000"';
const bs = `{ assets_ppe: ${zeros}, assets_total: ${zeros}, equity_total: ${zeros} }`;
const isZero = `{ ebit: ${zeros}, ebitda: ${zeros}, net_income: ${zeros} }`;
const is35 = '{ ebit: "3500000.000000000000000", ebitda: "3500000.000000000000000", net_income: "3500000.0" }';
const is20 = '{ ebit: "2000000.000000000000000", ebitda: "2000000.000000000000000" }';

const u = 'Gabriel Cánepa';

const pick = (id: string): CompanyRecord => db.companies.byId(id) ?? db.companies.all()[0]!;
const primary = pick('spacex');
const secondary = pick('perplexity');
const co = (c: CompanyRecord) => ({ companyId: c.id, company: c.name });

const figmaRows: Omit<LogEntry, 'id'>[] = [
  { time: '9/21/2026, 7:25:07 AM', user: u, feature: 'Financials', ...co(primary), object: 'BalanceSheet #555382', action: 'UPDATE', details: bs },
  { time: '9/21/2026, 7:25:07 AM', user: u, feature: 'Financials', ...co(primary), object: 'BalanceSheet #555383', action: 'UPDATE', details: bs },
  { time: '9/21/2026, 7:25:07 AM', user: u, feature: 'Financials', ...co(primary), object: 'BalanceSheet #555384', action: 'UPDATE', details: bs },
  { time: '9/21/2026, 7:25:07 AM', user: u, feature: 'Financials', ...co(primary), object: 'IncomeStatement #569214', action: 'UPDATE', details: isZero },
  { time: '9/21/2026, 7:25:07 AM', user: u, feature: 'Financials', ...co(primary), object: 'IncomeStatement #569215', action: 'UPDATE', details: is35 },
  { time: '9/21/2026, 7:25:07 AM', user: u, feature: 'Financials', ...co(primary), object: 'IncomeStatement #569216', action: 'UPDATE', details: isZero },
  { time: '9/21/2026, 7:16:57 AM', user: u, feature: 'Documents', ...co(primary), object: 'DocumentReference #144344', action: 'CREATE', details: '{ id: 144344, file_id: 67002, folder_id: null, is_deleted: false, md_documents_id: 3 }' },
  { time: '9/21/2026, 7:16:09 AM', user: u, feature: 'Financials', ...co(secondary), object: 'IncomeStatement #564680', action: 'UPDATE', details: is35 },
  { time: '9/21/2026, 7:15:57 AM', user: u, feature: 'Financials', ...co(secondary), object: 'IncomeStatement #564673', action: 'UPDATE', details: is20 },
];

export const TOTAL_LOGS = 50;

/** Companies the older entries touch: db companies with Daily NAV on, excluding the two above. */
const others = db.companies.where({ dailyNav: true }).filter((c) => c.id !== primary.id && c.id !== secondary.id).slice(0, 12);

/** 50 rows, newest first: the Figma rows, then earlier entries on the same pattern. */
export const auditLog: LogEntry[] = Array.from({ length: TOTAL_LOGS }, (_, i) => {
  const base = figmaRows[i % figmaRows.length]!;
  if (i < figmaRows.length) return { ...base, id: `log-${i}` };
  const other = others[(i - figmaRows.length) % others.length]!;
  const minute = Math.max(0, 14 - Math.floor((i - figmaRows.length) / 3));
  return {
    ...base,
    id: `log-${i}`,
    ...co(other),
    time: `9/21/2026, 7:${String(minute).padStart(2, '0')}:${String(50 - i).padStart(2, '0')} AM`,
    object: base.object.replace(/#(\d+)/, (_m, n: string) => `#${Number(n) - i * 7}`),
  };
});
