/**
 * Demo content for the firm Documents page, copied from the Figma frames
 * (04 · Documents (Firm) → All Documents / Company Documents).
 */
import { companies } from '../../data/fixtures.js';

export interface DocCompany {
  id: string;
  name: string;
  fund?: string;
  count: number;
}

const META: Record<string, { fund?: string; count: number }> = {
  'abc-co': { fund: 'VIP Fund', count: 7 },
  'backside-blocks': { fund: 'VIP Fund', count: 28 },
  captable: { count: 0 },
  cohesity: { fund: 'Low Class', count: 1 },
  'company-31': { count: 11 },
  comps: { count: 0 },
  databricks: { fund: 'VIP Fund', count: 55 },
  'debt-only': { fund: 'VIP Fund', count: 9 },
  'dec-30-md': { count: 1 },
  'eagle-eye': { count: 3 },
  flexport: { fund: 'VIP Fund', count: 5 },
  'gamma-labs': { count: 2 },
};

/** Companies that only appear in the Documents list (not in the shared fixtures). */
const EXTRA: DocCompany[] = [
  { id: 'empty-company', name: 'Empty Company', count: 1 },
  { id: 'euros-financials', name: 'Euros Financials', fund: 'VIP Fund', count: 14 },
  { id: 'fund-owns-preferred-notes', name: 'Fund Owns Preferred Notes', fund: 'VIP Fund', count: 4 },
  { id: 'future-4-liq-pref', name: 'Future 4 Liq Pref', fund: 'VIP Fund', count: 6 },
  { id: 'future-exit-liq-pref', name: 'Future Exit Liq Pref', count: 2 },
  { id: 'gpc', name: 'GPC', count: 1 },
  { id: 'jan23', name: 'jan23', fund: 'VIP Fund', count: 7 },
  { id: 'jun-3-25', name: 'Jun 3 25', count: 1 },
];

export const docCompanies: DocCompany[] = [
  ...companies.map((c) => ({ id: c.id, name: c.name, ...(META[c.id] ?? { count: 0 }) })),
  ...EXTRA,
].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

export interface DocFile {
  id: string;
  name: string;
  uploader: string;
  date: string;
  /** Area or request the file is linked to. */
  link?: string;
}

export interface DocFolder {
  id: string;
  name: string;
  files: DocFile[];
}

const f = (id: string, name: string, uploader: string, date: string, link?: string): DocFile => ({ id, name, uploader, date, link });

export const rootFiles: DocFile[] = [
  f('d1', 'Advanced testing topics _ Django documentation _ Django (1).pdf', 'User', '01/09/2023'),
  f('d2', 'Advanced testing topics _ Django documentation _ Django (1).pdf', 'User', '01/09/2023'),
  f('d3', 'New Round Modeler v2.xlsx', 'Steven Hansen', '08/05/2026'),
  f('d4', 'Propuesta Cowbox desarrollo ecommerce shopify - Woobsing 2022.xlsx', 'User', '01/09/2023', 'Financials'),
  f('d5', 'Scalar Landing Page (technology section).pdf', 'Steven Hansen', '02/06/2023', 'Cap Table'),
  f('d6', 'Scalar Marketing Report - April2026.pptx (1).png', 'Steven Hansen', '06/01/2026', 'Presentation of a business strategy or an investment'),
  f('d7', 'Screenshot 2023-02-02 at 5.11.41 PM.png', 'Steven Hansen', '02/06/2023', 'Cap Table'),
  f('d8', 'Screenshot 2026-08-05 at 4.40.50 PM.png', 'Steven Hansen', '08/05/2026'),
  f('d9', 'Screenshot 2026-08-05 at 4.40.50 PM.png', 'Test Steven', '08/05/2026', 'External valuations'),
  f('d10', 'volcano-eruption-2021-08-29-00-10-20-utc.zip', 'Steven Hansen', '02/06/2023'),
];

export const subfolders: DocFolder[] = [
  {
    id: 'company-docs',
    name: 'Company Docs',
    files: [
      f('c1', 'B&H Invoice.pdf', 'Steven Hansen', '02/06/2023'),
      f('c2', 'OPM and Waterfall.xlsx', 'Steven Hansen', '02/06/2023'),
      f('c3', 'Screenshot 2023-02-02 at 8.52.02 PM.png', 'Steven Hansen', '02/06/2023'),
    ],
  },
  {
    id: 'exports',
    name: 'Exports',
    files: [
      f('e1', 'Backside Blocks_Financials_281_2025-03-31.xlsx', 'Steven Hansen', '03/31/2025'),
      f('e2', 'Backside Blocks_Financials_281_2025-03-31 (1).xlsx', 'Steven Hansen', '03/31/2025'),
      f('e3', 'Backside Blocks_Financials_5388_2025-03-31.xlsx', 'Steven Hansen', '03/31/2025'),
      f('e4', 'Backside Blocks_Financials_5388_2025-03-31 (1).xlsx', 'Steven Hansen', '03/31/2025'),
    ],
  },
];

export interface MeasurementDate {
  date: string;
  documents: number;
  subfolders: number;
  requests: { sent: number; uploaded: number; pending: number };
}

/** Firm-wide measurement-date folders (All Documents). */
export const measurementDates: MeasurementDate[] = [
  { date: '06/30/2026', documents: 43, subfolders: 12, requests: { sent: 21, uploaded: 0, pending: 21 } },
  { date: '05/01/2026', documents: 3, subfolders: 2, requests: { sent: 0, uploaded: 0, pending: 0 } },
  { date: '12/31/2025', documents: 2, subfolders: 2, requests: { sent: 14, uploaded: 0, pending: 14 } },
  { date: '09/30/2025', documents: 10, subfolders: 2, requests: { sent: 7, uploaded: 0, pending: 7 } },
  { date: '03/31/2025', documents: 53, subfolders: 7, requests: { sent: 22, uploaded: 6, pending: 16 } },
];

/** A company's own measurement-date folders (company selected). */
export const companyDates = ['03/31/2025', '06/30/2022', '05/10/2021'];

export const allFiles: DocFile[] = [...rootFiles, ...subfolders.flatMap((s) => s.files)];
