/**
 * Shared demo data. Every screen reads the firm, the signed-in user and the
 * company list from here so names and figures agree across the platform —
 * "ABC Co" on the home directory is the same ABC Co in its cap table.
 */

import { db, usDate, type CompanyRecord } from './db.js';

export { db };

export const firm = {
  id: 'spatical',
  name: 'Spatical Ventures',
  initials: 'SV',
  website: 'https://spatical.com',
};

/** Firms the user can switch between on Home (Firm Switcher tiles). */
export const firms = [
  { id: 'spatical', initials: 'SV', name: 'Spatical Ventures' },
  { id: 'union', initials: 'UN', name: 'Union Partners' },
  { id: 'vk', initials: 'VK', name: 'VK Capital' },
  { id: 'pe', initials: 'PE', name: 'PE Holdings' },
  { id: 'ts', initials: 'TS', name: 'TS Growth' },
];

export const user = {
  name: 'Bayardo V',
  initials: 'BV',
  email: 'bayardo@spatical.com',
  role: 'Firm Admin',
};

/**
 * A company as screens use it. The records live in the seeded database
 * (`data/db.ts`, 200 companies); `asOf` here is display-formatted (MM/DD/YYYY).
 */
export interface Company extends Omit<CompanyRecord, 'asOf'> {
  asOf: string;
  /** ISO form of `asOf`. */
  asOfIso: string;
}

const toCompany = (r: CompanyRecord): Company => ({ ...r, asOf: usDate(r.asOf), asOfIso: r.asOf });

/** Every portfolio company, A–Z — from the database. */
export const companies: Company[] = db.companies.all().map(toCompany);

/** Any company by id. Unknown ids fall back to ABC Co so a stale link still renders. */
export function companyById(id: string | undefined): Company {
  const r = db.companies.byId(id) ?? db.companies.byId('abc-co')!;
  return toCompany(r);
}

/** Look a company up by its display name (for frame content that names one). */
export function companyByName(name: string): Company | undefined {
  const r = db.companies.all().find((c) => c.name.toLowerCase() === name.toLowerCase());
  return r && toCompany(r);
}

/** The firm-level "Date" selector in the Primary Menu. */
export const portfolioDate = 'Most Recent (06/30/2026)';

export const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const num = new Intl.NumberFormat('en-US');
export const pct = (v: number, d = 1) => `${v.toFixed(d)}%`;
