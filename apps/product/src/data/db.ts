/**
 * The prototype's company database — 200 portfolio companies seeded by
 * `apps/product/db/seed.mjs` (source of truth: `apps/product/db/companies.json`).
 *
 * Screens never import the records directly: they query through `db`, so the
 * storage can later move behind a real API without touching a screen.
 *
 *   db.companies.all()                     every company, A–Z
 *   db.companies.byId('abc-co')            one company (undefined if unknown)
 *   db.companies.search('gam', 8)          name/sector/industry match, ranked
 *   db.companies.where({ fundId: 'vip' })  field filter
 *   db.companies.page(0, 25)               paged slice + total
 *   db.funds.all() · db.funds.byId(id)
 */
import { COMPANIES, FUNDS } from './companies.db.js';

export type CompanyStatus = 'active' | 'exited' | 'written-off';
export type ValuationWorkflowStatus = 'draft' | 'in-progress' | 'in-review' | 'ready-for-audit' | 'final' | 'published';

export interface CompanyRecord {
  id: string;
  name: string;
  sector: string;
  industry: string;
  stage: string;
  status: CompanyStatus;
  hq: { city: string; region: string; country: string };
  founded: number;
  employees: number;
  website: string;
  fundId: string;
  /** ISO date of the firm's first investment. */
  investmentDate: string;
  /** ISO date of the latest measurement date. */
  asOf: string;
  valuationStatus: ValuationWorkflowStatus;
  valuationMethod: string;
  /** USD. */
  invested: number;
  /** USD — the firm's position at fair value. */
  fairValue: number;
  moic: number;
  /** Fully diluted ownership, %. */
  ownershipPct: number;
  /** USD — 100% equity value. */
  equityValue: number;
  revenueLtm: number;
  ebitdaLtm: number;
  lastRound: { type: string; date: string; pricePerShare: number };
  securities: number;
  dailyNav: boolean;
}

export interface FundRecord {
  id: string;
  name: string;
  vintage: number;
}

const byName = (a: CompanyRecord, b: CompanyRecord) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
const sorted = [...COMPANIES].sort(byName);
const index = new Map(COMPANIES.map((c) => [c.id, c]));

export const db = {
  companies: {
    count: COMPANIES.length,
    /** Every company, A–Z by name. */
    all: (): CompanyRecord[] => sorted,
    byId: (id: string | undefined): CompanyRecord | undefined => (id ? index.get(id) : undefined),
    /** Case-insensitive match on name, then sector / industry. Name-prefix hits rank first. */
    search(query: string, limit = 20): CompanyRecord[] {
      const q = query.trim().toLowerCase();
      if (!q) return sorted.slice(0, limit);
      const score = (c: CompanyRecord) => {
        const n = c.name.toLowerCase();
        if (n.startsWith(q)) return 0;
        if (n.includes(q)) return 1;
        if (c.sector.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)) return 2;
        return 9;
      };
      return sorted.map((c) => [score(c), c] as const).filter(([s]) => s < 9)
        .sort((a, b) => a[0] - b[0]).slice(0, limit).map(([, c]) => c);
    },
    where(filter: Partial<Pick<CompanyRecord, 'fundId' | 'sector' | 'stage' | 'status' | 'valuationStatus' | 'dailyNav'>>): CompanyRecord[] {
      return sorted.filter((c) => Object.entries(filter).every(([k, v]) => c[k as keyof CompanyRecord] === v));
    },
    page(offset: number, limit: number, rows: CompanyRecord[] = sorted) {
      return { rows: rows.slice(offset, offset + limit), total: rows.length };
    },
  },
  funds: {
    all: (): FundRecord[] => FUNDS,
    byId: (id: string): FundRecord | undefined => FUNDS.find((f) => f.id === id),
  },
};

/** "2024-12-31" → "12/31/2024", the format the product shows. */
export const usDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
};
