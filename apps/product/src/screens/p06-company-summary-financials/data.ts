/**
 * Demo figures for ABC Co's Summary and Financials pages, copied from the
 * Figma frames on page 06 (FY 2024 actuals, financials date 12/31/2024).
 */
import type { RowLabelType, ValueKind } from '@scalar/design-system';

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

const src = (v: string): GridValue => ({ v, kind: 'sourced' });
const ed = (v: string): GridValue => ({ v, kind: 'editable' });
const tot = (v: string): GridValue => ({ v, kind: 'total' });

export const financialsDate = '12/31/2024';
export const financialsVersion = 'Financial Statement 2024-12-31';
export const versions = [{ value: 'primary', label: 'Primary Financial Statement' }];

/* --- Income Statement ------------------------------------------------------
 * Columns: FY 2022 · FY 2023 · FY 2024 | FY 2025 · FY 2026 · FY 2027 | LTM · NTM */
export const incomeStatementRows: GridRowDef[] = [
  { label: 'Total Revenue', values: [, , src('$22,118'), , , , ed('$22,118'), ,] },
  { label: 'Total Cost of Sales', values: [, , src('$3,078'), , , , ed('$3,078'), ,] },
  { label: 'Gross Profit', type: 'child', emptyKind: 'calculated', values: [, , '$19,041', , , , '$19,041', ,] },
  { label: 'Operating Expenses', values: [, , src('$6,301'), , , , ed('$6,301'), ,] },
  { label: 'EBITDA', type: 'subtotal', emptyKind: 'calculated', values: [, , '$12,739', , , , '$12,739', ,] },
  { label: 'Depreciation Expense', values: [, , src('$2,503'), , , , ed('$2,503'), ,] },
  { label: 'Amortization Expense' },
  { label: 'EBIT', type: 'subtotal', emptyKind: 'calculated', values: [, , '$10,236', , , , '$10,236', ,] },
  { label: 'Interest Expense / (Income)' },
  { label: 'Other Expense / (Income)' },
  { label: 'Pretax Income', type: 'child', emptyKind: 'calculated', values: [, , '$10,236', , , , '$10,236', ,] },
  { label: 'Income Taxes' },
  { label: 'Net Income', type: 'total', emptyKind: 'total', values: [, , tot('$10,236'), , , , tot('$10,236'), ,] },
];

export const performanceMetricRows: GridRowDef[] = [
  { label: 'Revenue Growth Rate', values: ['N/A', '0.0%', 'N/A', 'N/A', '0.0%', '0.0%', 'N/A', 'N/A'] },
  { label: 'Cost of Sales %', values: ['0.0%', '0.0%', '13.9%', '0.0%', '0.0%', '0.0%', '13.9%', '0.0%'] },
  { label: 'Gross Margin', values: ['0.0%', '0.0%', '86.1%', '0.0%', '0.0%', '0.0%', '86.1%', '0.0%'] },
  { label: 'Operating Expense % of Sales', values: ['0.0%', '0.0%', '28.5%', '0.0%', '0.0%', '0.0%', '28.5%', '0.0%'] },
  { label: 'EBITDA Margin', values: ['0.0%', '0.0%', '57.6%', '0.0%', '0.0%', '0.0%', '57.6%', '0.0%'] },
  { label: 'Net Profit Margin', values: ['0.0%', '0.0%', '46.3%', '0.0%', '0.0%', '0.0%', '46.3%', '0.0%'] },
].map((r) => ({ ...r, emptyKind: 'calculated' as const }));

/* --- Balance Sheet ---------------------------------------------------------
 * Three expandable sections. Collapsed, only the section's lead row shows. */
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

export const holdings: HoldingRow[] = [
  { label: 'VIP Fund', type: 'group-header', values: [] },
  { label: 'Holding Co. Holding Common', type: 'line-item', values: ['08/07/2023', '$23,433', '12,343', '12,343', '', '0.8%', '$0', '$0', '$0'] },
  { label: 'Series A', type: 'line-item', values: ['08/07/2023', '$12,334', '12,332', '12,332', '', '0.0%', '$0', '$0', '$0'] },
  { label: 'Fund Total', type: 'subtotal', values: ['', '$35,767', '24,675', '24,675', '', '0.8%', '$0', '$0', '$0'] },
  { label: 'Firm Total', type: 'total', values: ['', '$35,767', '24,675', '24,675', '', '0.8%', '$0', '$0', '$0'] },
];
