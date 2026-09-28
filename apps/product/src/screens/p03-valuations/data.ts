/**
 * Firm Valuations demo data, copied from the Figma frames on page 03. Values
 * are withheld (Not Applicable) until a valuation is published.
 */
import type { GridCol } from '../p02-intelligence/PortfolioGrid.js';

export const valuationColumns: GridCol[] = [
  { key: 'valDate', label: 'Valuation Date', numeric: true },
  { key: 'process', label: 'Process Management' },
  { key: 'status', label: 'Valuation Status' },
  { key: 'approaches', label: 'Valuation Approaches' },
  { key: 'ev', label: 'Enterprise Value', numeric: true },
  { key: 'eqv', label: 'Equity Value', numeric: true },
  { key: 'breakeven', label: 'Breakeven Exit Equity', numeric: true },
  { key: 'alloc', label: 'Allocation Method' },
  { key: 'cfv', label: 'Current Fund Value', numeric: true },
  { key: 'chg', label: '% Change from Previous', numeric: true },
];

export type ValStatus = 'draft' | 'final' | 'published';

export interface ValuationRow {
  name: string;
  status: ValStatus;
  /** Open process-management tasks (document requests, questions). */
  tasks?: boolean;
  v: Record<string, string>;
}

/** An unpublished valuation: only the date (and an empty approaches / allocation cell) shows. */
const draft = (name: string, valDate: string, tasks?: boolean): ValuationRow =>
  ({ name, status: 'draft', tasks, v: { valDate, approaches: '', alloc: '' } });

export const valuationRows: ValuationRow[] = [
  draft('PC Laptops', '12/31/2020'),
  draft('PIK', '12/31/2023'),
  draft('Euros Financials (EUR)', '09/30/2024'),
  draft('Future 4 Liq Pref (EUR)', '12/31/2024'),
  draft('ABC Co', '12/31/2024'),
  draft('Fund Owns Preferred Notes', '12/31/2024'),
  draft('jan23', '03/31/2025'),
  draft('SpaceX', '09/30/2025'),
  {
    name: 'Backside Blocks (NIO)', status: 'final',
    v: { valDate: '03/31/2025', approaches: 'BV, PC', ev: '$4,778,382,719', eqv: '$4,778,382,719', breakeven: '357,522', alloc: 'OPM, Waterfall', cfv: '$1,533', chg: '84.73%' },
  },
  {
    name: 'Debt Only', status: 'published',
    v: { valDate: '09/30/2025', approaches: '', ev: '$0', eqv: '$0', breakeven: '0', alloc: '', cfv: '$122,344', chg: '0.00%' },
  },
  draft('Rarestep', '03/31/2025'),
  draft('Cohesity', '05/01/2026'),
  draft('DataBricks', '06/30/2026', true),
  draft('Notes Only', '06/30/2026'),
  draft('Perplexity', '05/01/2026'),
];
