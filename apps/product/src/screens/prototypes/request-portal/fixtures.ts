/**
 * Demo content for the Unified Request Portal: a PPA information request for
 * report date 06/30/2026. Order is defined here (`categoryOrder`,
 * `requestOrder`), never by array position.
 */
import { DOC_EXTENSIONS, SHEET_EXTENSIONS, type Category, type InformationRequest, type TemplateAsset } from './model.js';

export const REQUEST_META = {
  engagement: 'PPA',
  reportDate: '06/30/2026',
  firm: 'Spatical Ventures',
  company: 'ABC Co',
  analyst: 'Steven Hansen',
  respondent: 'Maria López',
  /** Server-provided due date (ISO). The extension flow changes it through the store, never Date.now(). */
  dueDate: '2026-11-13',
};

export const CATEGORIES: Category[] = [
  { id: 'corporate', order: 1, name: 'Corporate & Legal' },
  { id: 'capitalization', order: 2, name: 'Capitalization' },
  { id: 'financials', order: 3, name: 'Financial Statements' },
  { id: 'projections', order: 4, name: 'Projections & Budget' },
  { id: 'customers', order: 5, name: 'Customers & Revenue' },
  { id: 'debt', order: 6, name: 'Debt & Commitments' },
  { id: 'litigation', order: 7, name: 'Litigation & Claims' },
  { id: 'transactions', order: 8, name: 'Transactions & Offers' },
  { id: 'other', order: 9, name: 'Other' },
];

const tpl = (id: string, name: string, file: string, version: string): TemplateAsset => ({
  id, name, version, issued: '09/15/2026', fileName: file, mimeType: 'text/csv', path: `./assets/templates/${file}`,
});

export const TEMPLATES = {
  options: tpl('tpl-options', 'Options & Warrants Schedule', 'options-warrants-schedule-v2.csv', '2.1'),
  monthly: tpl('tpl-monthly', 'Monthly Financial Performance', 'monthly-financial-performance-v3.csv', '3.0'),
  customers: tpl('tpl-customers', 'Customer Concentration Schedule', 'customer-concentration-v1.csv', '1.2'),
  litigation: tpl('tpl-litigation', 'Litigation & Claims Schedule', 'litigation-claims-schedule-v1.csv', '1.0'),
  /** Points at an asset that does not exist, to show the unavailable-template state. */
  missing: tpl('tpl-board', 'Board Composition Template', 'board-composition-v1.csv', '1.0'),
};

type Seed = Omit<InformationRequest, 'categoryOrder' | 'status'> & { status?: InformationRequest['status'] };

const doc = { allowedExtensions: DOC_EXTENSIONS };
const sheet = { allowedExtensions: SHEET_EXTENSIONS };

const SEEDS: Seed[] = [
  { id: 'r-101', categoryId: 'corporate', requestOrder: 1, title: 'Restated Certificate of Incorporation', description: 'The current certificate with all amendments, as filed.', responseType: 'file', ...doc },
  { id: 'r-102', categoryId: 'corporate', requestOrder: 2, title: 'Has the company changed its legal name or domicile since the last valuation?', responseType: 'choice' },
  { id: 'r-103', categoryId: 'corporate', requestOrder: 3, title: 'Board composition as of the report date', description: 'Use the template so seats and observers are listed the same way each period.', responseType: 'template_file', template: TEMPLATES.missing, ...sheet },
  { id: 'r-201', categoryId: 'capitalization', requestOrder: 1, title: 'Fully diluted cap table as of 06/30/2026', description: 'Include every class, option pool and convertible instrument.', responseType: 'file', ...doc },
  { id: 'r-202', categoryId: 'capitalization', requestOrder: 2, title: 'Options and warrants schedule', description: 'Complete the template with one row per grant.', responseType: 'template_file', template: TEMPLATES.options, ...sheet },
  { id: 'r-203', categoryId: 'capitalization', requestOrder: 3, title: 'Have there been any secondary or other equity transactions recently?', description: 'Describe the date, price per share, class and parties.', responseType: 'text' },
  { id: 'r-204', categoryId: 'capitalization', requestOrder: 4, title: 'How much was the most recent round and when did it close?', responseType: 'text', status: 'complete', answer: 'Series B, $18.5M, closed 03/14/2026 at $4.12 per share.' },
  { id: 'r-301', categoryId: 'financials', requestOrder: 1, title: 'Balance sheet and income statement for FY2025', description: 'Audited if available; otherwise management accounts.', responseType: 'file', ...doc },
  { id: 'r-302', categoryId: 'financials', requestOrder: 2, title: 'Monthly financial performance, last 24 months', description: 'Revenue, gross profit, EBITDA and cash, per the template.', responseType: 'template_file', template: TEMPLATES.monthly, ...sheet },
  { id: 'r-303', categoryId: 'financials', requestOrder: 3, title: 'Date of the most recent audited financial statements', responseType: 'date' },
  { id: 'r-304', categoryId: 'financials', requestOrder: 4, title: 'Are the FY2025 financials audited?', responseType: 'choice', status: 'complete', answer: 'yes' },
  { id: 'r-401', categoryId: 'projections', requestOrder: 1, title: 'Financial projections for FY2026–FY2030', description: 'Management’s current base case, with assumptions.', responseType: 'file', ...doc },
  { id: 'r-402', categoryId: 'projections', requestOrder: 2, title: 'Should we assume progress for the company is up, flat, or down?', responseType: 'text' },
  { id: 'r-403', categoryId: 'projections', requestOrder: 3, title: 'When does the company hope to raise its next round?', responseType: 'date' },
  { id: 'r-501', categoryId: 'customers', requestOrder: 1, title: 'Customer concentration schedule', description: 'Top 20 customers by trailing-12-month revenue.', responseType: 'template_file', template: TEMPLATES.customers, ...sheet },
  { id: 'r-502', categoryId: 'customers', requestOrder: 2, title: 'Can you share the standard customer contract?', description: 'Upload the current master subscription agreement. A written answer is not needed.', responseType: 'file', ...doc },
  { id: 'r-503', categoryId: 'customers', requestOrder: 3, title: 'Did any customer above 5% of revenue churn in the last 12 months?', responseType: 'choice' },
  { id: 'r-601', categoryId: 'debt', requestOrder: 1, title: 'Loan agreements and amendments', responseType: 'file', ...doc, status: 'sent' },
  { id: 'r-602', categoryId: 'debt', requestOrder: 2, title: 'Maturity date of the venture debt facility', responseType: 'date' },
  { id: 'r-603', categoryId: 'debt', requestOrder: 3, title: 'Describe any off-balance-sheet commitments', responseType: 'text' },
  { id: 'r-701', categoryId: 'litigation', requestOrder: 1, title: 'Litigation and claims schedule', description: 'Every pending, threatened or recently settled matter.', responseType: 'template_file', template: TEMPLATES.litigation, ...sheet },
  { id: 'r-702', categoryId: 'litigation', requestOrder: 2, title: 'Is the company subject to any regulatory investigation?', responseType: 'choice' },
  { id: 'r-801', categoryId: 'transactions', requestOrder: 1, title: 'Has the company received any acquisition offers?', description: 'Include indications of interest and term sheets, even if declined.', responseType: 'text' },
  { id: 'r-802', categoryId: 'transactions', requestOrder: 2, title: 'Term sheet for the most recent offer', responseType: 'file', ...doc, status: 'na' },
  { id: 'r-803', categoryId: 'transactions', requestOrder: 3, title: 'When is the projected exit for the company?', responseType: 'date' },
  { id: 'r-901', categoryId: 'other', requestOrder: 1, title: 'Has anything else occurred that could materially impact the valuation?', responseType: 'text' },
  { id: 'r-902', categoryId: 'other', requestOrder: 2, title: 'Presentation of the business strategy', responseType: 'file', ...doc },
];

const orderOf = (categoryId: string) => CATEGORIES.find((c) => c.id === categoryId)!.order;

const build = (seeds: Seed[]): InformationRequest[] =>
  seeds.map((s) => ({ ...s, categoryOrder: orderOf(s.categoryId), status: s.status ?? 'pending' }));

/** The fixture sets each screen state loads (P2.2). Same list component for all of them. */
export const FIXTURES: Record<string, () => InformationRequest[]> = {
  default: () => build(SEEDS),
  'questions-only': () => build(SEEDS.filter((s) => s.responseType === 'text' || s.responseType === 'choice' || s.responseType === 'date')),
  'documents-only': () => build(SEEDS.filter((s) => s.responseType === 'file')),
  'templates-only': () => build(SEEDS.filter((s) => s.responseType === 'template_file')),
  // File requests resolve as "sent another way" here: no file exists, so none is implied (P0.8).
  'all-complete': () => build(SEEDS).map((r) => {
    if (r.status !== 'pending') return r;
    if (r.responseType === 'file' || r.responseType === 'template_file') return { ...r, status: 'sent' };
    const answer = r.responseType === 'choice' ? 'no' : r.responseType === 'date' ? '2026-06-30' : 'Answered in the call on 10/20/2026.';
    return { ...r, status: 'complete', answer };
  }),
  empty: () => [],
};
