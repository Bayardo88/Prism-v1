/**
 * Seeds the prototype's company database: 200 portfolio companies for the
 * Spatical Ventures demo firm.
 *
 *   npm run product:seed
 *
 * Writes
 *   apps/product/db/companies.json            — the database (source of truth)
 *   apps/product/src/data/companies.db.ts     — the same records as a typed module
 *                                              the browser app imports (no bundler, no fetch)
 *
 * Deterministic: a fixed-seed PRNG, so re-running produces the same rows and
 * screenshots stay stable. The first rows are the companies that appear by
 * name in the Scalar-full-product Figma frames, so every frame still reads the
 * same; the rest are generated.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const COUNT = 200;

/* --- deterministic PRNG (mulberry32) ------------------------------------- */
let seed = 0x5ca1a2;
const rand = () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (a) => a[Math.floor(rand() * a.length)];
const between = (lo, hi) => lo + rand() * (hi - lo);
const int = (lo, hi) => Math.floor(between(lo, hi + 1));
const round = (v, step) => Math.round(v / step) * step;

/* --- vocabularies -------------------------------------------------------- */
const SECTORS = {
  'Software': ['Enterprise SaaS', 'Developer Tools', 'Cybersecurity', 'Data Infrastructure', 'Vertical SaaS'],
  'Fintech': ['Payments', 'Lending', 'Wealth Management', 'Insurtech', 'Banking Infrastructure'],
  'Healthcare': ['Digital Health', 'Medical Devices', 'Biotech', 'Healthcare Services'],
  'Consumer': ['E-commerce', 'Consumer Brands', 'Marketplaces', 'Media'],
  'Industrials': ['Logistics', 'Manufacturing', 'Aerospace', 'Robotics'],
  'Energy': ['Clean Energy', 'Energy Storage', 'Oil & Gas Services'],
  'Real Estate': ['Proptech', 'Commercial Real Estate'],
  'AI': ['Foundation Models', 'Applied AI', 'AI Infrastructure'],
};
const STAGES = ['Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Growth', 'Pre-IPO'];
const FUNDS = [
  { id: 'fund-i', name: 'Spatical Fund I', vintage: 2016 },
  { id: 'fund-ii', name: 'Spatical Fund II', vintage: 2019 },
  { id: 'fund-iii', name: 'Spatical Fund III', vintage: 2022 },
  { id: 'vip', name: 'VIP Fund', vintage: 2020 },
  { id: 'opportunity', name: 'Opportunity Fund', vintage: 2021 },
];
const CITIES = [
  ['San Francisco', 'CA', 'United States'], ['New York', 'NY', 'United States'], ['Austin', 'TX', 'United States'],
  ['Salt Lake City', 'UT', 'United States'], ['Boston', 'MA', 'United States'], ['Seattle', 'WA', 'United States'],
  ['Chicago', 'IL', 'United States'], ['Denver', 'CO', 'United States'], ['Miami', 'FL', 'United States'],
  ['London', '', 'United Kingdom'], ['Berlin', '', 'Germany'], ['Toronto', 'ON', 'Canada'],
  ['Tel Aviv', '', 'Israel'], ['Singapore', '', 'Singapore'], ['São Paulo', 'SP', 'Brazil'],
];
/** Valuation workflow status, matching ValuationStatus / the Valuations grid. */
const VALUATION_STATUS = ['draft', 'in-progress', 'in-review', 'ready-for-audit', 'final', 'published'];
const METHODS = ['Backsolve', 'Market Approach', 'Income Approach', 'Recent Transaction', 'External Valuation'];

/** Companies named in the Figma frames — kept first and verbatim. */
const FROM_FIGMA = [
  ['ABC Co', 'Software'], ['Backside Blocks', 'Industrials'], ['Captable', 'Fintech'], ['Cohesity', 'Software'],
  ['Company 31', 'Consumer'], ['Comps', 'Fintech'], ['DataBricks', 'AI'], ['Debt Only', 'Fintech'],
  ['Dec 30 MD', 'Healthcare'], ['Eagle Eye', 'Software'], ['Empty Company', 'Consumer'], ['Etrade', 'Fintech'],
  ['Euros Financials', 'Fintech'], ['Flexport', 'Industrials'], ['Fund Owns Preferred Notes', 'Fintech'],
  ['Future 4 Liq Pref', 'Software'], ['Future Exit Liq Pref', 'Software'], ['Gamma Labs', 'AI'], ['GPC', 'Energy'],
  ['jan23', 'Consumer'], ['New Company', 'Software'], ['New Kewing Company', 'Consumer'], ['No financials', 'Healthcare'],
  ['No Measurement Date', 'Real Estate'], ['Notes Only', 'Fintech'], ['Old Timer', 'Industrials'], ['PC Laptops', 'Consumer'],
  ['PIK', 'Fintech'], ['Rarestep', 'Consumer'], ['SEM', 'Software'], ['Test April 3 2025', 'Software'],
  ['Test Company April 30', 'Software'], ['X-Mode Test', 'AI'], ['SpaceX', 'Industrials'], ['Perplexity', 'AI'],
  ['testttrrrrr', 'Software'], ['Jun 3 25', 'Consumer'],
];

const PREFIX = ['Aero', 'Alta', 'Apex', 'Arc', 'Atlas', 'Aurora', 'Beacon', 'Blue', 'Bright', 'Cedar', 'Clear', 'Cobalt',
  'Core', 'Crest', 'Delta', 'Echo', 'Ember', 'Evergreen', 'Flux', 'Forge', 'Granite', 'Harbor', 'Helio', 'Horizon',
  'Iron', 'Juniper', 'Keystone', 'Kinetic', 'Lumen', 'Maple', 'Meridian', 'Nimbus', 'North', 'Nova', 'Oak', 'Onyx',
  'Orbit', 'Pacific', 'Peak', 'Pine', 'Polar', 'Prism', 'Quantum', 'Quartz', 'Radiant', 'Redwood', 'Ridge', 'Sage',
  'Sierra', 'Silver', 'Solar', 'Spark', 'Summit', 'Terra', 'Tidal', 'Trail', 'True', 'Umber', 'Vector', 'Vertex',
  'Vista', 'Wave', 'Willow', 'Zenith'];
const ROOT = { Software: ['Stack', 'Cloud', 'Logic', 'Works', 'Soft', 'Base'], Fintech: ['Pay', 'Ledger', 'Capital', 'Fi', 'Lend', 'Vault'],
  Healthcare: ['Health', 'Bio', 'Care', 'Thera', 'Med', 'Gen'], Consumer: ['Goods', 'Market', 'Home', 'Style', 'Kitchen', 'Wear'],
  Industrials: ['Freight', 'Motion', 'Dynamics', 'Robotics', 'Systems', 'Fab'], Energy: ['Grid', 'Power', 'Volt', 'Fuel', 'Charge', 'Solar'],
  'Real Estate': ['Estates', 'Spaces', 'Property', 'Realty', 'Dwell', 'Land'], AI: ['Mind', 'AI', 'Neural', 'Sense', 'Labs', 'Intelligence'] };
const SUFFIX = ['', '', '', ' Inc.', ' Labs', ' Technologies', ' Group', ' Co', ' Systems', ' Health', ' Holdings'];

/* --- build --------------------------------------------------------------- */
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const iso = (d) => d.toISOString().slice(0, 10);
const QUARTER_ENDS = ['2025-03-31', '2025-06-30', '2025-09-30', '2025-12-31', '2026-03-31', '2026-06-30'];

const used = new Set();
const names = [...FROM_FIGMA];
while (names.length < COUNT) {
  const sector = pick(Object.keys(SECTORS));
  const root = pick(ROOT[sector]);
  // Short roots read as one brand word ("Apexpay"); longer ones stay spaced ("Summit Freight").
  const stem = root.length <= 4 && root !== 'AI' ? `${pick(PREFIX)}${root.toLowerCase()}` : `${pick(PREFIX)} ${root}`;
  const name = `${stem}${pick(SUFFIX)}`;
  if (!used.has(name) && !FROM_FIGMA.some(([n]) => n === name)) { used.add(name); names.push([name, sector]); }
}

const companies = names.map(([name, sector], i) => {
  const industry = pick(SECTORS[sector]);
  const stage = pick(STAGES);
  const stageIx = STAGES.indexOf(stage);
  const [city, region, country] = pick(CITIES);
  const fund = FUNDS[i % 7 === 0 ? 3 : int(0, FUNDS.length - 1)];
  const founded = int(2004, 2022);
  const invested = round(between(0.5, 6) * 1e6 * (1 + stageIx * 1.6), 50_000);
  const moic = Math.max(0.2, Number((between(0.4, 1.4) + stageIx * between(0.1, 0.55)).toFixed(2)));
  const fairValue = round(invested * moic, 10_000);
  const ownershipPct = Number(between(2, 28).toFixed(2));
  const equityValue = round(fairValue / (ownershipPct / 100), 100_000);
  const revenueLtm = round(between(0.5, 30) * 1e6 * (1 + stageIx), 10_000);
  const invDate = new Date(Date.UTC(Math.max(founded + 1, fund.vintage), int(0, 11), int(1, 28)));
  const status = i < FROM_FIGMA.length ? 'active' : rand() < 0.88 ? 'active' : rand() < 0.6 ? 'exited' : 'written-off';
  return {
    id: slug(name) || `company-${i + 1}`,
    name,
    sector,
    industry,
    stage,
    status,
    hq: { city, region, country },
    founded,
    employees: int(8, 60) * (1 + stageIx * 3),
    website: `https://${slug(name).replace(/-/g, '') || 'company'}.com`,
    fundId: fund.id,
    investmentDate: iso(invDate),
    /** Latest measurement date — the company "as of" date. */
    asOf: i === 0 ? '2024-12-31' : i === 8 ? '2025-12-30' : pick(QUARTER_ENDS),
    valuationStatus: pick(VALUATION_STATUS),
    valuationMethod: pick(METHODS),
    invested,
    fairValue,
    moic,
    ownershipPct,
    equityValue,
    revenueLtm,
    ebitdaLtm: round(revenueLtm * between(-0.35, 0.4), 10_000),
    lastRound: { type: stage === 'Seed' ? 'Seed' : stage, date: iso(new Date(invDate.getTime() + int(90, 900) * 864e5)), pricePerShare: Number(between(0.4, 42).toFixed(4)) },
    securities: int(2, 9),
    dailyNav: rand() < 0.35,
  };
});

// Facts the Figma frames show for ABC Co, the demo company.
Object.assign(companies[0], { dailyNav: true, investmentDate: '2023-08-07' });

// Keep ids unique after slugging.
const seen = new Map();
for (const c of companies) { const n = seen.get(c.id) ?? 0; seen.set(c.id, n + 1); if (n) c.id = `${c.id}-${n + 1}`; }

const db = { generatedBy: 'apps/product/db/seed.mjs', firm: 'Spatical Ventures', funds: FUNDS, companies };
writeFileSync(join(here, 'companies.json'), JSON.stringify(db, null, 1) + '\n');
writeFileSync(join(here, '../src/data/companies.db.ts'),
`/* GENERATED by apps/product/db/seed.mjs from db/companies.json — do not edit. Re-seed with \`npm run product:seed\`. */
import type { CompanyRecord, FundRecord } from './db.js';

export const FUNDS: FundRecord[] = ${JSON.stringify(FUNDS)};

export const COMPANIES: CompanyRecord[] = ${JSON.stringify(companies)};
`);
console.log(`✓ seeded ${companies.length} companies across ${FUNDS.length} funds`);
