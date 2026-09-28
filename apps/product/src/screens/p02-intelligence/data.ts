/**
 * Intelligence demo data, copied from the Figma frames on page 02. Figures are
 * summary (calculated) values: read-only, derived from each company's cap
 * table and latest valuation.
 */
import type { GridCol } from './PortfolioGrid.js';
import { companies } from '../../data/fixtures.js';

/** Fixture id for a company name, when the company exists in the shared list. */
export function fixtureId(name: string): string | undefined {
  const base = name.replace(/\s*\(.*\)$/, '').toLowerCase();
  return companies.find((c) => c.name.toLowerCase() === base)?.id;
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ---------------------------------------------------------------------------
 * Summaries — Firm Portfolio Summary
 * ------------------------------------------------------------------------ */

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

export type Status = 'draft' | 'final' | 'published';

export interface SummaryRow {
  name: string;
  status: Status;
  v: Record<string, string>;
}

const k = summaryColumns.map((c) => c.key);
/** Build a row from the positional list of values in column order ('-' = not applicable). */
const row = (name: string, status: Status, ...vals: string[]): SummaryRow => ({
  name,
  status,
  v: Object.fromEntries(vals.map((val, i) => [k[i]!, val]).filter(([, val]) => val !== '-')),
});

const NA7 = ['-', '-', '-', '-', '-', '-', '-'];
/** Unpublished rows: value metrics are withheld, preferences and projections show. */
const draft = (name: string, fund: string, init: string, mri: string, fdo: string, valDate: string,
  invested: string, outOwn: string, prefs: [string, string, string, string], pr: [string, string, string]) =>
  row(name, 'draft', fund, init, mri, fdo, valDate, '-', '-', invested, 'DRAFT', '-', '-', outOwn,
    '-', '-', '-', '-', ...prefs, ...pr, ...NA7.slice(0, 6), 'DRAFT');

export const summaryRows: SummaryRow[] = [
  draft('PC Laptops', 'VIP FUND', '05/05/2015', '08/10/2024', '0.0%', '12/31/2020', '$2,898', '34.8%', ['$1,375', '$1,375', '$1,375', '$239,374,725'], ['$4,444,444', '$0', '$0']),
  draft('PIK', 'VIP FUND', '10/10/2010', '10/10/2010', '0.2%', '12/31/2023', '$0', '1.0%', ['$0', '$0', '$0', '$1,000,000'], ['$0', '$0', '$0']),
  draft('Euros Financials (EUR)', 'VIP FUND', '12/31/2022', '12/31/2022', '0.0%', '09/30/2024', '$509,208', '92.2%', ['$0', '$0', '$0', '$117,630,297'], ['$0', '$0', '$0']),
  draft('Future 4 Liq Pref (EUR)', 'VIP FUND', '12/05/2022', '12/05/2022', '0.1%', '12/31/2024', '$103,530', '14.0%', ['$2,030,800', '$2,030,800', '$2,030,800', '$181,178,176'], ['$0', '$0', '$0']),
  draft('ABC Co', 'VIP FUND', '08/07/2023', '08/07/2023', '0.0%', '12/31/2024', '$35,767', '84.6%', ['$12,332', '$12,332', '$12,332', '$1,112,233'], ['$0', '$0', '$0']),
  draft('Fund Owns Preferred Notes', 'VIP FUND', '12/31/2018', '11/19/2022', '25.0%', '12/31/2024', '$500,233', '75.0%', ['$233', '$233', '$1,001,761', '$1,000,000'], ['$0', '$0', '$0']),
  draft('jan23', 'VIP FUND', '11/11/2011', '11/11/2011', '0.3%', '03/31/2025', '$2,357', '0.9%', ['$1,877', '$1,877', '$433', '$12,343'], ['$1,234,545', '$0', '$0']),
  draft('SpaceX', 'VIP FUND', '11/11/2011', '11/11/2011', '1,004.3%', '09/30/2025', '$23,344', '100.0%', ['$0', '$0', '$0', '$0'], ['$0', '$0', '$0']),
  row('Backside Blocks (NIO)', 'final', 'VIP FUND', '05/10/2021', '05/10/2021', '0.2%', '03/31/2025', '$0', '$1,533', '$137', '$1,533',
    '86.11%', '11.23x', '1.0%', '357,522', '$4,778,382,719', '$4,778,382,719', '$1,533', '$0', '$0', '$0', '$273,043',
    '$0', '$0', '$0', '84.73%', '30,966.10x', '0.00%', 'OPM, Waterfall', 'BV, PC', 'Market Approach, Backsolve', 'FINAL'),
  row('Debt Only', 'published', 'VIP FUND', '07/14/2022', '07/14/2022', '0.0%', '09/30/2025', '$234,444', '$122,344', '$122,344', '$356,788',
    '0.00%', '2.92x', '0.0%', '0', '$0', '$0', '$122,344', '$0', '$0', '$0', '$0',
    '$0', '$6,666,666', '$22,222,222', '0.00%', '0.00x', '0.00%', '', '', '', 'PUBLISHED'),
  draft('Rarestep', 'VIP FUND', '03/20/2025', '03/20/2025', '0.0%', '03/31/2025', '$23,434', '14.2%', ['$3,392,485,663', '$3,392,485,663', '$3,387,380,880', '$653,261,284'], ['$0', '$0', '$0']),
  draft('Cohesity', 'Low Class', '06/11/1975', '06/11/1975', '0.0%', '05/01/2026', '$3,333', '100.0%', ['$0', '$0', '$0', '$0'], ['$0', '$0', '$0']),
  draft('DataBricks', 'VIP FUND', '03/20/2024', '03/20/2024', '0.3%', '06/30/2026', '$34,434', '19.2%', ['$818,219', '$818,219', '$818,219', '$147,655,257'], ['$0', '$0', '$0']),
  draft('Notes Only', 'Low Class', '10/10/2010', '10/10/2010', '0.1%', '06/30/2026', '$234,344', '95.4%', ['$0', '$0', '$0', '$1,016,389'], ['$0', '$0', '$0']),
  draft('Perplexity', 'Low Class', '06/11/2020', '06/11/2020', '0.0%', '05/01/2026', '$3,333', '100.0%', ['$0', '$0', '$0', '$0'], ['$0', '$0', '$0']),
];

export const summaryTotal: Record<string, string> = {
  realized: '$234,444', unrealized: '$123,877', invested: '$1,598,696', total: '$358,321', moic: '2.93x',
};

/** Invested Capital history, for the Cell trend popover. */
export const investedHistory = {
  categories: ['12/31/2023', '06/30/2024', '12/31/2024'],
  values: [100000, 100000, 100000],
};

/* ---------------------------------------------------------------------------
 * Create Summary View — the column catalogue
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

const soi = (date: string, invested: string, shares: string, cse: string, shareValue: string, fdo: string, realized: string, unrealized: string, total: string) =>
  ({ date, invested, shares, cse, shareValue, fdo, realized, unrealized, total });

export const soiCompanies: Array<{
  name: string; currency: string; symbol: string;
  securities: Array<{ name: string; v: Record<string, string> }>;
  total: Record<string, string>;
}> = [
  {
    name: 'ABC Co', currency: 'USD', symbol: '$',
    securities: [
      { name: 'Holding Common', v: soi('08/07/2023', '$23,433', '12,343', '12,343', '$0.00', '0.8%', '$0', '$0', '$0') },
      { name: 'Series A', v: soi('08/07/2023', '$12,334', '12,332', '12,332', '$0.00', '0.0%', '$0', '$0', '$0') },
    ],
    total: { invested: '$35,767', shares: '24,675', cse: '24,675', fdo: '0.8%', realized: '$0', unrealized: '$0', total: '$0' },
  },
  {
    name: 'Backside Blocks', currency: 'NIO', symbol: 'C$',
    securities: [
      { name: 'Common Warrant', v: soi('05/10/2021', 'NIO 5,000', '1,000', '1,000', 'NIO 56.14', '0.2%', 'NIO 0', 'NIO 56,138', 'NIO 56,138') },
    ],
    total: { invested: 'NIO 5,000', shares: '1,000', cse: '1,000', fdo: '0.2%', realized: 'NIO 0', unrealized: 'NIO 56,138', total: 'NIO 56,138' },
  },
  {
    name: 'Cohesity', currency: 'USD', symbol: '$',
    securities: [
      { name: 'Common', v: soi('06/11/1975', '$3,333', '111', '111', '$0.00', '0.0%', '$0', '$0', '$0') },
    ],
    total: { invested: '$3,333', shares: '111', cse: '111', fdo: '0.0%', realized: '$0', unrealized: '$0', total: '$0' },
  },
  {
    name: 'DataBricks', currency: 'USD', symbol: '$',
    securities: [
      { name: 'Series E Preferred', v: soi('03/20/2024', '$34,434', '2,134', '2,134', '$33.50', '0.3%', '$0', '$71,495', '$71,495') },
    ],
    total: { invested: '$34,434', shares: '2,134', cse: '2,134', fdo: '0.3%', realized: '$0', unrealized: '$71,495', total: '$71,495' },
  },
];

/* ---------------------------------------------------------------------------
 * Daily NAV
 * ------------------------------------------------------------------------ */

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

export const navCompanies: Array<{ name: string; prev?: [string, string, string] }> = [
  { name: 'PC Laptops' }, { name: 'No financials' },
  { name: 'jan23', prev: ['12/31/2022', '$60,574,575', '$446.10'] },
  { name: 'Notes Only' }, { name: 'No Measurement Date' }, { name: 'Dec 30 MD' }, { name: 'PIK' },
  { name: 'Old Timer' }, { name: 'Company 31' }, { name: 'Test April 3 2025' }, { name: 'X-Mode Test' },
  { name: 'testttrrrrr' }, { name: 'SEM' }, { name: 'Jun 3 25' }, { name: 'Test Company April 30' },
  { name: 'Debt Only' }, { name: 'ABC Co' }, { name: 'SpaceX' }, { name: 'DataBricks' }, { name: 'Rarestep' },
  { name: 'Future Exit Liq Pref' }, { name: 'Future 4 Liq Pref' }, { name: 'New Kewing Company' },
  { name: 'Empty Company' }, { name: 'Etrade' }, { name: 'New Company' }, { name: 'GPC' },
  { name: 'Backside Blocks', prev: ['03/31/2025', '$4,778,382,719', '$2.67'] },
];
