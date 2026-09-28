/**
 * Shared demo data. Every screen reads the firm, the signed-in user and the
 * company list from here so names and figures agree across the platform —
 * "ABC Co" on the home directory is the same ABC Co in its cap table.
 */

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

export interface Company {
  id: string;
  name: string;
  /** Latest financials / valuation date, as shown in the header selectors. */
  asOf: string;
}

export const companies: Company[] = [
  { id: 'abc-co', name: 'ABC Co', asOf: '12/31/2024' },
  { id: 'backside-blocks', name: 'Backside Blocks', asOf: '06/30/2026' },
  { id: 'captable', name: 'Captable', asOf: '06/30/2026' },
  { id: 'cohesity', name: 'Cohesity', asOf: '06/30/2026' },
  { id: 'company-31', name: 'Company 31', asOf: '06/30/2026' },
  { id: 'comps', name: 'Comps', asOf: '06/30/2026' },
  { id: 'databricks', name: 'DataBricks', asOf: '06/30/2026' },
  { id: 'debt-only', name: 'Debt Only', asOf: '06/30/2026' },
  { id: 'dec-30-md', name: 'Dec 30 MD', asOf: '12/30/2025' },
  { id: 'eagle-eye', name: 'Eagle Eye', asOf: '06/30/2026' },
  { id: 'flexport', name: 'Flexport', asOf: '06/30/2026' },
  { id: 'gamma-labs', name: 'Gamma Labs', asOf: '06/30/2026' },
];

export function companyById(id: string | undefined): Company {
  return companies.find((c) => c.id === id) ?? companies[0]!;
}

/** The firm-level "Date" selector in the Primary Menu. */
export const portfolioDate = 'Most Recent (06/30/2026)';

export const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const num = new Intl.NumberFormat('en-US');
export const pct = (v: number, d = 1) => `${v.toFixed(d)}%`;
