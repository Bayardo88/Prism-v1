import {
  createContext, forwardRef, useContext, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { useRovingFocus } from '../../utils/useRovingFocus.js';

interface WorkspaceContextValue {
  /** id of the tabpanel; undefined while docked (there is no panel). */
  panelId: string | undefined;
  /** id given to whichever tab is active, so the panel can be labelled by it. */
  activeTabId: string;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export interface WorkspaceDrawerTabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode;
  icon?: ReactNode;
  /** A queue length, not a notification. Hide it when nothing is waiting. */
  count?: number;
  active?: boolean;
  /**
   * Reserved for a tab whose content is model-generated. The one place in the
   * drawer chrome that carries the solid Background/AI, so the purple always
   * means "a model produced this".
   */
  ai?: boolean;
}

/**
 * Workspace Drawer Tab — one tab in the docked workspace drawer.
 *
 * Inside a `WorkspaceDrawer` it is a roving tab stop (only the active tab is in
 * the Tab order; arrows move between tabs) and the active tab controls the
 * drawer's tabpanel.
 */
export const WorkspaceDrawerTab = forwardRef<HTMLButtonElement, WorkspaceDrawerTabProps>(function WorkspaceDrawerTab(
  { label, icon, count, active, ai, className, id, ...rest },
  ref,
) {
  const ctx = useContext(WorkspaceContext);
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={id ?? (active ? ctx?.activeTabId : undefined)}
      aria-selected={!!active}
      aria-controls={active ? ctx?.panelId : undefined}
      tabIndex={ctx ? (active ? 0 : -1) : undefined}
      className={cx('scalar-workspace-tab', ai && 'scalar-workspace-tab--ai', className)}
      {...rest}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && <span className="scalar-workspace-tab__count">{count}</span>}
    </button>
  );
});

export interface WorkspaceDrawerProps extends HTMLAttributes<HTMLElement> {
  /** WorkspaceDrawerTab instances. Exactly one is active. */
  tabs?: ReactNode;
  children?: ReactNode;
  /** Expanded trades page height for drawer height. */
  expanded?: boolean;
  /**
   * Docked: the tab strip only, with no content area — the resting state at the
   * foot of a page (Figma "Workspace Drawer · docked"). Opening a tab swaps it
   * for the open drawer.
   */
  docked?: boolean;
  /** Accessible name of the tab strip. Default "Workspace". The drawer itself is named by `aria-label` (default "Workspace"). */
  tabsLabel?: string;
}

/**
 * Workspace Drawer — the docked panel at the foot of a data page, where
 * documents, notes and model output are worked through without leaving the
 * table above.
 *
 * It is sticky to the bottom of the viewport (or of its nearest scroll
 * container): render it as the last child of the page's scrolling column and
 * the content above scrolls behind it. 40vh, or 60vh when `expanded`.
 *
 * Notes, Sheets and Documents are content slots: swap the children for that
 * tab's own view rather than forking the drawer.
 *
 * Accessibility: a labelled region; the tab strip is a `tablist` with roving
 * focus (←/→, Home/End move focus; Enter/Space activates, via the tab's
 * `onClick`). The body is a `tabpanel` labelled by the active tab. It does not
 * trap focus or take it on mount — it is docked page chrome, not an overlay.
 */
export const WorkspaceDrawer = forwardRef<HTMLElement, WorkspaceDrawerProps>(function WorkspaceDrawer(
  { tabs, children, expanded, docked, tabsLabel = 'Workspace', className, 'aria-label': ariaLabel = 'Workspace', ...rest },
  ref,
) {
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);
  const [hasActiveTab, setHasActiveTab] = useState(false);
  const roving = useRovingFocus({ orientation: 'horizontal', itemSelector: '[role="tab"]' });
  const activeTabId = `${baseId}-active-tab`;
  const panelId = docked ? undefined : `${baseId}-panel`;

  // Keep the strip reachable: if no tab is active, the first one is the tab stop.
  useEffect(() => {
    const list = tablistRef.current;
    if (!list) return;
    const all = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
    if (all.length && !all.some((t) => t.tabIndex === 0)) all[0]!.tabIndex = 0;
    setHasActiveTab(list.querySelector('[role="tab"][aria-selected="true"]') !== null);
  }, [tabs, docked]);

  return (
    <WorkspaceContext.Provider value={{ panelId, activeTabId }}>
      <section
        ref={ref}
        className={cx('scalar-workspace-drawer', className)}
        aria-label={ariaLabel}
        data-expanded={expanded ? 'true' : undefined}
        data-docked={docked ? 'true' : undefined}
        {...rest}
      >
        {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- the tabs inside own focus (roving tabindex); the tablist itself is not a tab stop */}
        <div
          ref={tablistRef}
          className="scalar-workspace-drawer__tabs"
          role="tablist"
          aria-label={tabsLabel}
          onKeyDown={roving.onKeyDown}
        >
          {tabs}
        </div>
        {!docked && (
          <div
            className="scalar-workspace-drawer__body"
            id={panelId}
            role="tabpanel"
            aria-labelledby={hasActiveTab ? activeTabId : undefined}
            aria-label={hasActiveTab ? undefined : ariaLabel}
          >
            {children}
          </div>
        )}
      </section>
    </WorkspaceContext.Provider>
  );
});
