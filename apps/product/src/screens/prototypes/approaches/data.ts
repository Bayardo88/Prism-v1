/**
 * Sample inputs for the approach prototypes. Every figure is demo data — a
 * plausible shape, not a market observation and not a formula result.
 */
export type ApproachKey = 'external-valuation' | 'specified-share-value' | 'public-comps' | 'transaction-comps';

export const APPROACH_TITLES: Record<ApproachKey, string> = {
  'external-valuation': 'External Valuation',
  'specified-share-value': 'Specified Share Value',
  'public-comps': 'Public Comps',
  'transaction-comps': 'Transaction Comps',
};

export interface Comparable {
  id: string;
  name: string;
  /** Ticker (public) or transaction ID (transaction). Empty for a manual entry. */
  ref: string;
  /** Where the figures came from (C10): fetched from the provider, or typed by the analyst. */
  source: 'provider' | 'manual';
  /** $ millions. Undefined = the provider returned nothing (shown as "—", never 0). */
  ev?: number;
  revenueLtm?: number;
  ebitdaLtm?: number;
}

export const PUBLIC_COMPS: Comparable[] = [
  { id: 'googl', name: 'Alphabet Inc.', ref: 'NasdaqGS:GOOGL', source: 'provider', ev: 2_105_000, revenueLtm: 350_018, ebitdaLtm: 132_400 },
  { id: 'meta', name: 'Meta Platforms, Inc.', ref: 'NasdaqGS:META', source: 'provider', ev: 1_430_000, revenueLtm: 164_501, ebitdaLtm: 86_900 },
  { id: 'snow', name: 'Snowflake Inc.', ref: 'NYSE:SNOW', source: 'provider', ev: 58_200, revenueLtm: 3_626, ebitdaLtm: undefined },
];

export const TRANSACTION_COMPS: Comparable[] = [
  { id: 't1', name: 'Acquisition of Lumen Analytics', ref: 'CIQ-TX-88213', source: 'provider', ev: 1_250, revenueLtm: 140, ebitdaLtm: 22 },
  { id: 't2', name: 'Acquisition of Brightline Data', ref: 'CIQ-TX-90155', source: 'provider', ev: 610, revenueLtm: 88, ebitdaLtm: undefined },
];
