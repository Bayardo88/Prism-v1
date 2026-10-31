/**
 * Unified Request Portal (prototype) — the external contact's page for a PPA
 * information request. Brief: Unified Request Portal, built on main @ 9c2526d.
 *
 * One ordered list of requests — questions and documents together (G2.1). The
 * category column filters it; it is never a second list. Navigation is the
 * three tiers of PageTemplate: Login (1) · Information Request, help links and
 * progress (2) · engagement, status filter, Select All and bulk actions (3).
 *
 * Every count — the ring, "N remaining", the category tallies, the filters —
 * derives from the same `requests` array (P1.3). Bulk actions act only on
 * requests that are selected AND visible AND eligible (P1.1, P1.2).
 *
 * Persistence and uploads go through a labelled prototype adapter (store.ts).
 *
 * Prototype switches (scenario.ts, kept in the URL): who sent the request
 * (Scalar → company, Scalar → fund admin, firm → portfolio company), who is
 * looking (the responder, or the sender's own user, who may change the due
 * date), and whether the link has expired (then only ExpiredLink shows, until
 * the recipient logs in).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Banner, Button, Checkbox, CompanyDropdown, CompanyDropdownPanel, CompanyInfo, ContextMenu, EmptyState, FilterDropdown,
  FormField, Icon, InformationLabel, MainMenuItem, MenuDivider, MenuItem, Overline, PageTemplate, PrimaryMenu, ProgressBar,
  Radio, RadioGroup, ScalarProvider, SecondaryMenu, SecondaryMenuItem, SegmentedControl, Select, SelectMenu, SelectMenuOption,
  SubmenuItem, TertiaryMenu, Text, Toast, ToastViewport, breakpoint, color, elevation, icons, radius, size, space, zIndex,
} from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { ExpiredLink } from './ExpiredLink.js';
import { CATEGORIES, REQUEST_META, seedFor } from './fixtures.js';
import { byNumber, isResolved, matchesStatus, type RequestStatus, type StatusFilter } from './model.js';
import {
  ContactDialog, DelegateDialog, DueDateDialog, HelpDialog, LoginDialog, PrivacyDialog, type PortalDialog,
} from './PortalModals.js';
import { RequestRow } from './RequestRow.js';
import { SCENARIOS, SCENARIO_IDS, usePrototypeConfig, type LinkState, type Viewer } from './scenario.js';
import { peekRequests, usePortalStore } from './store.js';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const fmt = (iso: string) => { const [y, m, d] = iso.split('-'); return `${m}/${d}/${y}`; };

/** Whole days from today to an ISO date (negative when past). */
function daysUntil(iso: string, today = new Date()) {
  const [y, m, d] = iso.split('-').map(Number);
  const due = Date.UTC(y!, m! - 1, d!);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((due - now) / 86_400_000);
}

/** What a responder sees instead of the date: words, with tone as a second signal (R8). */
function dueWords(days: number): { text: string; tone: 'secondary' | 'warning' | 'negative' } {
  if (days < 0) return { text: `Overdue by ${-days} day${days === -1 ? '' : 's'}`, tone: 'negative' };
  if (days === 0) return { text: 'Due today', tone: 'warning' };
  return { text: `${days} day${days === 1 ? '' : 's'} remaining`, tone: days <= 2 ? 'warning' : 'secondary' };
}

const storeKey = (state: string, scenario: string, companyId: string) => `${state}.${scenario}.${companyId}`;

function useMobile() {
  const q = `(max-width: ${breakpoint.tabletSmall - 1}px)`;
  const [mobile, setMobile] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMobile(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return mobile;
}

interface ToastItem { id: number; tone: 'positive' | 'negative' | 'info'; text: string }

export function RequestPortal({ state }: ScreenProps) {
  const [config, setConfig] = usePrototypeConfig();
  const scenario = SCENARIOS[config.scenario];
  const multiCompany = scenario.companies.length > 1;
  const [companyId, setCompanyId] = useState(scenario.companies[0]!.id);
  const companyIndex = Math.max(0, scenario.companies.findIndex((c) => c.id === companyId));
  const company = scenario.companies[companyIndex]!;
  // A company from another scenario never carries over.
  useEffect(() => { setCompanyId(SCENARIOS[config.scenario].companies[0]!.id); }, [config.scenario]);
  const seed = useCallback(() => seedFor(state, companyIndex), [state, companyIndex]);
  const store = usePortalStore(storeKey(state, scenario.id, company.id), seed);
  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const [companyMenu, setCompanyMenu] = useState(false);
  const isSender = config.viewer === 'sender';
  // An expired link shows nothing of the request until the recipient logs in.
  const expired = config.link === 'expired' && !loggedIn;
  const mobile = useMobile();
  const [category, setCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [statusMenu, setStatusMenu] = useState(false);
  const [bulkMenu, setBulkMenu] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<PortalDialog>(null);
  const [delegateIds, setDelegateIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  const notify = (tone: ToastItem['tone'], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, tone, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  };

  /* ---- one derived model for every count (P1.3) ---- */
  // Follow-ups live inside their parent: they are never rows and never counted on their own.
  const every = store.requests;
  const all = useMemo(() => store.requests.filter((r) => !r.parentId).sort(byNumber), [store.requests]);
  const done = (r: (typeof all)[number]) => isResolved(r, every);
  const total = all.length;
  const resolvedCount = all.filter(done).length;
  const remaining = total - resolvedCount;
  const visible = all.filter((r) => (category === 'all' || r.categoryId === category) && matchesStatus(r, statusFilter, every));
  const visibleIds = visible.map((r) => r.id);
  const categoriesInUse = CATEGORIES.filter((c) => all.some((r) => r.categoryId === c.id));

  // Selection never outlives the filter that showed it (P1.1).
  const visibleKey = visibleIds.join('|');
  useEffect(() => {
    const shown = new Set(visibleKey.split('|'));
    setSelected((s) => {
      const next = new Set([...s].filter((id) => shown.has(id)));
      return next.size === s.size ? s : next;
    });
  }, [visibleKey]);

  // A different company's list starts with nothing selected or open.
  useEffect(() => { setSelected(new Set()); setExpanded(new Set()); setCategory('all'); }, [company.id]);

  const selectedVisible = visible.filter((r) => selected.has(r.id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;
  const someChecked = selectedVisible.length > 0 && !allChecked;

  const toggleSel = (id: string, on: boolean) => setSelected((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  const toggleExp = (id: string) => setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  /* ---- bulk actions: selected ∩ visible ∩ eligible ---- */
  const pendingSel = selectedVisible.filter((r) => r.status === 'pending').map((r) => r.id);
  const resolvedSel = selectedVisible.filter((r) => r.status !== 'pending').map((r) => r.id);
  const bulkStatus = (status: RequestStatus) => {
    store.setStatus(pendingSel, status);
    notify('info', `${pendingSel.length} request${pendingSel.length === 1 ? '' : 's'} marked ${status === 'na' ? 'not applicable' : 'complete — sent another way'}.`);
    setSelected(new Set()); setBulkMenu(false);
  };
  const bulkReopen = () => {
    store.reopen(resolvedSel);
    notify('info', `${resolvedSel.length} request${resolvedSel.length === 1 ? '' : 's'} reopened.`);
    setSelected(new Set()); setBulkMenu(false);
  };
  const openDelegate = (ids: string[]) => { setDelegateIds(ids); setDialog('delegate'); setBulkMenu(false); };

  const clearFilters = () => { setCategory('all'); setStatusFilter('all'); };
  const statusText = STATUS_OPTIONS.find((o) => o.value === statusFilter)!.label;

  const engagement = (
    <Text as="span" step="s" weight="semiBold" style={{ whiteSpace: 'nowrap', paddingInline: mobile ? undefined : space.s }}>
      {REQUEST_META.engagement} | Report Date {REQUEST_META.reportDate}
    </Text>
  );

  // The sender sets the date (an action, so a Button); the responder sees how long is left, in words.
  const due = dueWords(daysUntil(store.dueDate));
  const deadline = isSender ? (
    <Button size="s" variant="tertiary" leadingIcon={<Icon size="s" tone="inherit"><icons.EditCalendar /></Icon>} onClick={() => setDialog('due-date')}
      aria-label={`Due ${fmt(store.dueDate)}. Change due date`}>
      Due {fmt(store.dueDate)}
    </Button>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: space.xs, flex: 'none' }}>
      <Icon size="s" tone={due.tone === 'secondary' ? 'secondary' : due.tone}><icons.Schedule /></Icon>
      <Text as="span" step="s" weight={due.tone === 'secondary' ? 'regular' : 'semiBold'} tone={due.tone} style={{ whiteSpace: 'nowrap' }}>{due.text}</Text>
    </span>
  );

  /* ---- chrome ---- */
  const logo = scenario.brand === 'scalar'
    ? <img src="./assets/scalar-logo-white.svg" alt="Scalar" style={{ display: 'block', height: size.icon.l, width: 'auto' }} />
    : <img className="scalar-primary-menu__logo" src="./assets/firm-logo.jpg" alt={scenario.senderName} />;

  // Fund admin: one company at a time. The menu shows each company's progress from its own stored list.
  const companyStats = scenario.companies.map((c, i) => {
    const list = c.id === company.id ? every : peekRequests(storeKey(state, scenario.id, c.id), () => seedFor(state, i));
    const parents = list.filter((r) => !r.parentId);
    const resolved = parents.filter((r) => isResolved(r, list)).length;
    return { company: c, resolved, total: parents.length, complete: parents.length > 0 && resolved === parents.length };
  });
  const companiesComplete = companyStats.filter((x) => x.complete).length;
  const companySwitcher = multiCompany && (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <CompanyDropdown expanded={companyMenu} onClick={() => setCompanyMenu((o) => !o)}>{company.name}</CompanyDropdown>
      {companyMenu && (
        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay, marginTop: space.xs, background: color.bg.surface, borderRadius: radius.s, boxShadow: elevation.overlay, minWidth: 'max-content' }}>
          <Text as="p" step="s" tone="secondary" style={{ margin: 0, padding: `${space.s} ${space.m} 0` }}>
            {companiesComplete} of {scenario.companies.length} companies complete
          </Text>
          <CompanyDropdownPanel
            label="Companies in this request"
            currentId={company.id}
            initialFocus
            onClose={() => setCompanyMenu(false)}
            onSelect={(id) => { setCompanyId(id); setCompanyMenu(false); }}
            companies={companyStats.map((x) => ({
              id: x.company.id,
              name: (
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: space.l, width: '100%' }}>
                  <span>{x.company.name}</span>
                  <Text as="span" step="s" tone={x.complete ? 'positive' : 'secondary'}>{x.complete ? 'Complete' : `${x.resolved}/${x.total}`}</Text>
                </span>
              ),
            }))}
          />
        </div>
      )}
    </span>
  );

  const navigation = (
    <PrimaryMenu
      navLabel="Portal"
      logo={logo}
      end={loggedIn ? (
        <MainMenuItem icon={<Icon size="s" tone="onBrand"><icons.Logout /></Icon>} onClick={() => { setLoggedIn(null); notify('info', 'Logged out.'); }}>
          Log out
        </MainMenuItem>
      ) : (
        <MainMenuItem icon={<Icon size="s" tone="onBrand"><icons.Login /></Icon>} onClick={() => setDialog('login')}>
          Login
        </MainMenuItem>
      )}
    >
      {companySwitcher}
    </PrimaryMenu>
  );

  // A thin determinate bar (AI-GUIDE §5: progress with a known total) fits the 32px tier; the ring did not.
  const pct = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const progress = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: space.s, flex: 'none' }}>
      <Text as="span" step="s" weight="semiBold" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
        {resolvedCount}/{total}
      </Text>
      <ProgressBar
        value={pct}
        label={`${resolvedCount} of ${total} information requests resolved`}
        style={{ width: mobile ? size.control.l : `calc(${size.control.l} * 3)` }}
      />
      {!mobile && total > 0 && (
        <Text as="span" step="s" tone="secondary" style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</Text>
      )}
      {/* The header's label/value pair (CompanyInfo stories). Brand while work is left; positive only when done. */}
      <InformationLabel
        aria-live="polite"
        label={mobile ? 'Left' : 'Remaining'}
        value={total === 0 ? 'No requests' : remaining === 0 ? 'All resolved' : mobile ? String(remaining) : `${remaining} request${remaining === 1 ? '' : 's'}`}
        tone={total > 0 && remaining === 0 ? 'positive' : 'brand'}
      />
    </span>
  );

  const companyInfo = (
    <CompanyInfo
      name={company.name}
      end={expired ? undefined : <>
        {!mobile && deadline}
        {progress}
      </>}
    >
      {/* "Information Request" is the selected item of this row; the company it is for is the title.
          A phone has no room for the row: the help links move into the body. */}
      {!mobile && (
        <SecondaryMenu label="Request">
          <SecondaryMenuItem current>Information Request</SecondaryMenuItem>
          <SecondaryMenuItem onClick={() => setDialog('contact')}>Contact Us</SecondaryMenuItem>
          <SecondaryMenuItem onClick={() => setDialog('privacy')}>Privacy Policy</SecondaryMenuItem>
          <SecondaryMenuItem onClick={() => setDialog('help')}>How do I use this?</SecondaryMenuItem>
        </SecondaryMenu>
      )}
    </CompanyInfo>
  );

  const subNavigation = (
    <TertiaryMenu
      label="Request tools"
      end={<>
        <div style={{ position: 'relative' }}>
          <FilterDropdown label="Status" expanded={statusMenu} aria-haspopup="listbox" onClick={() => setStatusMenu((o) => !o)}>
            {statusText}
          </FilterDropdown>
          {statusMenu && (
            <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: zIndex.overlay, marginTop: space.xs }}>
              <SelectMenu label="Status" onEscape={() => setStatusMenu(false)}>
                {STATUS_OPTIONS.map((o) => (
                  <SelectMenuOption key={o.value} selected={o.value === statusFilter} onSelect={() => { setStatusFilter(o.value); setStatusMenu(false); }}>
                    {o.label}
                  </SelectMenuOption>
                ))}
              </SelectMenu>
            </div>
          )}
        </div>
        <Checkbox size="s" checked={allChecked} indeterminate={someChecked} disabled={visible.length === 0}
          onChange={() => setSelected(allChecked ? new Set() : new Set(visibleIds))}>
          <Text as="span" step="s" style={{ whiteSpace: 'nowrap' }}>{selectedVisible.length ? `${selectedVisible.length} selected` : 'Select All'}</Text>
        </Checkbox>
        <div style={{ position: 'relative' }}>
          <Button size="s" variant="secondary" disabled={!selectedVisible.length} aria-haspopup="menu" aria-expanded={bulkMenu}
            trailingIcon={<Icon size="s" tone="inherit"><icons.ArrowDropDown /></Icon>} onClick={() => setBulkMenu((o) => !o)}>
            Bulk actions
          </Button>
          {bulkMenu && selectedVisible.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: zIndex.overlay, marginTop: space.xs, boxShadow: elevation.overlay }}>
              {/* APG menu pattern: focus moves into the menu when it opens. */}
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <ContextMenu label="Bulk actions" autoFocus onClose={() => setBulkMenu(false)}>
                <MenuItem disabled={!pendingSel.length} onClick={() => bulkStatus('na')} icon={<Icon size="s" tone="inherit"><icons.DoNotDisturbOn /></Icon>}>
                  {`Mark as not applicable (${pendingSel.length})`}
                </MenuItem>
                <MenuItem disabled={!pendingSel.length} onClick={() => bulkStatus('sent')} icon={<Icon size="s" tone="inherit"><icons.Send /></Icon>}>
                  {`Mark complete – sent another way (${pendingSel.length})`}
                </MenuItem>
                <MenuItem disabled={!resolvedSel.length} onClick={bulkReopen} icon={<Icon size="s" tone="inherit"><icons.Undo /></Icon>}>
                  {`Reopen (${resolvedSel.length})`}
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => openDelegate(selectedVisible.map((r) => r.id))} icon={<Icon size="s" tone="inherit"><icons.PersonAdd /></Icon>}>
                  {`Delegate (${selectedVisible.length})`}
                </MenuItem>
              </ContextMenu>
            </div>
          )}
        </div>
      </>}
    >
      {!mobile && engagement}
    </TertiaryMenu>
  );

  /* ---- body ---- */
  const categoryNav = (
    <nav aria-label="Categories" style={{ display: 'flex', flexDirection: 'column', gap: space['2xs'] }}>
      <SubmenuItem current={category === 'all'} onClick={() => setCategory('all')}>
        <span style={{ display: 'flex', justifyContent: 'space-between', gap: space.s, width: '100%' }}>
          <span>All requests</span><Text as="span" step="s" tone="secondary">{resolvedCount}/{total}</Text>
        </span>
      </SubmenuItem>
      {categoriesInUse.map((c) => {
        const items = all.filter((r) => r.categoryId === c.id);
        const doneCount = items.filter(done).length;
        return (
          <SubmenuItem key={c.id} current={category === c.id} onClick={() => setCategory(c.id)}>
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: space.s, width: '100%' }}>
              <span style={{ whiteSpace: 'nowrap' }}>{c.order}. {c.name}</span>
              <Text as="span" step="s" tone={doneCount === items.length ? 'positive' : 'secondary'}>
                {doneCount}/{items.length}<span className="scalar-visually-hidden"> resolved</span>
              </Text>
            </span>
          </SubmenuItem>
        );
      })}
    </nav>
  );

  const resetAll = () => {
    store.reset(scenario.companies.map((c) => storeKey(state, scenario.id, c.id)));
    setSelected(new Set()); setExpanded(new Set());
    notify('info', 'Prototype data reset.');
  };
  const prototypeControls = config.controls && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.m, padding: space.m, borderTop: `1px solid ${color.stroke.divider}` }}>
      <Overline as="h2">Prototype view</Overline>
      <RadioGroup label="Who sent the request" size="s" value={config.scenario} onValueChange={(v) => setConfig({ scenario: v as typeof config.scenario })}>
        {SCENARIO_IDS.map((id) => <Radio key={id} value={id}><Text as="span" step="s">{SCENARIOS[id].label}</Text></Radio>)}
      </RadioGroup>
      <SegmentedControl<Viewer>
        label="Viewing as"
        value={config.viewer}
        onChange={(v) => setConfig({ viewer: v })}
        options={[{ value: 'responder', label: 'Responder' }, { value: 'sender', label: scenario.senderRole }]}
      />
      <SegmentedControl<LinkState>
        label="Link"
        value={config.link}
        onChange={(v) => setConfig({ link: v })}
        options={[{ value: 'active', label: 'Active link' }, { value: 'expired', label: 'Expired link' }]}
      />
      <Text step="s" tone="secondary">Answers and files are kept in this browser only. Nothing is uploaded or encrypted.</Text>
      <Checkbox size="s" checked={store.simulateFailure} onChange={(e) => store.setSimulateFailure(e.currentTarget.checked)}>
        <Text as="span" step="s">Simulate save / upload failure</Text>
      </Checkbox>
      <div><Button size="s" variant="tertiary" onClick={resetAll}>Reset prototype data</Button></div>
    </div>
  );

  const list = total === 0 ? (
    <EmptyState type="no-data" title="No requests yet" body={`${scenario.senderName} has not sent any requests for ${company.name} for this report date. You’ll get an email when they do.`} icon={<icons.Inbox />} />
  ) : visible.length === 0 ? (
    <EmptyState
      type="no-results"
      title={statusFilter === 'pending' && category === 'all' ? 'Nothing left to do' : 'No requests match these filters'}
      body={`Showing ${statusText.toLowerCase()} requests${category === 'all' ? '' : ` in ${CATEGORIES.find((c) => c.id === category)?.name}`}.`}
      icon={<icons.FilterAlt />}
      actions={<Button variant="secondary" size="s" onClick={clearFilters}>Clear filters</Button>}
    />
  ) : (
    <ul aria-label="Requests" style={{ margin: 0, padding: 0 }}>
      {visible.map((r, i) => {
        const showHeader = category === 'all' && (i === 0 || visible[i - 1]!.categoryId !== r.categoryId);
        const cat = CATEGORIES.find((c) => c.id === r.categoryId)!;
        return (
          <RequestRowWithHeader key={r.id} header={showHeader ? `${cat.order}. ${cat.name}` : undefined}>
            <RequestRow
              req={r}
              all={every}
              expanded={expanded.has(r.id)}
              onToggle={() => toggleExp(r.id)}
              selected={selected.has(r.id)}
              onSelect={(on) => toggleSel(r.id, on)}
              store={store}
              onDelegate={(id) => openDelegate([id])}
              notify={notify}
              mobile={mobile}
            />
          </RequestRowWithHeader>
        );
      })}
    </ul>
  );

  return (
    <ScalarProvider mode="light" viewport="auto">
      <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: color.bg.page }}>
        {expired ? (
          <PageTemplate fullHeight={false} navigation={navigation} companyInfo={companyInfo}>
            <ExpiredLink
              email={scenario.recipient.email}
              sender={scenario.senderName}
              company={company.name}
              simulateFailure={store.simulateFailure}
              onLogin={() => setDialog('login')}
            />
            {prototypeControls && (
              <div style={{ alignSelf: 'center', width: '100%', maxWidth: '60ch', marginBottom: space.l, border: `1px solid ${color.stroke.default}`, borderRadius: radius.s, background: color.bg.surface }}>
                {prototypeControls}
              </div>
            )}
          </PageTemplate>
        ) : (
        <PageTemplate fullHeight={false} navigation={navigation} companyInfo={companyInfo} subNavigation={subNavigation}>
          <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: mobile ? 'minmax(0, 1fr)' : 'minmax(min-content, 1fr) minmax(0, 4fr)', gap: space.l, paddingBlock: space.m }}>
            {!mobile && (
              <aside style={{ minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid ${color.stroke.default}`, borderRadius: radius.s, background: color.bg.surface }}>
                <div style={{ padding: space.s }}>
                  <Overline as="h2" style={{ padding: `${space.xs} ${space.s}` }}>Categories</Overline>
                  {categoryNav}
                </div>
                {prototypeControls}
              </aside>
            )}
            <section aria-label="Requests" style={{ minHeight: 0, overflow: 'auto', border: `1px solid ${color.stroke.default}`, borderRadius: radius.s, background: color.bg.surface }}>
              {mobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: space.s, padding: space.m, borderBottom: `1px solid ${color.stroke.divider}` }}>
                  {engagement}
                  <FormField label="Category">
                    <Select value={category} onChange={(e) => setCategory(e.currentTarget.value)}>
                      <option value="all">All requests ({resolvedCount}/{total})</option>
                      {categoriesInUse.map((c) => {
                        const items = all.filter((r) => r.categoryId === c.id);
                        return <option key={c.id} value={c.id}>{c.order}. {c.name} ({items.filter(done).length}/{items.length})</option>;
                      })}
                    </Select>
                  </FormField>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.s }}>
                    {deadline}
                    <Button size="s" variant="tertiary" onClick={() => setDialog('help')}>How do I use this?</Button>
                    <Button size="s" variant="tertiary" onClick={() => setDialog('contact')}>Contact Us</Button>
                    <Button size="s" variant="tertiary" onClick={() => setDialog('privacy')}>Privacy Policy</Button>
                  </div>
                </div>
              )}
              {total > 0 && remaining === 0 && (
                <div style={{ padding: space.m }}>
                  <Banner tone="positive" title="Every request is resolved">
                    {`Thank you. ${scenario.senderName} can see your responses for ${company.name}. You can still open a request to change it.`}
                  </Banner>
                </div>
              )}
              {list}
              {mobile && prototypeControls}
            </section>
          </div>
        </PageTemplate>
        )}

        <ToastViewport aria-label="Notifications">
          {toasts.map((t) => (
            <Toast key={t.id} tone={t.tone} onDismiss={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>{t.text}</Toast>
          ))}
        </ToastViewport>

        <LoginDialog
          open={dialog === 'login'}
          onClose={() => setDialog(null)}
          email={scenario.recipient.email}
          onLogin={(email) => { setLoggedIn(email); setDialog(null); notify('positive', `Logged in as ${email}.`); }}
        />
        <ContactDialog open={dialog === 'contact'} onClose={() => setDialog(null)} notify={notify} />
        <PrivacyDialog open={dialog === 'privacy'} onClose={() => setDialog(null)} sender={scenario.senderName} poweredBy={scenario.poweredBy} />
        <HelpDialog open={dialog === 'help'} onClose={() => setDialog(null)} poweredBy={scenario.poweredBy} multiCompany={multiCompany} />
        <DueDateDialog
          open={dialog === 'due-date'}
          onClose={() => setDialog(null)}
          dueDate={store.dueDate}
          onSave={(iso) => { store.setDueDate(iso); notify('positive', `Due date changed to ${fmt(iso)}.`); }}
        />
        <DelegateDialog
          open={dialog === 'delegate'}
          onClose={() => setDialog(null)}
          count={delegateIds.length}
          onSubmit={async (email) => { await store.delegate(delegateIds, email); notify('positive', `Delegated to ${email}.`); setSelected(new Set()); }}
        />
      </div>
    </ScalarProvider>
  );
}

function RequestRowWithHeader({ header, children }: { header?: string; children: ReactNode }) {
  return (
    <>
      {header && (
        <li style={{ listStyle: 'none', padding: `${space.s} ${space.m} ${space.xs}`, background: color.bg.subtle, borderBottom: `1px solid ${color.stroke.divider}` }}>
          <Overline>{header}</Overline>
        </li>
      )}
      {children}
    </>
  );
}
