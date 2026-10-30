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
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Banner, Button, Checkbox, CompanyInfo, ContextMenu, EmptyState, FilterDropdown, FormField, Icon, MainMenuItem,
  MenuDivider, MenuItem, Overline, PageTemplate, PrimaryMenu, ProgressRing, ScalarProvider, SecondaryMenu,
  SecondaryMenuItem, Select, SelectMenu, SelectMenuOption, SubmenuItem, TertiaryMenu, Text, Toast, ToastViewport,
  breakpoint, color, elevation, icons, radius, size, space, zIndex,
} from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { CATEGORIES, REQUEST_META } from './fixtures.js';
import { byNumber, isResolved, matchesStatus, type RequestStatus, type StatusFilter } from './model.js';
import {
  ContactDialog, DelegateDialog, ExtendDialog, HelpDialog, LoginDialog, PrivacyDialog, type PortalDialog,
} from './PortalModals.js';
import { RequestRow } from './RequestRow.js';
import { usePortalStore } from './store.js';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

const fmt = (iso: string) => { const [y, m, d] = iso.split('-'); return `${m}/${d}/${y}`; };

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
  const store = usePortalStore(state);
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
  const all = useMemo(() => [...store.requests].sort(byNumber), [store.requests]);
  const total = all.length;
  const resolvedCount = all.filter(isResolved).length;
  const remaining = total - resolvedCount;
  const visible = all.filter((r) => (category === 'all' || r.categoryId === category) && matchesStatus(r, statusFilter));
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

  const selectedVisible = visible.filter((r) => selected.has(r.id));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;
  const someChecked = selectedVisible.length > 0 && !allChecked;

  const toggleSel = (id: string, on: boolean) => setSelected((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  const toggleExp = (id: string) => setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  /* ---- bulk actions: selected ∩ visible ∩ eligible ---- */
  const pendingSel = selectedVisible.filter((r) => !isResolved(r)).map((r) => r.id);
  const resolvedSel = selectedVisible.filter(isResolved).map((r) => r.id);
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
  const deadlineLabel = store.extension ? `Extension requested · ${fmt(store.extension.requestedDate)}` : `Due ${fmt(store.dueDate)}`;

  const engagement = (
    <Text as="span" step="s" weight="semiBold" style={{ whiteSpace: 'nowrap', paddingInline: mobile ? undefined : space.s }}>
      {REQUEST_META.engagement} | Report Date {REQUEST_META.reportDate}
    </Text>
  );

  // An action, so a Button (a clickable Chip is a toggle, AI-GUIDE §5).
  const deadline = (
    <Button size="s" variant="tertiary" leadingIcon={<Icon size="s" tone="inherit"><icons.Schedule /></Icon>} onClick={() => setDialog('extend')}>
      {store.extension ? deadlineLabel : `${deadlineLabel} · Extend`}
    </Button>
  );

  /* ---- chrome ---- */
  const navigation = (
    <PrimaryMenu
      navLabel="Portal"
      logo={<img className="scalar-primary-menu__logo" src="./assets/firm-logo.jpg" alt={REQUEST_META.firm} />}
      end={
        <MainMenuItem icon={<Icon size="s" tone="onBrand"><icons.Login /></Icon>} onClick={() => setDialog('login')}>
          Login
        </MainMenuItem>
      }
    />
  );

  const progress = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: space.s, flex: 'none' }}>
      {/* The DS ring is 48px; the Secondary Menu bar is 32px. Shown at size.control.s, its 12px label fits up to "99%".
          At 100% a check replaces it (gap: ProgressRing has no compact size — see the page doc). */}
      {total > 0 && remaining === 0 ? (
        <Icon size="xl" tone="positive" label="All information requests resolved"><icons.CheckCircle /></Icon>
      ) : (
        <ProgressRing
          value={resolvedCount}
          max={total}
          display="percent"
          label="Information requests resolved"
          style={{ width: size.control.s, height: size.control.s }}
        />
      )}
      <Text as="span" step="s" tone="secondary" aria-live="polite" style={{ whiteSpace: 'nowrap' }}>
        {total === 0 ? 'No requests' : remaining === 0 ? 'All resolved' : `${remaining} remaining`}
      </Text>
    </span>
  );

  const companyInfo = (
    <CompanyInfo
      name="Information Request"
      end={<>
        {!mobile && deadline}
        {progress}
      </>}
    >
      {!mobile && (
        <SecondaryMenu label="Help">
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
        const done = items.filter(isResolved).length;
        return (
          <SubmenuItem key={c.id} current={category === c.id} onClick={() => setCategory(c.id)}>
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: space.s, width: '100%' }}>
              <span style={{ whiteSpace: 'nowrap' }}>{c.order}. {c.name}</span>
              <Text as="span" step="s" tone={done === items.length ? 'positive' : 'secondary'}>
                {done}/{items.length}<span className="scalar-visually-hidden"> resolved</span>
              </Text>
            </span>
          </SubmenuItem>
        );
      })}
    </nav>
  );

  const prototypeControls = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.s, padding: space.m, borderTop: `1px solid ${color.stroke.divider}` }}>
      <Text step="s" tone="secondary">Prototype — answers and files are kept in this browser only. Nothing is uploaded or encrypted.</Text>
      <Checkbox size="s" checked={store.simulateFailure} onChange={(e) => store.setSimulateFailure(e.currentTarget.checked)}>
        <Text as="span" step="s">Simulate save / upload failure</Text>
      </Checkbox>
      <div><Button size="s" variant="tertiary" onClick={() => { store.reset(); setSelected(new Set()); setExpanded(new Set()); notify('info', 'Prototype data reset.'); }}>Reset prototype data</Button></div>
    </div>
  );

  const list = total === 0 ? (
    <EmptyState type="no-data" title="No requests yet" body={`${REQUEST_META.firm} has not sent any requests for this report date. You’ll get an email when they do.`} icon={<icons.Inbox />} />
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
                        return <option key={c.id} value={c.id}>{c.order}. {c.name} ({items.filter(isResolved).length}/{items.length})</option>;
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
                    {`Thank you. ${REQUEST_META.analyst} can see your responses. You can still open a request to change it.`}
                  </Banner>
                </div>
              )}
              {list}
              {mobile && prototypeControls}
            </section>
          </div>
        </PageTemplate>

        <ToastViewport aria-label="Notifications">
          {toasts.map((t) => (
            <Toast key={t.id} tone={t.tone} onDismiss={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>{t.text}</Toast>
          ))}
        </ToastViewport>

        <LoginDialog open={dialog === 'login'} onClose={() => setDialog(null)} notify={notify} />
        <ContactDialog open={dialog === 'contact'} onClose={() => setDialog(null)} notify={notify} />
        <PrivacyDialog open={dialog === 'privacy'} onClose={() => setDialog(null)} />
        <HelpDialog open={dialog === 'help'} onClose={() => setDialog(null)} />
        <ExtendDialog
          open={dialog === 'extend'}
          onClose={() => setDialog(null)}
          dueDate={store.dueDate}
          onSubmit={async (date, reason) => { await store.requestExtension(date, reason); notify('positive', `Extension to ${fmt(date)} requested. ${REQUEST_META.analyst} will confirm.`); }}
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
