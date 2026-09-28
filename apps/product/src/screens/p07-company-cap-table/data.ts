/**
 * Demo data for the Cap Table pages. ABC Co's two securities, the VIP Fund
 * and Holding Co. positions in them, and the three investment transactions
 * that fund those positions — the same figures appear on every sub-page and
 * on the Valuations conclusions (p08).
 */

export interface Security {
  id: string;
  /** Empty for a column that has just been added. */
  name: string;
  investmentDate?: string;
  /** One of SECURITY_TYPES; undefined = not chosen yet. */
  type?: string;
  originalIssuePrice?: number;
  sharesOutstanding?: number;
  conversionRate?: number;
  /** Firm holdings (Spatical Ventures) in this security. */
  firmShares: number;
  firmLiquidationPreference: number;
}

export const SECURITY_TYPES = ['Preferred Stock', 'Common Stock', 'Warrant', 'Option', 'Unissued Options', 'Note'] as const;

export const SECURITIES: Security[] = [
  {
    id: 'common', name: 'Common', type: 'Common Stock', sharesOutstanding: 88_888_888,
    firmShares: 0, firmLiquidationPreference: 0,
  },
  {
    id: 'series-a', name: 'Series A', investmentDate: '08/07/2017', type: 'Preferred Stock',
    originalIssuePrice: 1, sharesOutstanding: 1_112_233, conversionRate: 1,
    firmShares: 12_332, firmLiquidationPreference: 12_332,
  },
];

export const newSecurity = (): Security => ({
  id: `new-${Math.random().toString(36).slice(2, 7)}`, name: '', firmShares: 0, firmLiquidationPreference: 0,
});

/** Fund Ownership — one column per (fund, security) position. */
export interface Position {
  id: string;
  /** Security name; empty for a just-added column. */
  security: string;
  entity?: string;
  fund?: string;
  investmentDate?: string;
  investedCapital: number;
  shares: number;
  sharesAsConverted: number;
  initialLiquidationPreference: number;
}

export const POSITIONS: Position[] = [
  { id: 'p1', security: 'Series A', entity: 'ABC Co', fund: 'VIP Fund', investmentDate: '08/07/2023', investedCapital: 12_334, shares: 12_332, sharesAsConverted: 12_332, initialLiquidationPreference: 12_332 },
  { id: 'p2', security: 'Holding Common', entity: 'Holding Co.', fund: 'VIP Fund', investmentDate: '08/07/2023', investedCapital: 23_433, shares: 12_343, sharesAsConverted: 0, initialLiquidationPreference: 0 },
  { id: 'p3', security: 'Common', entity: 'ABC Co', fund: 'Holding Co.', investmentDate: '08/07/2023', investedCapital: 34_234, shares: 12_344, sharesAsConverted: 12_344, initialLiquidationPreference: 0 },
];

export const ENTITIES = ['ABC Co', 'Holding Co.'] as const;
export const FUNDS = ['VIP Fund', 'Holding Co.'] as const;
export const POSITION_SECURITIES = ['Series A', 'Holding Common', 'Common'] as const;

/** Cash Flow Ledger transactions (sourced from the Fund Ownership positions). */
export interface Transaction {
  id: string;
  date?: string;
  amount: number;
  description?: string;
  type: string;
  owner?: string;
  entity?: string;
  security?: string;
  /** A row the user just added — its cells are editable. */
  draft?: boolean;
}

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '08/07/2023', amount: 34_234, description: 'Investment', type: 'Investment', entity: 'ABC Co', security: 'Common' },
  { id: 't2', date: '08/07/2023', amount: 23_433, description: 'Investment', type: 'Investment', owner: 'VIP Fund', entity: 'Holding Co.', security: 'Holding Common' },
  { id: 't3', date: '08/07/2023', amount: 12_334, description: 'Investment', type: 'Investment', owner: 'VIP Fund', entity: 'ABC Co', security: 'Series A' },
];

export const TRANSACTION_TYPES = ['Investment', 'Distribution', 'Sale of shares'] as const;

export const CASH_FLOW_SUMMARY = [
  { fund: 'Holding Co.', investments: 34_234, proceeds: 0, netCostBasis: -34_234, irr: 'N/A' },
  { fund: 'VIP Fund', investments: 35_767, proceeds: 0, netCostBasis: -35_767, irr: 'N/A' },
];
