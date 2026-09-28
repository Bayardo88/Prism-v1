/**
 * Summary and Financials detail data, keyed off the company record.
 *
 * The figures are the ones drawn in the Figma frames for ABC Co (FY 2024
 * actuals, $ thousands). Every other company gets the same shape scaled by
 * its own record — P&L by `revenueLtm`, holdings by `invested` / `ownershipPct`
 * — so ABC Co reproduces the frames and the other 199 read plausibly.
 */
import type { RowLabelType, ValueKind } from '@scalar/design-system';
import { db, num, type Company } from '../../data/fixtures.js';
import { usDate } from '../../data/db.js';

/** One value cell. A bare string is a calculated figure. */
export type GridValue = string | { v?: string; kind: ValueKind; focused?: boolean } | undefined;

export interface GridRowDef {
  label: string;
  type?: RowLabelType;
  /** Values in column order; missing entries render as empty cells of `emptyKind`. */
  values?: GridValue[];
  /** Kind of an empty cell in this row (editable line items vs calculated totals). */
  emptyKind?: ValueKind;
}

/** ABC Co's record — the frames' reference company. */
const REF = db.companies.byId('abc-co')!;

const k$ = (v: number) => `$${num.format(Math.round(v))}`;
const src = (v: string): GridValue => ({ v, kind: 'sourced' });
const ed = (v: string): GridValue => ({ v, kind: 'editable' });
const tot = (v: string): GridValue => ({ v, kind: 'total' });

/* --- Periods -------------------------------------------------------------- */

/** The company's financials date drives every period on the page. */
export function periods(company: Company) {
  const [y, m, d] = company.asOfIso.split('-').map(Number) as [number, number, number];
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    /** Latest complete fiscal year (Dec year-end): the as-of year when it is a year end, else the one before. */
    year: m === 12 && d === 31 ? y : y - 1,
    financialsDate: company.asOf,
    financialsVersion: `Financial Statement ${company.asOfIso}`,
    ltm: company.asOf,
    ntm: `${pad(m)}/${pad(d)}/${y + 1}`,
  };
}

export const versions = [{ value: 'primary', label: 'Primary Financial Statement' }];

/* --- Income Statement ------------------------------------------------------
 * Columns: FY Y-2 · FY Y-1 · FY Y | 3 projection years | LTM · NTM.
 * Only the latest actual year and LTM carry figures, as in the frame. */

const IS_BASE = {
  revenue: 22118, cos: 3078, gross: 19041, opex: 6301, ebitda: 12739, dep: 2503, ebit: 10236, pretax: 10236, net: 10236,
};

export function incomeStatementRows(company: Company): GridRowDef[] {
  const f = company.revenueLtm / REF.revenueLtm;
  const v = (n: number) => k$(n * f);
  const at = (fy: GridValue, ltm: GridValue): GridValue[] => [undefined, undefined, fy, undefined, undefined, undefined, ltm, undefined];
  const b = IS_BASE;
  return [
    { label: 'Total Revenue', values: at(src(v(b.revenue)), ed(v(b.revenue))) },
    { label: 'Total Cost of Sales', values: at(src(v(b.cos)), ed(v(b.cos))) },
    { label: 'Gross Profit', type: 'child', emptyKind: 'calculated', values: at(v(b.gross), v(b.gross)) },
    { label: 'Operating Expenses', values: at(src(v(b.opex)), ed(v(b.opex))) },
    { label: 'EBITDA', type: 'subtotal', emptyKind: 'calculated', values: at(v(b.ebitda), v(b.ebitda)) },
    { label: 'Depreciation Expense', values: at(src(v(b.dep)), ed(v(b.dep))) },
    { label: 'Amortization Expense' },
    { label: 'EBIT', type: 'subtotal', emptyKind: 'calculated', values: at(v(b.ebit), v(b.ebit)) },
    { label: 'Interest Expense / (Income)' },
    { label: 'Other Expense / (Income)' },
    { label: 'Pretax Income', type: 'child', emptyKind: 'calculated', values: at(v(b.pretax), v(b.pretax)) },
    { label: 'Income Taxes' },
    { label: 'Net Income', type: 'total', emptyKind: 'total', values: at(tot(v(b.net)), tot(v(b.net))) },
  ];
}

/** Ratios, so they are the same at any scale. */
export const performanceMetricRows: GridRowDef[] = [
  { label: 'Revenue Growth Rate', values: ['N/A', '0.0%', 'N/A', 'N/A', '0.0%', '0.0%', 'N/A', 'N/A'] },
  { label: 'Cost of Sales %', values: ['0.0%', '0.0%', '13.9%', '0.0%', '0.0%', '0.0%', '13.9%', '0.0%'] },
  { label: 'Gross Margin', values: ['0.0%', '0.0%', '86.1%', '0.0%', '0.0%', '0.0%', '86.1%', '0.0%'] },
  { label: 'Operating Expense % of Sales', values: ['0.0%', '0.0%', '28.5%', '0.0%', '0.0%', '0.0%', '28.5%', '0.0%'] },
  { label: 'EBITDA Margin', values: ['0.0%', '0.0%', '57.6%', '0.0%', '0.0%', '0.0%', '57.6%', '0.0%'] },
  { label: 'Net Profit Margin', values: ['0.0%', '0.0%', '46.3%', '0.0%', '0.0%', '0.0%', '46.3%', '0.0%'] },
].map((r) => ({ ...r, emptyKind: 'calculated' as const }));

/* --- Balance Sheet ---------------------------------------------------------
 * Three expandable sections. Collapsed, only the section's lead row shows.
 * Every cell is empty in the frames (nothing entered yet). */
export interface BalanceSection {
  key: 'assets' | 'current-liabilities' | 'long-term-liabilities';
  lead: string;
  rows: GridRowDef[];
}

const calc = (label: string, type: RowLabelType): GridRowDef => ({ label, type, emptyKind: 'calculated' });

export const balanceSheetSections: BalanceSection[] = [
  {
    key: 'assets',
    lead: 'Cash and Equivalents',
    rows: [
      { label: 'Accounts Receivable' },
      { label: 'Inventory' },
      { label: 'Other Current Assets' },
      calc('Total Current Assets', 'subtotal'),
      { label: 'PPE' },
      { label: 'Intangibles' },
      { label: 'Other Long Term Assets' },
      calc('Total Long Term Assets', 'subtotal'),
      calc('Total Assets', 'total'),
    ],
  },
  {
    key: 'current-liabilities',
    lead: 'Short Term Debt',
    rows: [
      { label: 'Accounts Payable' },
      { label: 'Accrued Liabilities' },
      { label: 'Deferred Revenue' },
      { label: 'Other Current Liabilities' },
      calc('Total Current Liabilities', 'subtotal'),
    ],
  },
  {
    key: 'long-term-liabilities',
    lead: 'Long Term Debt',
    rows: [
      { label: 'Other Long Term Liabilities' },
      calc('Total Long Term Liabilities', 'subtotal'),
      calc('Total Liabilities', 'total'),
      { label: 'Equity' },
      calc('Total Liabilities and Equity', 'total'),
    ],
  },
];

/* --- Summary Holdings ----------------------------------------------------- */
export const holdingsColumns = [
  'Investment Date', 'Invested Capital', 'Shares', 'CSE Shares', 'Concluded Share Value',
  'Fully Diluted Ownership', 'Realized Value', 'Unrealized Value', 'Total Value',
];

export interface HoldingRow {
  label: string;
  type: RowLabelType;
  values: string[];
}

/** The company's positions, grouped under its own fund (the frame: VIP Fund, two securities). */
export function holdings(company: Company): HoldingRow[] {
  const fund = db.funds.byId(company.fundId)?.name ?? 'Fund';
  const fi = company.invested / REF.invested;
  const fo = company.ownershipPct / REF.ownershipPct;
  const date = usDate(company.investmentDate);
  const positions = [
    { label: 'Holding Co. Holding Common', invested: 23433, shares: 12343, own: 0.8 },
    { label: 'Series A', invested: 12334, shares: 12332, own: 0.0 },
  ].map((p) => ({ ...p, invested: p.invested * fi, shares: Math.round(p.shares * fi), own: p.own * fo }));
  const sum = (k: 'invested' | 'shares' | 'own') => positions.reduce((s, p) => s + p[k], 0);
  const row = (label: string, type: RowLabelType, d: string, inv: number, sh: number, own: number): HoldingRow => ({
    label, type, values: [d, k$(inv), num.format(sh), num.format(sh), '', `${own.toFixed(1)}%`, '$0', '$0', '$0'],
  });
  return [
    { label: fund, type: 'group-header', values: [] },
    ...positions.map((p) => row(p.label, 'line-item', date, p.invested, p.shares, p.own)),
    row('Fund Total', 'subtotal', '', sum('invested'), sum('shares'), sum('own')),
    row('Firm Total', 'total', '', sum('invested'), sum('shares'), sum('own')),
  ];
}
