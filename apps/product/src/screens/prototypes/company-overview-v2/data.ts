/**
 * Demo datasets for the Company Overview v2 prototype.
 * One bound dataset per ZX Index provider: switching provider swaps the chart
 * series AND the stat tiles together (both read from the same object).
 */
export type Provider = 'zanbato' | 'forge' | 'caplight';
export type Range = '3M' | '6M' | '1Y' | '2Y' | 'YTD' | 'Latest';

export const PROVIDERS: Array<{ value: Provider; label: string }> = [
  { value: 'zanbato', label: 'Zanbato' },
  { value: 'forge', label: 'Forge' },
  { value: 'caplight', label: 'Caplight' },
];
export const RANGES: Range[] = ['3M', '6M', '1Y', '2Y', 'YTD', 'Latest'];

/** Points shown per range on a half-monthly axis (48 points = 2Y). */
const POINTS: Record<Range, number> = { '3M': 6, '6M': 12, '1Y': 24, '2Y': 48, YTD: 17, Latest: 4 };

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
/** 48 half-month labels ending mid-Jun 2026 (the as-of date). */
const AXIS: string[] = Array.from({ length: 48 }, (_, i) => {
  const back = 47 - i;
  const monthIndex = (11 - Math.floor(back / 2) + 24) % 12;
  const year = 26 - Math.ceil((Math.floor(back / 2) - 5) / 12);
  return `${back % 2 === 0 ? '15 ' : '1 '}${MONTHS[monthIndex]} ’${year}`;
});

export const sliceRange = <T,>(values: T[], range: Range): T[] => values.slice(-POINTS[range]);
export const axisFor = (range: Range) => sliceRange(AXIS, range);

/** Deterministic wobble so the demo series look real but never change between renders. */
const wave = (base: number, drift: number, amp: number, phase: number) =>
  Array.from({ length: 48 }, (_, i) => +(base + drift * i + amp * Math.sin(i / 3 + phase) + amp * 0.5 * Math.cos(i / 1.7)).toFixed(2));

export interface ProviderStats {
  avgPrice: number;
  avg1d: number; median1d: number;
  avg5d: number; median5d: number;
  avgSinceVal: number; medianSinceVal: number;
}
export interface ProviderData {
  series: number[];
  stats: ProviderStats;
  robustness: number;
  volume: string;
}

export const ZX: Record<Provider, ProviderData> = {
  zanbato: {
    series: wave(100, 0.35, 2.2, 0),
    stats: { avgPrice: 42.18, avg1d: 0.4, median1d: 0.2, avg5d: 2.1, median5d: 1.7, avgSinceVal: 7.4, medianSinceVal: 6.1 },
    robustness: 82, volume: '184K sh.',
  },
  forge: {
    series: wave(97, 0.28, 2.8, 1.2),
    stats: { avgPrice: 41.02, avg1d: -0.6, median1d: -0.3, avg5d: -5.8, median5d: -4.2, avgSinceVal: 3.2, medianSinceVal: 2.9 },
    robustness: 64, volume: '92K sh.',
  },
  caplight: {
    series: wave(101, 0.2, 1.6, 2.4),
    stats: { avgPrice: 43.55, avg1d: 1.1, median1d: 0.9, avg5d: 4.9, median5d: 5.3, avgSinceVal: -6.7, medianSinceVal: -2.4 },
    robustness: 47, volume: '31K sh.',
  },
};

export interface CompsStats {
  avg1d: number; median1d: number; avg5d: number; median5d: number; avgSinceVal: number; medianSinceVal: number;
}
export const COMPS = {
  publicComps: wave(100, 0.5, 2.6, 0.6),
  peerGroup: wave(100, 0.22, 1.9, 2),
  stats: { avg1d: 0.7, median1d: 0.5, avg5d: 5.6, median5d: 3.8, avgSinceVal: 9.3, medianSinceVal: -5.4 } as CompsStats,
};

export interface BoardDeck {
  name: string; date: string; overview: string;
  callouts: Array<{ label: string; value: string }>;
  highlights: string[];
}
const DECK: BoardDeck = {
  name: 'Q4 2024 Board Deck', date: 'Dec 15, 2024',
  overview: 'Q4 closed ahead of plan on enterprise expansion, with net revenue retention improving as the mid-market segment stabilised. Burn narrowed after the September hiring pause, extending runway into 2027. Management is proposing a Series C in H2 2025 and flagged customer concentration and a delayed EMEA launch as the main risks.',
  callouts: [
    { label: 'ARR', value: '$48.2M' },
    { label: 'Net revenue retention', value: '118%' },
    { label: 'Cash runway', value: '26 months' },
  ],
  highlights: [
    'ARR up 41% year over year',
    'Gross margin improved to 74%',
    'Top-10 customers are 38% of revenue',
    'EMEA launch slipped one quarter',
    'Series C targeted for H2 2025',
  ],
};
export const BOARD: Record<'default' | 'short' | 'long', BoardDeck> = {
  default: DECK,
  short: {
    name: 'Q1 2025 Board Update', date: 'Mar 28, 2025',
    overview: 'Flat quarter; no material changes to plan.',
    callouts: [{ label: 'ARR', value: '$49M' }, { label: 'NRR', value: '117%' }, { label: 'Runway', value: '23 mo' }],
    highlights: ['ARR flat', 'Margin steady', 'No new hires', 'EMEA on track', 'Series C prep'],
  },
  long: {
    ...DECK,
    name: 'Q4 2024 Board Deck — Full Year Review and 2025 Operating Plan',
    overview: `${DECK.overview} The deck also walks through the 2025 operating plan in detail: headcount is held flat through Q2, sales capacity is re-weighted toward the enterprise segment, and the product roadmap prioritises the reporting module that three of the five largest customers have made a renewal condition. Management recommends the board approve a bridge extension of up to $6M from existing investors ahead of the Series C to protect negotiating leverage.`,
    callouts: [
      { label: 'Annual recurring revenue at year end', value: '$48.2M' },
      { label: 'Net revenue retention, trailing twelve months', value: '118%' },
      { label: 'Cash runway at current burn, before any bridge', value: '26 months' },
    ],
    highlights: [
      'Annual recurring revenue grew 41% year over year, ahead of the 35% plan',
      'Gross margin improved to 74% after the hosting contract was renegotiated',
      'Top-10 customers now represent 38% of revenue, up from 31% a year ago',
      'EMEA launch slipped one quarter pending two senior sales hires',
      'Management asks the board to approve a bridge of up to $6M before Series C',
    ],
  },
};
