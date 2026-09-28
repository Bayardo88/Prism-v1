/**
 * Demo figures for the Company · Valuations screens, copied from the Figma
 * frames (Prism Navigation V4 figures for the populated Summary; the ABC Co
 * positions from the Cap Table pages for Conclusions and Backsolve).
 */
import type { RowLabelType, ValueKind } from '@scalar/design-system';

export interface SummaryRow {
  label: string;
  type: RowLabelType;
  kind: ValueKind;
  ev?: string;
  equity?: string;
  waterfall?: string;
  opm?: string;
}

/** Valuation Summary — approaches → scenario equity → weighted enterprise value. */
export const APPROACH_ROWS: SummaryRow[] = [
  { label: 'Valuation Approaches', type: 'subtotal', kind: 'calculated' },
  { label: 'GPC', type: 'child', kind: 'editable', ev: '$122,397', equity: '$35,703', waterfall: '50.0%', opm: '50.0%' },
  { label: 'M&A Comps', type: 'child', kind: 'editable', ev: '$164,867', equity: '$78,173', waterfall: '50.0%', opm: '50.0%' },
  { label: 'Scenario Equity Value', type: 'line-item', kind: 'calculated', waterfall: '$56,938', opm: '$56,938' },
  { label: 'Scenario Weighting/Probability', type: 'line-item', kind: 'editable', waterfall: '75.0%', opm: '25.0%' },
  { label: 'Weighted Equity Value', type: 'line-item', kind: 'calculated', opm: '$56,938' },
  { label: 'Debt', type: 'line-item', kind: 'calculated', opm: '$96,137' },
  { label: 'Cash', type: 'line-item', kind: 'calculated', opm: '$9,443' },
  { label: 'Weighted Enterprise Value', type: 'total', kind: 'total', opm: '$143,632' },
];

export interface AllocationRow {
  label: string;
  type: RowLabelType;
  /** Kind of the Waterfall and OPM cells; the Weighted column is always calculated. */
  kind: ValueKind;
  values: [string?, string?, string?];
}

/** Equity Allocation — per-scenario inputs, allocated value and value per share. */
export const ALLOCATION_ROWS: AllocationRow[] = [
  { label: 'Allocation Method', type: 'line-item', kind: 'editable', values: ['Waterfall', 'OPM'] },
  { label: 'Cap Table Selection', type: 'line-item', kind: 'editable', values: ['Primary Cap Table', 'Primary Cap Table'] },
  { label: 'OPM Inputs', type: 'subtotal', kind: 'calculated', values: [] },
  { label: 'Maturity', type: 'child', kind: 'editable', values: [undefined, '5'] },
  { label: 'Risk Free Rate', type: 'child', kind: 'editable', values: [undefined, '4.38%'] },
  { label: 'Volatility Source', type: 'child', kind: 'editable', values: [undefined, 'Specified'] },
  { label: 'Volatility', type: 'child', kind: 'editable', values: [undefined, '50.0%'] },
  { label: 'Future Equity Value', type: 'line-item', kind: 'calculated', values: [] },
  { label: 'Present Equity Value', type: 'line-item', kind: 'calculated', values: ['$56,938', '$56,938'] },
  { label: 'Scenario Weighting/Probability', type: 'line-item', kind: 'editable', values: ['75.0%', '25.0%'] },
  { label: 'Value Allocated to Security Class', type: 'subtotal', kind: 'calculated', values: [] },
  { label: 'Total', type: 'total', kind: 'total', values: ['$56,938', '$56,938', '$56,938'] },
  { label: 'Present Value per Share', type: 'subtotal', kind: 'calculated', values: [undefined, undefined, 'Weighted Value per Share'] },
  { label: 'Series I (Cash)', type: 'child', kind: 'calculated', values: ['$773.55', '$513.88', '$708.63'] },
  { label: 'Series I (Exchange)', type: 'child', kind: 'calculated', values: ['$696.08', '$462.76', '$637.75'] },
  { label: 'Series II (Cash)', type: 'child', kind: 'calculated', values: ['$714.90', '$475.18', '$654.97'] },
  { label: 'Series II (Exchange)', type: 'child', kind: 'calculated', values: ['$0.00', '$451.55', '$622.20'] },
  { label: 'Series A Preferred', type: 'child', kind: 'calculated', values: ['$0.00', '$281.31', '$70.33'] },
  { label: 'Series B Preferred', type: 'child', kind: 'calculated', values: ['$0.00', '$52.64', '$13.16'] },
  { label: 'Series C Preferred', type: 'child', kind: 'calculated', values: ['$0.00', '$8.26', '$2.06'] },
  { label: 'Series D', type: 'child', kind: 'calculated', values: ['$0.00', '$0.75', '$0.19'] },
  { label: 'Series E', type: 'child', kind: 'calculated', values: ['$0.00', '$439,424.67', '$109,856.17'] },
];

export interface Conclusion {
  /** Entity the table is for (ABC Co, Holding Co.). */
  entity: string;
  funds: Array<{
    fund: string;
    positions: Array<{ security: string; invested: number; valuePerShare: number; shares: number; value: number }>;
  }>;
}

/** Conclusions — value and MOIC of each fund's position, grouped by entity then fund. */
export const CONCLUSIONS: Conclusion[] = [
  {
    entity: 'ABC Co',
    funds: [
      { fund: 'VIP Fund', positions: [{ security: 'Series A', invested: 12_334, valuePerShare: 0, shares: 12_332, value: 0 }] },
      { fund: 'Holding Co.', positions: [{ security: 'Common', invested: 34_234, valuePerShare: 0, shares: 12_344, value: 0 }] },
    ],
  },
  {
    entity: 'Holding Co.',
    funds: [
      { fund: 'VIP Fund', positions: [{ security: 'Holding Common', invested: 23_433, valuePerShare: 0, shares: 12_343, value: 0 }] },
    ],
  },
];

/** Backsolve */
export const ALLOCATION_METHODS = ['Waterfall', 'CSE', 'OPM'] as const;
export const CAP_TABLES = ['Primary Captable'] as const;
export const TARGET_SECURITIES = ['Common', 'Series A'] as const;
