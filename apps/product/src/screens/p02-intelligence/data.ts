/**
 * Intelligence (and firm Valuations) data, derived from the company database.
 *
 * Every row is a `db` company; every figure is computed from its record
 * (invested, fair value, MOIC, ownership, equity value, revenue, last round,
 * valuation status…) so a company reads the same here as on its own pages.
 * Only the column catalogue, the grid layouts and the frame orderings live
 * here.
 */
import type { GridCol } from './PortfolioGrid.js';
import { companies, companyByName, db, num, pct, usd, type Company } from '../../data/fixtures.js';
import { usDate, type ValuationWorkflowStatus } from '../../data/db.js';

export const PAGE_SIZE = 25;

/**
 * Companies in the order a frame shows them — the named ones first (the frame's
 * visible set), then the rest of the portfolio A–Z. Names not in the database
 * are skipped.
 */
export function inFrameOrder(names: string[]): Company[] {
  const picked = names.map((n) => companyByName(n)).filter((c): c is Company => !!c);
  const ids = new Set(picked.map((c) => c.id));
  return [...picked, ...companies.filter((c) => !ids.has(c.id))];
}

/** Summary value metrics are published only once a valuation is final. */
export const isPublished = (c: Company) => c.valuationStatus === 'final' || c.valuationStatus === 'published';

export const fundName = (c: Company) => db.funds.byId(c.fundId)?.name ?? c.fundId;
const x = (v: number) => `${v.toFixed(2)}x`;
const years = (c: Company) =>
  Math.max(0.5, (Date.parse(c.asOfIso) - Date.parse(c.investmentDate)) / (365.25 * 864e5));
/** Gross IRR from MOIC over the holding period. */
export const irr = (c: Company) => (Math.pow(Math.max(c.moic, 0.01), 1 / years(c)) - 1) * 100;

export const approachesOf = (c: Company) =>
  c.valuationMethod.includes('Backsolve') ? 'BV, PC' : c.valuationMethod.includes('DCF') ? 'DCF, PC' : 'PC';
export const allocationOf = (c: Company) => (c.stage.startsWith('Series') ? 'OPM, Waterfall' : 'Waterfall');

/** What the ModalStatus shows for a database workflow status. */
export const statusView: Record<ValuationWorkflowStatus, { state: 'draft' | 'review' | 'in-process-arg' | 'complete' | 'final' | 'published'; label?: string }> = {
  draft: { state: 'draft' },
  'in-progress': { state: 'in-process-arg', label: 'In Progress' },
  'in-review': { state: 'review', label: 'In Review' },
  'ready-for-audit': { state: 'complete', label: 'Ready for Audit' },
  final: { state: 'final' },
  published: { state: 'published', label: 'Published' },
};

/* ---------------------------------------------------------------------------
 * Summaries — Firm Portfolio Summary
 * ------------------------------------------------------------------------ */

/** The companies drawn in the Summaries frames, in frame order (SpaceX and Perplexity are not in the database). */
export const SUMMARY_FRAME = [
  'PC Laptops', 'PIK', 'Euros Financials', 'Future 4 Liq Pref', 'ABC Co', 'Fund Owns Preferred Notes', 'jan23',
  'SpaceX', 'Backside Blocks', 'Debt Only', 'Rarestep', 'Cohesity', 'DataBricks', 'Notes Only', 'Perplexity',
];

export const summaryColumns: GridCol[] = [
  { key: 'fund', label: 'All Funds', filter: true },
  { key: 'init', label: 'Initial Investment', numeric: true },
  { key: 'mri', label: 'Most Recent Investment', numeric: true },
  { key: 'fdo', label: 'Fully Diluted Ownership', numeric: true },
  { key: 'valDate', label: 'Valuation Date', numeric: true },
  { key: 'realized', label: 'Realized Value', numeric: true },
  { key: 'unrealized', label: 'Unrealized Value', numeric: true },
  { key: 'invested', label: 'Invested Capital', numeric: true },
  { key: 'total', label: 'Total Value', numeric: true },
  { key: 'irr', label: 'Gross IRR', numeric: true },
  { key: 'moic', label: 'MOIC', numeric: true },
  { key: 'outOwn', label: 'Outstanding Ownership', numeric: true },
  { key: 'breakeven', label: 'Breakeven Exit Equity', numeric: true },
  { key: 'ev', label: 'Enterprise Value', numeric: true },
  { key: 'eqv', label: 'Equity Value', numeric: true },
  { key: 'cfv', label: 'Current Fund Value', numeric: true },
  { key: 'tip', label: 'Total Insight Preference', numeric: true },
  { key: 'fundPref', label: 'Fund Preference', numeric: true },
  { key: 'specPref', label: 'Specific Preference', numeric: true },
  { key: 'tcp', label: 'Total Company Preference', numeric: true },
  { key: 'pr1', label: 'Projected Revenue (FY26)', numeric: true },
  { key: 'pr2', label: 'Projected Revenue (FY27)', numeric: true },
  { key: 'pr3', label: 'Projected Revenue (FY28)', numeric: true },
  { key: 'chg', label: '% Change from Previous', numeric: true },
  { key: 'arr', label: 'Implied ARR Multiple', numeric: true },
  { key: 'dcf', label: 'DCF Discount Rate', numeric: true },
  { key: 'alloc', label: 'Allocation Method' },
  { key: 'approaches', label: 'Valuation Approaches' },
  { key: 'approach', label: 'Valuation Approach' },
  { key: 'status', label: 'Valuation Status' },
];

const realizedOf = (c: Company) => (c.status === 'exited' ? c.fairValue : 0);

/** One Summaries row. Value metrics are withheld (undefined → Not Applicable) until published. */
export function summaryValues(c: Company): Record<string, string | undefined> {
  const realized = realizedOf(c);
  const base: Record<string, string | undefined> = {
    fund: fundName(c),
    init: usDate(c.investmentDate),
    mri: usDate(c.lastRound.date),
    fdo: pct(c.ownershipPct),
    valDate: c.asOf,
    invested: usd.format(c.invested),
    total: 'DRAFT',
    outOwn: pct(Math.min(100, c.ownershipPct * 1.18)),
    tip: usd.format(c.invested),
    fundPref: usd.format(c.invested),
    specPref: usd.format(Math.round(c.invested * 0.85)),
    tcp: usd.format(Math.round(c.equityValue * 0.35)),
    pr1: usd.format(Math.round(c.revenueLtm * 1.25)),
    pr2: usd.format(Math.round(c.revenueLtm * 1.25 ** 2)),
    pr3: usd.format(Math.round(c.revenueLtm * 1.25 ** 3)),
  };
  if (!isPublished(c)) return base;
  return {
    ...base,
    realized: usd.format(realized),
    unrealized: usd.format(c.fairValue - realized),
    total: usd.format(c.fairValue),
    irr: pct(irr(c), 2),
    moic: x(c.moic),
    breakeven: num.format(Math.round(c.equityValue * 0.6)),
    ev: usd.format(Math.round(c.equityValue * 1.08)),
    eqv: usd.format(c.equityValue),
    cfv: usd.format(c.fairValue),
    chg: pct((c.moic - 1) * 12, 2),
    arr: c.revenueLtm ? x(c.equityValue / c.revenueLtm) : '',
    dcf: c.valuationMethod.includes('DCF') ? pct(18 + (c.founded % 7), 2) : '',
    alloc: allocationOf(c),
    approaches: approachesOf(c),
    approach: c.valuationMethod,
  };
}

/** Portfolio totals across every company (value metrics over published valuations only). */
export function summaryTotal(): Record<string, string> {
  const pub = companies.filter(isPublished);
  const sum = (rows: Company[], f: (c: Company) => number) => rows.reduce((s, c) => s + f(c), 0);
  const fair = sum(pub, (c) => c.fairValue);
  const realized = sum(pub, realizedOf);
  return {
    realized: usd.format(realized),
    unrealized: usd.format(fair - realized),
    invested: usd.format(sum(companies, (c) => c.invested)),
    total: usd.format(fair),
    moic: x(fair / Math.max(1, sum(pub, (c) => c.invested))),
  };
}

/** Invested Capital over time, for the Cell trend popover. */
export const investedHistory = (c: Company) => ({
  categories: [usDate(c.investmentDate), usDate(c.lastRound.date), c.asOf],
  values: [Math.round(c.invested * 0.6), Math.round(c.invested * 0.85), c.invested],
});

/* ---------------------------------------------------------------------------
 * Create Summary View / Add Columns — the column catalogue
 * ------------------------------------------------------------------------ */

export const columnCatalogue: Array<{ group: string; items: string[] }> = [
  { group: 'Default columns', items: ['Cap Table Currency', 'Financials Currency', 'Fiscal Year End'] },
  { group: 'Dates', items: ['Valuation Date', 'Initial Investment', 'Most Recent Investment', 'Initial Round Date', 'Most Recent Round Date', 'Last Finalized'] },
  { group: 'Ownership', items: ['Fully Diluted Ownership %', 'Outstanding Ownership %'] },
  { group: 'Value', items: ['Invested Capital', 'Realized Value', 'Unrealized Value', 'Total Value', 'Gross IRR', 'MOIC'] },
];

export const defaultSelected = [
  'Valuation Date', 'Initial Investment', 'Most Recent Investment', 'Fully Diluted Ownership %',
  'Invested Capital', 'Realized Value', 'Unrealized Value', 'Total Value', 'Gross IRR', 'MOIC',
];

/* ---------------------------------------------------------------------------
 * Schedule of Investments
 * ------------------------------------------------------------------------ */

export const SOI_FRAME = ['ABC Co', 'Backside Blocks', 'Cohesity', 'DataBricks'];
/** Companies added per "Show N more companies". */
export const SOI_STEP = 10;

export const soiColumns: GridCol[] = [
  { key: 'date', label: 'Investment Date', numeric: true },
  { key: 'invested', label: 'Invested Capital', numeric: true },
  { key: 'shares', label: 'Shares', numeric: true },
  { key: 'cse', label: 'CSE Shares', numeric: true },
  { key: 'shareValue', label: 'Share Value', numeric: true },
  { key: 'fdo', label: 'Fully Diluted Ownership', numeric: true },
  { key: 'realized', label: 'Realized Value', numeric: true },
  { key: 'unrealized', label: 'Unrealized Equity', numeric: true },
  { key: 'total', label: 'Total Value', numeric: true },
];

/** Cap-table currency. The database is USD; Backside Blocks reports in córdobas (as drawn). */
export const currencyOf = (c: Company) => (c.id === 'backside-blocks' ? { code: 'NIO', symbol: 'C$' } : { code: 'USD', symbol: '$' });

const SECURITY_LADDER = ['Common', 'Series Seed Preferred', 'Series A Preferred', 'Series B Preferred', 'Series C Preferred', 'Common Warrant'];

/** The firm's securities in a company, split from its record (invested, fair value, last-round price). */
export function soiFor(c: Company) {
  const cur = currencyOf(c);
  const money = (v: number) => (cur.code === 'USD' ? usd.format(v) : `${cur.code} ${num.format(Math.round(v))}`);
  const price = (v: number) => (cur.code === 'USD' ? `$${v.toFixed(2)}` : `${cur.code} ${v.toFixed(2)}`);
  const n = 1 + (c.securities % 3);
  const weights = Array.from({ length: n }, (_, i) => n - i);
  const wSum = weights.reduce((a, b) => a + b, 0);
  const pps = Math.max(c.lastRound.pricePerShare, 0.01);
  const unrealizedAll = c.status === 'exited' ? 0 : c.fairValue;
  const securities = weights.map((w, i) => {
    const share = w / wSum;
    const invested = c.invested * share;
    const shares = Math.round(invested / pps);
    const unrealized = unrealizedAll * share;
    return {
      name: SECURITY_LADDER[(c.securities + i) % SECURITY_LADDER.length]!,
      invested, shares, unrealized,
      v: {
        date: usDate(i === 0 ? c.investmentDate : c.lastRound.date),
        invested: money(invested),
        shares: num.format(shares),
        cse: num.format(shares),
        shareValue: price(pps),
        fdo: pct(c.ownershipPct * share),
        realized: money(0),
        unrealized: money(unrealized),
        total: money(unrealized),
      },
    };
  });
  const tot = (f: (s: (typeof securities)[number]) => number) => securities.reduce((s, r) => s + f(r), 0);
  return {
    currency: cur,
    securities,
    total: {
      invested: money(tot((s) => s.invested)),
      shares: num.format(tot((s) => s.shares)),
      cse: num.format(tot((s) => s.shares)),
      fdo: pct(c.ownershipPct),
      realized: money(0),
      unrealized: money(tot((s) => s.unrealized)),
      total: money(tot((s) => s.unrealized)),
    },
  };
}

/* ---------------------------------------------------------------------------
 * Daily NAV
 * ------------------------------------------------------------------------ */

/** The companies drawn in the Daily NAV frames, in frame order ("testttrrrrr" and "Jun 3 25" are not in the database). */
export const NAV_FRAME = [
  'PC Laptops', 'No financials', 'jan23', 'Notes Only', 'No Measurement Date', 'Dec 30 MD', 'PIK', 'Old Timer',
  'Company 31', 'Test April 3 2025', 'X-Mode Test', 'SEM', 'Test Company April 30', 'Debt Only', 'ABC Co',
  'DataBricks', 'Rarestep', 'Future Exit Liq Pref', 'Future 4 Liq Pref', 'New Kewing Company', 'Empty Company',
  'Etrade', 'New Company', 'GPC', 'Backside Blocks',
];

export const navGroups = [
  { label: 'Previous Valuation', span: 3 },
  { label: 'Secondary Data', span: 9 },
  { label: 'Public Comp Value', span: 3 },
  { label: 'NAV Considerations', span: 1 },
];

export const navColumns: GridCol[] = [
  { key: 'valDate', label: 'Valuation Date', numeric: true },
  { key: 'equity', label: 'Equity Value', numeric: true },
  { key: 'pps', label: 'Price / Share', numeric: true },
  { key: 'caplight', label: 'Caplight', numeric: true, kind: 'sourced' },
  { key: 'forge', label: 'Forge', numeric: true, kind: 'sourced' },
  { key: 'zanbato', label: 'Zanbato', numeric: true, kind: 'sourced' },
  { key: 'avg', label: 'Avg. Price', numeric: true },
  { key: 'vsMark', label: '±% vs. Mark', numeric: true },
  { key: 'd1', label: '1-Day Δ', numeric: true },
  { key: 'd5', label: '5-Day Δ', numeric: true },
  { key: 'lastVal', label: 'Last Val Δ', numeric: true },
  { key: 'closed', label: 'Closed Transactions', numeric: true },
  { key: 'pc1', label: '1-Day Δ', numeric: true },
  { key: 'pc5', label: '5-Day Δ', numeric: true },
  { key: 'pcLast', label: 'Last Val Δ', numeric: true },
  { key: 'status', label: 'Status' },
];

/** The previous valuation a Daily NAV row compares against — published valuations only. */
export const previousValuation = (c: Company): [string, string, string] | undefined =>
  isPublished(c) ? [c.asOf, usd.format(c.equityValue), `$${c.lastRound.pricePerShare.toFixed(2)}`] : undefined;
