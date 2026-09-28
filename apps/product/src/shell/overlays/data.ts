/**
 * Demo data for the global overlays (Companies menu, Date menu, Global Search,
 * Notifications) and the Home directory, so the menu and the A–Z directory
 * list the same companies.
 *
 * The fixture companies come first-class (they have screens behind them); the
 * extra names are the ones drawn in the Home frames of the Scalar-full-product
 * file (Empty Company, Etrade, …). Their summary links fall back to the demo
 * company because they have no fixture of their own.
 */
import { companies, firm } from '../../data/fixtures.js';

export interface DirectoryCompany {
  id: string;
  name: string;
}

const extra: DirectoryCompany[] = [
  { id: 'empty-company', name: 'Empty Company' },
  { id: 'etrade', name: 'Etrade' },
  { id: 'euros-financials', name: 'Euros Financials' },
  { id: 'fund-owns-preferred-notes', name: 'Fund Owns Preferred Notes' },
  { id: 'future-4-liq-pref', name: 'Future 4 Liq Pref' },
  { id: 'future-exit-liq-pref', name: 'Future Exit Liq Pref' },
  { id: 'gpc', name: 'GPC' },
];

/** Every portfolio company of the current firm, A–Z. */
export const directory: DirectoryCompany[] = [
  ...companies.map((c) => ({ id: c.id, name: c.name })),
  ...extra,
].sort((a, b) => a.name.localeCompare(b.name));

/** Directory grouped by first letter, for the Home A–Z list. */
export function directoryByLetter(list: DirectoryCompany[] = directory): Array<{ letter: string; items: DirectoryCompany[] }> {
  const groups = new Map<string, DirectoryCompany[]>();
  for (const c of list) {
    const letter = c.name[0]!.toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), c]);
  }
  return [...groups.entries()].map(([letter, items]) => ({ letter, items }));
}

/** The firm-level measurement dates in the Date selector, newest first. */
export const measurementDates = [
  'Most Recent (06/30/2026)',
  '06/30/2026', '05/01/2026', '12/31/2025', '09/30/2025', '06/30/2025',
  '05/01/2025', '03/31/2025', '12/31/2024', '09/30/2024',
  '06/30/2024', '03/31/2024', '12/31/2023', '09/30/2023', '06/30/2023',
  '03/31/2023', '12/31/2022', '09/30/2022', '06/30/2022', '03/31/2022',
  '12/31/2021', '09/30/2021',
];

/** How many rows the Companies / Date menus show before "Show N more". */
export const MENU_PAGE = 10;

/** Notification types the user can subscribe to (Notification settings). */
export const notificationTypes = [
  'Processing Jobs', 'Cap Table Mapping', 'Financial Mapping', 'PDF Processing',
  'Parsing', 'Document Uploaded', 'Workboard',
];

export const firmName = firm.name;
