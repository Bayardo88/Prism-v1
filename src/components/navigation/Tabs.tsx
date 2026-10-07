import {
  createContext, forwardRef, useContext, useId,
  type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { useRovingFocus } from '../../utils/useRovingFocus.js';

const TabsContext = createContext<string | null>(null);

const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

export interface TabItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;
  /** Exactly one tab is active at all times. Inactive tabs are `tabIndex=-1` and reached with the arrow keys. */
  active?: boolean;
  /**
   * Identifies the tab. Inside `Tabs`, a `TabItem` and a `TabPanel` with the same
   * `value` are wired together (`aria-controls` ↔ `aria-labelledby`) automatically.
   */
  value?: string;
  /** Explicit id of the panel this tab controls. Overrides the id derived from `value`. */
  controls?: string;
}

/**
 * Tab Item — one tab in a Tabs bar.
 *
 * Keep labels to one or two words and never let them wrap.
 *
 * Accessibility: the drawn control is under 44px, so the target is carried by
 * padding rather than the label box. `aria-selected` is always present
 * (`true`/`false`). Keyboard handling lives on the parent `Tabs`.
 */
export const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(function TabItem(
  { children, active, value, controls, className, type = 'button', ...rest },
  ref,
) {
  const base = useContext(TabsContext);
  const derivedId = base && value !== undefined ? tabId(base, value) : undefined;
  const derivedControls = controls ?? (base && value !== undefined ? panelId(base, value) : undefined);
  return (
    <button
      ref={ref}
      id={derivedId}
      type={type}
      role="tab"
      aria-selected={!!active}
      aria-controls={derivedControls}
      tabIndex={active ? 0 : -1}
      className={cx('scalar-tab-item', className)}
      {...rest}
    >
      {children}
    </button>
  );
});

type TabsName = { label: string; 'aria-labelledby'?: string } | { label?: string; 'aria-labelledby': string };

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children?: ReactNode;
} & TabsName;

/**
 * Tabs — switches the view below between sibling sections of the same object.
 *
 * Use tabs only for peer views of one thing — a company's Overview, Cap table,
 * Waterfall. Not for steps in a process; that is Stepper. Not to page through
 * records; that is Pagination.
 *
 * If the set does not fit, the information architecture is wrong — nest it
 * rather than scrolling the bar.
 *
 * Keyboard (automatic activation): Left/Right move focus *and* select the tab
 * (the focused tab is clicked), Home/End jump to the first/last, Tab leaves the
 * set. A name (`label` or `aria-labelledby`) is required.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { children, label, className, onKeyDown, ...rest },
  ref,
) {
  const ownId = useId();
  const base = useContext(TabsContext) ?? ownId;
  const roving = useRovingFocus({
    orientation: 'horizontal',
    itemSelector: '[role="tab"]',
    // Automatic activation: selection follows focus.
    onFocusItem: (el) => el.click(),
  });
  return (
    <TabsContext.Provider value={base}>
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- APG: the tablist is not a tab stop; its tab children are focusable */}
      <div
        ref={ref}
        aria-label={label}
        className={cx('scalar-tabs', className)}
        {...rest}
        role="tablist"
        onKeyDown={(e) => {
          onKeyDown?.(e);
          roving.onKeyDown(e);
        }}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Matches the `value` of its `TabItem`. */
  value?: string;
  /** Explicit id of the tab that labels this panel. Overrides the id derived from `value`. */
  labelledBy?: string;
}

/**
 * Tab Panel — the content a tab controls. Render it inside `Tabs`' sibling
 * container (not inside the tablist) and set `hidden` on the inactive ones, or
 * render only the active one. It is focusable so content without a focusable
 * child can still be reached from the tab.
 */
export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, labelledBy, className, children, ...rest },
  ref,
) {
  const base = useContext(TabsContext);
  // Panels sit beside the tablist, so the shared id base exists only inside a
  // `TabsGroup`; otherwise pass `labelledBy` / `controls` explicitly.
  const id = base && value !== undefined ? panelId(base, value) : undefined;
  const lab = labelledBy ?? (base && value !== undefined ? tabId(base, value) : undefined);
  return (
    <div ref={ref} id={id} role="tabpanel" aria-labelledby={lab} tabIndex={0} className={cx('scalar-tab-panel', className)} {...rest}>
      {children}
    </div>
  );
});

/**
 * Tabs Group — shares the generated id base between `Tabs` and the `TabPanel`s
 * that sit beside it, so `value` alone wires `aria-controls` ↔ `aria-labelledby`.
 * Optional: without it, pass `controls` / `labelledBy` explicitly.
 */
export function TabsGroup({ children }: { children?: ReactNode }) {
  const base = useId();
  return <TabsContext.Provider value={base}>{children}</TabsContext.Provider>;
}
