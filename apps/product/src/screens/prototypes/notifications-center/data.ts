/**
 * Notification model and demo feed for the Notifications Center prototype.
 *
 * Fields follow the Figma spec note (Notifications-center, node 55:1457):
 * optional `actor`, `context`, `link`, `display`; `priority` normal | high;
 * `type` one of the suggested enums. `table.updated` and the in-progress
 * `document_ai.processing` are drawn in the frames but missing from that enum
 * list (logged as a gap in docs/product/pages/prototype-notifications-center.md).
 */
import { routes } from '../../../routes.js';
import { db, firm, firms, user, type Company } from '../../../data/fixtures.js';
import { users } from '../../p13-user-management/data.js';

export type NotificationType =
  | 'document_ai.processing'
  | 'document_ai.completed'
  | 'financial_mapping.completed'
  | 'documents.uploaded'
  | 'bulk_rollover.completed'
  | 'bulk_action.completed'
  | 'system.announcement'
  | 'table.updated';

export type Priority = 'normal' | 'high';

/** `alert` = a job result you can dismiss; `activity` = someone's change, kept as a log. */
export type Display = 'alert' | 'activity';

export interface Actor {
  name: string;
  /** The signed-in user — what "Only my changes" keeps. */
  isYou: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  priority: Priority;
  title: string;
  body: string;
  /** Minutes before "now" — rendered as Just now / 5m ago / 2h ago. */
  minutesAgo: number;
  firmId: string;
  /** Unset for firm-level events (bulk rollover). */
  companyId?: string;
  actor?: Actor;
  /** Where it happened, shown after the priority ("ABC Co", "All companies"). */
  context: string;
  link?: { label: string; href: string };
  display: Display;
  /** Set while a job runs. */
  inProgress?: boolean;
  read: boolean;
}

/** The four checkboxes of Figma frame 131:4940, in its order and wording. */
export interface Filters {
  allFirms: boolean;
  allCompanies: boolean;
  currentCompany: boolean;
  onlyMine: boolean;
}

export const FILTER_OPTIONS: Array<{ key: keyof Filters; label: string }> = [
  { key: 'allFirms', label: 'All Firms' },
  { key: 'allCompanies', label: 'All Companies' },
  { key: 'currentCompany', label: 'Only Current viewed company' },
  { key: 'onlyMine', label: 'Only My changes' },
];

/**
 * Figma frame 131:4940 ticks "Only Current viewed company" and "Only My
 * changes", yet its list still shows teammates' changes, so "Only My changes"
 * starts off here to keep the inbox frames true.
 */
export const DEFAULT_FILTERS: Filters = { allFirms: false, allCompanies: false, currentCompany: true, onlyMine: false };

const you: Actor = { name: user.name, isYou: true };
const teammate = (i: number): Actor => ({ name: users[i]!.name, isYou: false });

export function relativeTime(minutes: number): string {
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/** Does a notification pass the user's filters for the company in view? */
export function passes(n: AppNotification, f: Filters, company: Company): boolean {
  if (n.type === 'system.announcement') return true;
  if (f.onlyMine && !n.actor?.isYou) return false;
  // Scopes nest (firms ⊃ companies ⊃ the one in view), so the widest ticked one wins.
  if (f.allFirms) return true;
  if (f.allCompanies) return n.firmId === firm.id;
  if (f.currentCompany) return n.companyId === company.id;
  return false;
}

export const AI_TYPES: ReadonlySet<NotificationType> = new Set([
  'document_ai.processing', 'document_ai.completed', 'financial_mapping.completed',
]);

/** The in-progress job the "AI processing" frames show, and what it becomes. */
export function aiJob(company: Company): { running: AppNotification; done: AppNotification } {
  const base = {
    firmId: firm.id, companyId: company.id, actor: you, context: company.name,
    display: 'alert' as const, priority: 'high' as const, minutesAgo: 0,
  };
  return {
    running: {
      ...base, id: 'ai-job', type: 'document_ai.processing', title: 'AI processing',
      body: 'Reading documents', inProgress: true, read: false,
    },
    done: {
      ...base, id: 'ai-job-done', type: 'document_ai.completed', title: 'AI processing complete',
      body: 'Annual Report 2026.pdf has been analyzed and categorized.',
      link: { label: 'View results', href: routes.company.documents(company.id) }, read: false,
    },
  };
}

/** The feed as the frames show it, around the company in view. */
export function seedFeed(company: Company): AppNotification[] {
  const other = db.companies.all().find((c) => c.id !== company.id)!;
  const otherFirm = firms.find((f) => f.id !== firm.id)!;
  return [
    {
      id: 'n1', type: 'document_ai.completed', priority: 'high', title: 'AI processing complete',
      body: 'Q2 2026 Board Deck.pdf has been analyzed and categorized.', minutesAgo: 0,
      firmId: firm.id, companyId: company.id, actor: you, context: company.name, display: 'alert', read: false,
      link: { label: 'View results', href: routes.company.documents(company.id) },
    },
    {
      id: 'n2', type: 'financial_mapping.completed', priority: 'high', title: 'Financial mapping complete',
      body: 'Q2 2026 income statement mapped to 42 line items.', minutesAgo: 5,
      firmId: firm.id, companyId: company.id, actor: you, context: company.name, display: 'alert', read: false,
      link: { label: 'View results', href: routes.company.incomeStatement(company.id) },
    },
    {
      id: 'n3', type: 'documents.uploaded', priority: 'normal', title: 'Documents uploaded',
      body: '3 files were added to Board materials.', minutesAgo: 5,
      firmId: firm.id, companyId: company.id, actor: you, context: company.name, display: 'alert', read: true,
      link: { label: 'View documents', href: routes.company.documents(company.id) },
    },
    {
      id: 'n4', type: 'table.updated', priority: 'high', title: 'Table updated',
      body: 'changed the Series C original issue price to $4.00.', minutesAgo: 5,
      firmId: firm.id, companyId: company.id, actor: teammate(2), context: company.name, display: 'activity', read: true,
      link: { label: 'View change', href: routes.company.capTable(company.id) },
    },
    {
      id: 'n5', type: 'document_ai.completed', priority: 'high', title: 'Document analyzed',
      body: 'revised Annual Report 2026.pdf.', minutesAgo: 12,
      firmId: firm.id, companyId: company.id, actor: teammate(4), context: company.name, display: 'activity', read: true,
      link: { label: 'View document', href: routes.company.documents(company.id) },
    },
    {
      id: 'n6', type: 'table.updated', priority: 'high', title: 'Table updated',
      body: 'changed the MOIC on the valuation summary.', minutesAgo: 18,
      firmId: firm.id, companyId: company.id, actor: you, context: company.name, display: 'activity', read: true,
      link: { label: 'View change', href: routes.company.valuationSummary(company.id) },
    },
    {
      id: 'n7', type: 'document_ai.completed', priority: 'normal', title: 'AI processing complete',
      body: 'Q2 2026 financials.xlsx has been analyzed and categorized.', minutesAgo: 34,
      firmId: firm.id, companyId: other.id, actor: teammate(1), context: other.name, display: 'alert', read: false,
      link: { label: 'View results', href: routes.company.documents(other.id) },
    },
    {
      id: 'n8', type: 'bulk_rollover.completed', priority: 'normal', title: 'Bulk rollover complete',
      body: '24 companies were rolled forward to 06/30/2026.', minutesAgo: 60,
      firmId: firm.id, actor: you, context: 'All companies', display: 'alert', read: true,
      link: { label: 'View valuations', href: routes.valuations },
    },
    {
      id: 'n9', type: 'bulk_action.completed', priority: 'normal', title: 'Bulk action complete',
      body: '12 valuations were marked Final.', minutesAgo: 120,
      firmId: otherFirm.id, actor: teammate(4), context: otherFirm.name, display: 'alert', read: true,
    },
    {
      id: 'n10', type: 'system.announcement', priority: 'normal', title: 'Scheduled maintenance',
      body: 'Scalar will be read-only on Saturday from 2:00 to 4:00 AM ET.', minutesAgo: 180,
      firmId: firm.id, context: 'Scalar', display: 'alert', read: true,
    },
  ];
}
