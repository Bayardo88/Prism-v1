/**
 * Prototype — Notifications Center (Figma file BbebfOi2JVBIYgQWaSj52G).
 *
 * Composes the real Cap Table screen unchanged and swaps the bell's menu for
 * the prototype panel through `GlobalMenuOverridesContext`.
 *
 * Logic (see docs/product/pages/prototype-notifications-center.md):
 * an event passes the filters (scope, only my changes) or stays hidden →
 * the bell shows unread → panel closed: a toast; panel open: a highlighted
 * card → opening the panel shows everything; closing it marks what was seen
 * as read. Alerts can be dismissed, activity stays as a log.
 *
 * States: default · ai-processing (a job runs, then completes) · inbox ·
 * filters · empty.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Icon, ScalarProvider, Toast, ToastViewport, Typography, color, glyphs } from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { companyById, type Company } from '../../../data/fixtures.js';
import { GlobalMenuOverridesContext, type GlobalMenuOverrides } from '../../../shell/AppFrame.js';
import type { GlobalMenu } from '../../../shell/overlays/index.js';
import { CapTable } from '../../p07-company-cap-table/CapTable.js';
import { NotificationsPanel, NotificationsStoreContext, type NotificationsStore } from './NotificationsPanel.js';
import { DEFAULT_FILTERS, aiJob, passes, seedFeed, type AppNotification, type Filters } from './data.js';
import { riseStyle, useEntered } from './motion.js';

/** How long the simulated AI job reads documents, and how long the result toast stays (AI Studio: 15 s, 8 s). */
const JOB_MS = 15000;
const TOAST_MS = 8000;

/**
 * The AI job toast. It rises in from below on mount (AI Studio
 * `slide-in-from-bottom fade-in`); the running → done swap keeps the element,
 * so the entrance does not replay.
 */
function JobToast({ state, company, onDismiss, onHoverChange }: {
  state: 'running' | 'done';
  company: Company;
  onDismiss: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const entered = useEntered();
  return (
    <Toast
      tone="info"
      // The DS Toast has no AI tone; its own fill/ink hooks take the AI pair (bg.ai + text.onAi, R3).
      style={{ ...riseStyle(entered), '--toast-bg': color.bg.ai, '--toast-ink': color.text.onAi } as CSSProperties}
      icon={<Icon size="m" tone="inherit"><glyphs.AiMark /></Icon>}
      onDismiss={onDismiss}
      dismissLabel="Dismiss AI processing update"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <Typography variant="label" step="m" weight="semiBold" tone="inherit" as="div">
        {state === 'running' ? 'AI processing' : 'AI processing complete'}
      </Typography>
      <Typography variant="text" step="s" tone="inherit" as="div">
        {state === 'running'
          ? `Reading documents for ${company.name}…`
          : 'Annual Report 2026.pdf has been analyzed. Open notifications to view results.'}
      </Typography>
    </Toast>
  );
}

const MENUS: GlobalMenuOverrides['menus'] = { notifications: NotificationsPanel, 'notification-settings': NotificationsPanel };

const isPanel = (m?: GlobalMenu) => m === 'notifications' || m === 'notification-settings';

function initialFeed(state: string, company: Company): AppNotification[] {
  if (state === 'empty') return [];
  const feed = seedFeed(company);
  return state === 'ai-processing' ? [aiJob(company).running, ...feed] : feed;
}

const openMenuFor: Record<string, GlobalMenu | undefined> = {
  inbox: 'notifications',
  filters: 'notification-settings',
  empty: 'notifications',
};

export function NotificationsCenter({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [feed, setFeed] = useState(() => initialFeed(state, company));
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [toast, setToast] = useState<'running' | 'done' | null>(state === 'ai-processing' ? 'running' : null);
  const panelOpen = useRef(false);

  const visible = useMemo(() => feed.filter((n) => passes(n, filters, company)), [feed, filters, company]);

  // The simulated AI job: "Reading documents" becomes "AI processing complete".
  useEffect(() => {
    if (state !== 'ai-processing') return;
    const t = window.setTimeout(() => {
      const { done } = aiJob(company);
      setFeed((cur) => cur.map((n) => (n.id === 'ai-job' ? done : n)));
      setToast(panelOpen.current ? null : 'done');
    }, JOB_MS);
    return () => window.clearTimeout(t);
  }, [state, company]);

  // The result toast hides itself; hovering it pauses the timer.
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (toast !== 'done' || hovered) return;
    const t = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toast, hovered]);

  const onMenuChange = useCallback((menu: GlobalMenu | undefined) => {
    const open = isPanel(menu);
    // The open panel shows the job itself, so no toast sits over it.
    if (open) setToast(null);
    // Closing the panel marks what the user saw as read; a running job stays live.
    if (panelOpen.current && !open) {
      setFeed((cur) => cur.map((n) => (n.inProgress ? n : { ...n, read: true })));
    }
    panelOpen.current = open;
  }, []);

  const store: NotificationsStore = useMemo(() => ({
    visible,
    total: feed.length,
    filters,
    setFilters,
    dismiss: (id) => setFeed((cur) => cur.filter((n) => n.id !== id)),
  }), [visible, feed.length, filters]);

  const overrides: GlobalMenuOverrides = useMemo(() => ({
    menus: MENUS,
    unread: visible.some((n) => !n.read),
    openMenu: openMenuFor[state],
    onMenuChange,
  }), [visible, state, onMenuChange]);

  return (
    <NotificationsStoreContext.Provider value={store}>
      <GlobalMenuOverridesContext.Provider value={overrides}>
        <CapTable state="default" params={params} />
      </GlobalMenuOverridesContext.Provider>
      <ScalarProvider mode="light">
        <ToastViewport aria-label="Notifications">
          {toast && (
            <JobToast state={toast} company={company} onDismiss={() => setToast(null)} onHoverChange={setHovered} />
          )}
        </ToastViewport>
      </ScalarProvider>
    </NotificationsStoreContext.Provider>
  );
}
