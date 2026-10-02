/**
 * Global Search — the ⌘K command palette opened from the Primary Menu search
 * bar (Figma 01 · Home: "Home — Global Search open").
 *
 * Results are PRISM-typed by what they ARE: pages you land on, companies,
 * documents, valuation versions, measurement dates, and firm / company
 * actions. The scope stack starts at the firm; Tab pushes a scopable result
 * (a company, say), Backspace pops it. Selecting a result navigates.
 *
 * With an empty query the palette shows the Quick Access set drawn in Figma.
 * Companies come from `db.companies.search`; each matched company brings its
 * own documents, valuation version and waterfall action.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  GlobalSearch, Icon, Link, icons,
  type SearchResult, type SearchScope, type PrismType,
} from '@scalar/design-system';
import { href, navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { firm } from '../../data/fixtures.js';
import { db, usDate, type CompanyRecord } from '../../data/db.js';
import { MAX_RESULTS, parseNumericQuery, searchNumeric, type NumericHit, type NumericSearchStatus } from '../../data/numericSearch.js';
import type { OverlayProps } from './index.js';

interface Entry extends SearchResult {
  /** Where selecting it goes: [path, state?]. */
  to: [string, string?];
  /** Lower-case text the query matches against. */
  text: string;
  /** Company the entry belongs to, for company-scoped searches. */
  companyId?: string;
}

const glyph: Record<PrismType, () => ReactNode> = {
  firm: () => <icons.AccountBalance />,
  company: () => <icons.Storefront />,
  document: () => <icons.Description />,
  version: () => <icons.History />,
  'measurement-date': () => <icons.CalendarToday />,
  page: () => <icons.Article />,
  'firm-action': () => <icons.Add />,
  'company-action': () => <icons.WaterfallChart />,
  neutral: () => <icons.Search />,
};

function entry(id: string, type: PrismType, title: string, subtitle: string, to: [string, string?], companyId?: string): Entry {
  const G = glyph[type];
  return {
    id, type, title, subtitle, to, companyId,
    icon: <Icon size="s" tone="inherit"><G /></Icon>,
    text: `${title} ${subtitle}`.toLowerCase(),
  };
}

/** Firm-level entries that do not depend on a company. */
function staticEntries(companyId: string, pick: string): Entry[] {
  return [
    entry('p-intelligence', 'page', 'Intelligence', firm.name, [routes.intelligence.summaries]),
    entry('p-valuations', 'page', 'Valuations', firm.name, [routes.valuations]),
    entry('p-waterfalls', 'page', 'Waterfalls', firm.name, [routes.waterfalls]),
    entry('p-documents', 'page', 'Documents', firm.name, [routes.documents]),
    entry('p-soi', 'page', 'Schedule of Investments', firm.name, [routes.intelligence.scheduleOfInvestments]),
    entry('p-daily-nav', 'page', 'Daily NAV', firm.name, [routes.intelligence.dailyNav]),
    entry('p-users', 'page', 'User Management', firm.name, [routes.admin.users]),
    entry('p-comp-groups', 'page', 'Comp Groups', firm.name, [routes.admin.compGroups]),
    entry('p-audit', 'page', 'Audit Logs', firm.name, [routes.admin.auditLogs]),
    entry('p-firm-settings', 'page', 'Firm Settings', firm.name, [routes.firmSettings.profile]),
    entry('p-account', 'page', 'Account Settings', 'Your account', [routes.account.settings]),
    entry('cp-summary', 'page', 'Summary', pick, [routes.company.summary(companyId)]),
    entry('cp-financials', 'page', 'Financials', pick, [routes.company.incomeStatement(companyId)]),
    entry('cp-cap-table', 'page', 'Cap Table', pick, [routes.company.capTable(companyId)]),
    entry('cp-valuations', 'page', 'Valuation Summary', pick, [routes.company.valuationSummary(companyId)]),
    entry('cp-waterfall', 'page', 'Waterfall', pick, [routes.company.waterfall(companyId)]),
    entry('md-2026-06-30', 'measurement-date', 'Q2 2026 — 06/30/2026', firm.name, [routes.valuations]),
    entry('md-2026-05-01', 'measurement-date', 'Q2 2026 — 05/01/2026', firm.name, [routes.valuations]),
    entry('md-2025-12-31', 'measurement-date', 'Q4 2025 — 12/31/2025', firm.name, [routes.valuations]),
    entry('md-2025-09-30', 'measurement-date', 'Q3 2025 — 09/30/2025', firm.name, [routes.valuations]),
    entry('fa-add-company', 'firm-action', 'Add New Company', firm.name, [routes.portfolioHome, 'add-company']),
    entry('fa-invite', 'firm-action', 'Invite user', firm.name, [routes.admin.users]),
  ];
}

const companyEntry = (c: CompanyRecord): Entry =>
  entry(`co-${c.id}`, 'company', c.name, `${c.sector} · ${c.stage}`, [routes.company.summary(c.id)], c.id);

/** What a company brings into the results: its documents, latest version and a waterfall action. */
const companyDetail = (c: CompanyRecord): Entry[] => [
  entry(`doc-${c.id}-fin`, 'document', `${c.name} — Q2 2026 Financials.xlsx`, c.name, [routes.company.documents(c.id)], c.id),
  entry(`doc-${c.id}-cert`, 'document', `${c.name} — Certificate of Incorporation.pdf`, c.name, [routes.company.documents(c.id)], c.id),
  entry(`ver-${c.id}`, 'version', `${c.name} — ${c.valuationMethod} valuation`, `As of ${usDate(c.asOf)}`, [routes.company.valuationSummary(c.id)], c.id),
  entry(`ca-waterfall-${c.id}`, 'company-action', `Run waterfall — ${c.name}`, c.name, [routes.company.waterfall(c.id)], c.id),
];

/** Demo switches so every state can be opened from the URL: ?nsFirm=vk · ?nsDate=2023-06-30 · ?nsFlag=off · ?nsError=1 */
const demo = () => new URLSearchParams(window.location.hash.split('?')[1] ?? '');

const statusCopy: Record<Exclude<NumericSearchStatus, 'ok'>, [string, string]> = {
  disabled: ['Numeric search is not enabled', 'Ask a firm admin to turn on numeric search'],
  'unauthorized-firm': ['You don’t have access to this firm’s data', 'Switch to a firm you can access'],
  'unavailable-date': ['This measurement date is not available', 'Pick another measurement date'],
};

const numericEntry = (h: NumericHit): Entry => ({
  ...entry(`ns-${h.id}`, 'company', h.company, `${h.field} · ${h.display} · ${usDate(h.date)}`, [routes.intelligence.summaries]),
  companyId: h.companyId,
});

const statusEntry = (id: string, title: string, subtitle: string): Entry => entry(id, 'neutral', title, subtitle, [routes.intelligence.summaries]);

/** Where a numeric hit lands: the Summaries grid with the matched cell highlighted. */
const goToHit = (id: string) => {
  const [companyId, col] = id.replace(/^ns-/, '').split('|');
  window.location.hash = `${href(routes.intelligence.summaries).slice(1)}?hl=${encodeURIComponent(`${companyId}|${col}`)}`;
};

const QUICK_ACCESS = ['p-intelligence', 'p-valuations', 'cp-summary', 'cp-financials', 'md-2026-06-30', 'md-2026-05-01'];

export function SearchOverlay({ company, onClose }: OverlayProps) {
  const [query, setQuery] = useState('');
  const [scopes, setScopes] = useState<SearchScope[]>([{ type: 'firm', label: firm.name, id: firm.id }]);

  const scopedId = [...scopes].reverse().find((s) => s.type === 'company')?.id?.replace(/^co-/, '');
  const scoped = db.companies.byId(scopedId);
  const target = scoped ?? db.companies.byId(company?.id);

  // Numeric queries are answered here and never reach AI mode.
  const numeric = useMemo(() => parseNumericQuery(query), [query]);
  const [pending, setPending] = useState(false);
  const [settled, setSettled] = useState('');
  useEffect(() => {
    if (!numeric) { setPending(false); return; }
    setPending(true);
    const t = setTimeout(() => { setPending(false); setSettled(query); }, 250);
    return () => clearTimeout(t);
  }, [numeric, query]);

  const numericResults = useMemo((): Entry[] | null => {
    if (!numeric) return null;
    if (pending || settled !== query) return [statusEntry('ns-loading', 'Searching values…', 'Looking Glass · current firm and measurement date')];
    const d = demo();
    if (d.get('nsError')) return [statusEntry('ns-error', 'Numeric search failed', 'Try again in a moment')];
    const r = searchNumeric(numeric, { firmId: d.get('nsFirm') ?? undefined, date: d.get('nsDate') ?? undefined, enabled: d.get('nsFlag') !== 'off' });
    if (r.status !== 'ok') return [statusEntry(`ns-${r.status}`, ...statusCopy[r.status])];
    if (!r.hits.length) return [statusEntry('ns-empty', 'No values within 10%', `Nothing near “${query.trim()}” for this measurement date`)];
    const rows = r.hits.map(numericEntry);
    return r.truncated ? [...rows, statusEntry('ns-truncated', `Showing ${MAX_RESULTS} of ${r.total}`, 'Add a field name to narrow, e.g. “moic 3x”')] : rows;
  }, [numeric, pending, settled, query]);

  const results = useMemo(() => {
    if (numericResults) return numericResults;
    const q = query.trim().toLowerCase();
    const fixed = staticEntries(target?.id ?? db.companies.all()[0]!.id, target?.name ?? 'Choose a company');
    if (scoped) {
      // Inside a company: its pages and its own documents, version and actions.
      const pool = [...fixed.filter((e) => e.id.startsWith('cp-')), ...companyDetail(scoped)];
      return q ? pool.filter((e) => e.text.includes(q)) : pool;
    }
    if (!q) return QUICK_ACCESS.map((id) => fixed.find((e) => e.id === id)!).filter(Boolean);
    const hits = db.companies.search(q, 6);
    return [
      ...fixed.filter((e) => e.text.includes(q)),
      ...hits.map(companyEntry),
      ...hits.slice(0, 2).flatMap(companyDetail),
    ].slice(0, 14);
  }, [query, scoped, target, numericResults]);

  // Stable semantic hooks for the guided tour (SCAL-9327); GlobalSearch does not forward row attributes.
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = host.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[role=option]').forEach((el, i) => {
      const id = results[i]?.id ?? '';
      if (id.startsWith('ns-') && /^ns-(loading|error|empty|truncated|disabled|unauthorized-firm|unavailable-date)/.test(id)) el.dataset.tour = `numeric-search-state-${id.slice(3)}`;
      else if (id.startsWith('ns-')) el.dataset.tour = 'numeric-search-result-row';
      else delete el.dataset.tour;
    });
  });

  return (
    <div ref={host} data-tour="numeric-search" data-numeric-mode={numeric ? 'on' : 'off'} style={{ display: 'contents' }}>
    <GlobalSearch
      open
      onClose={onClose}
      query={query}
      onQueryChange={setQuery}
      results={results}
      scopes={scopes}
      onScopesChange={(next) => setScopes(next.slice(0, 3))}
      onSelect={(r) => {
        const hit = r as Entry;
        if (hit.id === 'ns-loading' || hit.id === 'ns-error' || hit.id === 'ns-empty' || hit.id === 'ns-truncated' || /^ns-(disabled|unauthorized|unavailable)/.test(hit.id)) return;
        onClose();
        if (hit.id.startsWith('ns-')) goToHit(hit.id);
        else navigate(hit.to[0], hit.to[1]);
      }}
      footer={<Link href={href(routes.home)}>{firm.name}</Link>}
    />
    </div>
  );
}
