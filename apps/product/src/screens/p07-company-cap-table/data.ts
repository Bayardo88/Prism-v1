/**
 * Cap Table data, keyed off the company record (`data/db.ts`).
 *
 * ABC Co is the company drawn in the Figma frames, so it returns the frame
 * figures verbatim (Common + Series A; VIP Fund and Holding Co. positions;
 * three investment transactions). Every other company gets a plausible cap
 * table built from its record: rounds from `stage`, share count from
 * `equityValue ÷ lastRound.pricePerShare`, the firm's position from
 * `ownershipPct`, `invested` and `fundId`. The same builders feed the
 * Valuations pages (p08), so the figures agree across both areas.
 */
import { db, type Company } from '../../data/fixtures.js';
import { usDate } from '../../data/db.js';

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

export const newSecurity = (): Security => ({
  id: `new-${Math.random().toString(36).slice(2, 7)}`, name: '', firmShares: 0, firmLiquidationPreference: 0,
});

const ROUNDS: Record<string, string[]> = {
  Seed: ['Seed'],
  'Series A': ['Seed', 'Series A'],
  'Series B': ['Series A', 'Series B'],
  'Series C': ['Series A', 'Series B', 'Series C'],
  'Series D': ['Series B', 'Series C', 'Series D'],
  Growth: ['Series B', 'Series C', 'Growth'],
  'Pre-IPO': ['Series C', 'Series D', 'Pre-IPO'],
};

const ABC_SECURITIES: Security[] = [
  { id: 'common', name: 'Common', type: 'Common Stock', sharesOutstanding: 88_888_888, firmShares: 0, firmLiquidationPreference: 0 },
  {
    id: 'series-a', name: 'Series A', investmentDate: '08/07/2017', type: 'Preferred Stock',
    originalIssuePrice: 1, sharesOutstanding: 1_112_233, conversionRate: 1,
    firmShares: 12_332, firmLiquidationPreference: 12_332,
  },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const round2 = (v: number) => Math.round(v * 100) / 100;

/** The securities of a company's cap table (Common first, then each preferred round). */
export function securitiesFor(company: Company): Security[] {
  if (company.id === 'abc-co') return ABC_SECURITIES;
  const pps = company.lastRound.pricePerShare;
  const total = Math.max(1_000_000, Math.round(company.equityValue / Math.max(pps, 0.01)));
  const rounds = ROUNDS[company.stage] ?? ['Series A'];
  const common = Math.round(total * 0.6);
  const perRound = Math.round((total - common) / rounds.length);
  const lastYear = Number(company.lastRound.date.slice(0, 4));
  const firmTotal = Math.round((company.ownershipPct / 100) * total);
  const prefs = rounds.map((name, i): Security => {
    const oip = round2(pps * ((i + 1) / rounds.length));
    const last = i === rounds.length - 1;
    const firmShares = last ? Math.min(firmTotal, perRound) : 0;
    const date = last
      ? usDate(company.lastRound.date)
      : usDate(`${lastYear - (rounds.length - 1 - i) * 2}${company.lastRound.date.slice(4)}`);
    return {
      id: slug(name), name, investmentDate: date, type: 'Preferred Stock',
      originalIssuePrice: oip, sharesOutstanding: perRound, conversionRate: 1,
      firmShares, firmLiquidationPreference: Math.round(firmShares * oip),
    };
  });
  return [{ id: 'common', name: 'Common', type: 'Common Stock', sharesOutstanding: common, firmShares: 0, firmLiquidationPreference: 0 }, ...prefs];
}

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

const ABC_POSITIONS: Position[] = [
  { id: 'p1', security: 'Series A', entity: 'ABC Co', fund: 'VIP Fund', investmentDate: '08/07/2023', investedCapital: 12_334, shares: 12_332, sharesAsConverted: 12_332, initialLiquidationPreference: 12_332 },
  { id: 'p2', security: 'Holding Common', entity: 'Holding Co.', fund: 'VIP Fund', investmentDate: '08/07/2023', investedCapital: 23_433, shares: 12_343, sharesAsConverted: 0, initialLiquidationPreference: 0 },
  { id: 'p3', security: 'Common', entity: 'ABC Co', fund: 'Holding Co.', investmentDate: '08/07/2023', investedCapital: 34_234, shares: 12_344, sharesAsConverted: 12_344, initialLiquidationPreference: 0 },
];

export const fundNameOf = (company: Company) => db.funds.byId(company.fundId)?.name ?? 'Spatical Fund I';

/** The firm's positions in the company, as Fund Ownership columns. */
export function positionsFor(company: Company): Position[] {
  if (company.id === 'abc-co') return ABC_POSITIONS;
  const fund = fundNameOf(company);
  return securitiesFor(company).filter((s) => s.firmShares > 0).map((s, i) => ({
    id: `p${i + 1}`, security: s.name, entity: company.name, fund,
    investmentDate: usDate(company.investmentDate),
    investedCapital: company.invested, shares: s.firmShares, sharesAsConverted: s.firmShares,
    initialLiquidationPreference: s.firmLiquidationPreference,
  }));
}

/** Options for the Entity / Fund / Security pickers. */
export function entitiesFor(company: Company): string[] {
  return company.id === 'abc-co' ? ['ABC Co', 'Holding Co.'] : [company.name];
}
export function fundsFor(company: Company): string[] {
  const own = company.id === 'abc-co' ? ['VIP Fund', 'Holding Co.'] : [fundNameOf(company)];
  return [...own, ...db.funds.all().map((f) => f.name).filter((n) => !own.includes(n))];
}
export function positionSecuritiesFor(company: Company): string[] {
  return company.id === 'abc-co' ? ['Series A', 'Holding Common', 'Common'] : securitiesFor(company).map((s) => s.name);
}

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

export function transactionsFor(company: Company): Transaction[] {
  if (company.id === 'abc-co') {
    return [
      { id: 't1', date: '08/07/2023', amount: 34_234, description: 'Investment', type: 'Investment', entity: 'ABC Co', security: 'Common' },
      { id: 't2', date: '08/07/2023', amount: 23_433, description: 'Investment', type: 'Investment', owner: 'VIP Fund', entity: 'Holding Co.', security: 'Holding Common' },
      { id: 't3', date: '08/07/2023', amount: 12_334, description: 'Investment', type: 'Investment', owner: 'VIP Fund', entity: 'ABC Co', security: 'Series A' },
    ];
  }
  return positionsFor(company).map((p, i) => ({
    id: `t${i + 1}`, date: p.investmentDate, amount: p.investedCapital, description: 'Investment',
    type: 'Investment', owner: p.fund, entity: p.entity, security: p.security,
  }));
}

export const TRANSACTION_TYPES = ['Investment', 'Distribution', 'Sale of shares'] as const;

export interface CashFlowLine { fund: string; investments: number; proceeds: number; netCostBasis: number; irr: string }

export function cashFlowSummaryFor(company: Company): CashFlowLine[] {
  if (company.id === 'abc-co') {
    return [
      { fund: 'Holding Co.', investments: 34_234, proceeds: 0, netCostBasis: -34_234, irr: 'N/A' },
      { fund: 'VIP Fund', investments: 35_767, proceeds: 0, netCostBasis: -35_767, irr: 'N/A' },
    ];
  }
  const byFund = new Map<string, number>();
  for (const t of transactionsFor(company)) {
    const k = t.owner ?? company.name;
    byFund.set(k, (byFund.get(k) ?? 0) + t.amount);
  }
  return [...byFund].map(([fund, investments]) => ({ fund, investments, proceeds: 0, netCostBasis: -investments, irr: 'N/A' }));
}

/** Calculated breakpoints: preferences first, then common catch-up to the top issue price, then pro rata. */
export interface Breakpoint { range: string; price: string; bySecurity: string[]; total: string }

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function breakpointsFor(company: Company): { securities: string[]; points: Breakpoint[] } {
  const secs = securitiesFor(company);
  const isPref = (s: Security) => s.type === 'Preferred Stock';
  const lp = (s: Security) => (s.sharesOutstanding ?? 0) * (s.originalIssuePrice ?? 0);
  const totalLp = secs.filter(isPref).reduce((a, s) => a + lp(s), 0);
  const topPrice = Math.max(0, ...secs.filter(isPref).map((s) => s.originalIssuePrice ?? 0));
  const catchUp = secs.filter((s) => !isPref(s)).reduce((a, s) => a + (s.sharesOutstanding ?? 0) * topPrice, 0);
  const top = totalLp + catchUp;
  return {
    securities: secs.map((s) => s.name),
    points: [
      {
        range: `${usd0.format(0)} to ${usd0.format(totalLp)}`, price: '$0.000',
        bySecurity: secs.map((s) => usd0.format(isPref(s) ? lp(s) : 0)), total: usd0.format(totalLp),
      },
      {
        range: `${usd0.format(totalLp)} to ${usd0.format(top)}`, price: `$${topPrice.toFixed(3)}`,
        bySecurity: secs.map((s) => usd0.format(isPref(s) ? lp(s) : (s.sharesOutstanding ?? 0) * topPrice)),
        total: usd0.format(top),
      },
      { range: `${usd0.format(top)} to Infinity`, price: 'Infinity', bySecurity: secs.map(() => 'Pro Rata'), total: 'Infinity' },
    ],
  };
}
