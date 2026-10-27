/**
 * Figures for the Company · Valuations screens, keyed off the company record.
 *
 * ABC Co is the company in the Figma frames and gets the frame figures
 * verbatim (Prism Navigation V4 figures for the populated Summary; the Cap
 * Table positions, at $0 value, for Conclusions). Any other company gets the
 * same shape scaled to its record: summary money scaled by
 * `equityValue ÷ $56.9M` (the frame's equity value), its own cap-table
 * securities for per-share rows and backsolve targets, and its fund position
 * valued at `fairValue` in Conclusions.
 */
import type { RowLabelType, ValueKind } from '@scalar/design-system';
import { usd, type Company } from '../../data/fixtures.js';
import { fundNameOf, positionsFor, securitiesFor } from '../p07-company-cap-table/data.js';
import { displayValue, pct1 } from '../../domain/display.js';
import { includedApproaches, type ApproachType, type ValuationVersion } from '../../domain/model.js';

const isFrame = (c: Company) => c.id === 'abc-co';
/** The frame's equity value, in $ thousands (the unit the page is set to). */
const FRAME_EQUITY_K = 56_938;
const scaleOf = (c: Company) => (isFrame(c) ? 1 : c.equityValue / 1000 / FRAME_EQUITY_K);
const k$ = (v: number) => usd.format(Math.round(v));
const $2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/**
 * Header Valuation Info (in $ thousands). The frame version has no concluded
 * approach yet, so ABC Co reads "Not calculated" — never a placeholder $0 (P5).
 */
export function headlineFor(c: Company): { equityValue: string; unrealized: string } {
  const absence = isFrame(c) ? 'not-calculated' : undefined;
  return {
    equityValue: displayValue(c.equityValue / 1000, k$, absence),
    unrealized: displayValue(c.fairValue / 1000, k$, absence),
  };
}

export interface SummaryRow {
  label: string;
  type: RowLabelType;
  kind: ValueKind;
  ev?: string;
  equity?: string;
  waterfall?: string;
  opm?: string;
}

/** The frame's per-approach figures ($ thousands). Approaches without figures read "Not calculated" (P5). */
const APPROACH_FIGURES: Partial<Record<ApproachType, { ev: number; equity: number }>> = {
  gpc: { ev: 122_397, equity: 35_703 },
  'ma-comps': { ev: 164_867, equity: 78_173 },
};

/**
 * Valuation Summary — approaches → scenario equity → weighted enterprise value.
 * Rows and weights come from the valuation version in view; calibrated
 * approaches are reference-only and left out (P8).
 */
export function approachRowsFor(c: Company, v?: ValuationVersion): SummaryRow[] {
  const s = scaleOf(c);
  const m = (x: number) => k$(x * s);
  const scenario = (method: string) => v?.scenarios.find((x) => x.method === method)?.weight;
  const w = (x: number | undefined) => (x === undefined ? undefined : pct1(x));
  return [
    { label: 'Valuation Approaches', type: 'subtotal', kind: 'calculated' },
    ...includedApproaches(v).map((a): SummaryRow => {
      const f = APPROACH_FIGURES[a.type];
      const absent = f ? undefined : 'not-calculated';
      return {
        label: a.name, type: 'child', kind: 'editable',
        ev: displayValue(f?.ev, m, absent), equity: displayValue(f?.equity, m, absent),
        waterfall: pct1(a.weight), opm: pct1(a.weight),
      };
    }),
    { label: 'Scenario Equity Value', type: 'line-item', kind: 'calculated', waterfall: m(56_938), opm: m(56_938) },
    { label: 'Scenario Weighting/Probability', type: 'line-item', kind: 'editable', waterfall: w(scenario('Waterfall')), opm: w(scenario('OPM')) },
    { label: 'Weighted Equity Value', type: 'line-item', kind: 'calculated', opm: m(56_938) },
    { label: 'Debt', type: 'line-item', kind: 'calculated', opm: m(96_137) },
    { label: 'Cash', type: 'line-item', kind: 'calculated', opm: m(9_443) },
    { label: 'Weighted Enterprise Value', type: 'total', kind: 'total', opm: m(143_632) },
  ];
}

export interface AllocationRow {
  label: string;
  type: RowLabelType;
  /** Kind of the Waterfall and OPM cells; the Weighted column is always calculated. */
  kind: ValueKind;
  values: [string?, string?, string?];
}

/** Frame figures. The Waterfall $0.00s are real results: those series receive nothing at this equity value. */
// lint-allow-block: real-zero
const FRAME_PER_SHARE: Array<[string, string, string, string]> = [
  ['Series I (Cash)', '$773.55', '$513.88', '$708.63'],
  ['Series I (Exchange)', '$696.08', '$462.76', '$637.75'],
  ['Series II (Cash)', '$714.90', '$475.18', '$654.97'],
  ['Series II (Exchange)', '$0.00', '$451.55', '$622.20'],
  ['Series A Preferred', '$0.00', '$281.31', '$70.33'],
  ['Series B Preferred', '$0.00', '$52.64', '$13.16'],
  ['Series C Preferred', '$0.00', '$8.26', '$2.06'],
  ['Series D', '$0.00', '$0.75', '$0.19'],
  ['Series E', '$0.00', '$439,424.67', '$109,856.17'],
];
// lint-allow-end

/** Per-share value of each of the company's securities, by scenario and weighted (75/25). */
function perShareFor(c: Company): Array<[string, string, string, string]> {
  if (isFrame(c)) return FRAME_PER_SHARE;
  const pps = c.lastRound.pricePerShare;
  return securitiesFor(c).map((sec) => {
    const w = sec.type === 'Preferred Stock' ? (sec.originalIssuePrice ?? pps) : pps * 0.6;
    const o = w * 0.9;
    return [sec.name, $2.format(w), $2.format(o), $2.format(w * 0.75 + o * 0.25)];
  });
}

/** Equity Allocation — per-scenario inputs, allocated value and value per share. */
export function allocationRowsFor(c: Company, v?: ValuationVersion, capTableName = 'Primary Captable'): AllocationRow[] {
  const eq = k$(FRAME_EQUITY_K * scaleOf(c));
  const scenario = (method: string) => {
    const x = v?.scenarios.find((s) => s.method === method)?.weight;
    return x === undefined ? undefined : pct1(x);
  };
  return [
    { label: 'Allocation Method', type: 'line-item', kind: 'editable', values: ['Waterfall', 'OPM'] },
    // The Cap Table version in the valuation context (P1).
    { label: 'Cap Table Selection', type: 'line-item', kind: 'editable', values: [capTableName, capTableName] },
    { label: 'OPM Inputs', type: 'subtotal', kind: 'calculated', values: [] },
    { label: 'Maturity', type: 'child', kind: 'editable', values: [undefined, '5'] },
    { label: 'Risk Free Rate', type: 'child', kind: 'editable', values: [undefined, '4.38%'] },
    { label: 'Volatility Source', type: 'child', kind: 'editable', values: [undefined, 'Specified'] },
    { label: 'Volatility', type: 'child', kind: 'editable', values: [undefined, '50.0%'] },
    { label: 'Future Equity Value', type: 'line-item', kind: 'calculated', values: [] },
    { label: 'Present Equity Value', type: 'line-item', kind: 'calculated', values: [eq, eq] },
    { label: 'Scenario Weighting/Probability', type: 'line-item', kind: 'editable', values: [scenario('Waterfall'), scenario('OPM')] },
    { label: 'Value Allocated to Security Class', type: 'subtotal', kind: 'calculated', values: [] },
    { label: 'Total', type: 'total', kind: 'total', values: [eq, eq, eq] },
    { label: 'Present Value per Share', type: 'subtotal', kind: 'calculated', values: [undefined, undefined, 'Weighted Value per Share'] },
    ...perShareFor(c).map(([label, w, o, x]): AllocationRow => ({ label, type: 'child', kind: 'calculated', values: [w, o, x] })),
  ];
}

export interface Conclusion {
  /** Entity the table is for (ABC Co, Holding Co.). */
  entity: string;
  /** False until an approach concludes: values are then "Not calculated", not $0 (P5). */
  concluded: boolean;
  funds: Array<{
    fund: string;
    positions: Array<{ security: string; invested: number; valuePerShare: number; shares: number; value: number }>;
  }>;
}

/** Conclusions — value and MOIC of each fund's position, grouped by entity then fund. */
export function conclusionsFor(c: Company): Conclusion[] {
  if (isFrame(c)) {
    return [
      {
        entity: 'ABC Co',
        concluded: false,
        funds: [
          { fund: 'VIP Fund', positions: [{ security: 'Series A', invested: 12_334, valuePerShare: 0, shares: 12_332, value: 0 }] },
          { fund: 'Holding Co.', positions: [{ security: 'Common', invested: 34_234, valuePerShare: 0, shares: 12_344, value: 0 }] },
        ],
      },
      {
        entity: 'Holding Co.',
        concluded: false,
        funds: [{ fund: 'VIP Fund', positions: [{ security: 'Holding Common', invested: 23_433, valuePerShare: 0, shares: 12_343, value: 0 }] }],
      },
    ];
  }
  const positions = positionsFor(c);
  const shares = positions.reduce((a, p) => a + p.shares, 0) || 1;
  return [{
    entity: c.name,
    concluded: true,
    funds: [{
      fund: fundNameOf(c),
      positions: positions.map((p) => ({
        security: p.security, invested: p.investedCapital, shares: p.shares,
        valuePerShare: c.fairValue / shares, value: (c.fairValue * p.shares) / shares,
      })),
    }],
  }];
}

/** Backsolve */
export const ALLOCATION_METHODS = ['Waterfall', 'CSE', 'OPM'] as const;
/** The securities a backsolve can target — the company's cap-table securities. */
export const targetSecuritiesFor = (c: Company): string[] => securitiesFor(c).map((s) => s.name);
