import {
  createContext, forwardRef, useCallback, useContext, useEffect, useId, useMemo, useRef,
  type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode, type Ref,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { useOverlay } from '../../utils/useOverlay.js';
import { useRovingFocus } from '../../utils/useRovingFocus.js';
import { Icon } from '../icon/Icon.js';
import { ChevronDown, Close, MoreVertical, Plus } from '../icon/glyphs.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { MENU_ITEM_SELECTOR, normalizeTabStop, useMenuKeys, type MenuCloseReason } from './useMenuKeys.js';

/* ---------------------------------------------------------------------------
 * Split Button
 * ------------------------------------------------------------------------ */

export type SplitButtonVariant = 'primary' | 'secondary';
export type SplitButtonTone = 'main' | 'positive';

export interface SplitButtonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick' | 'children'> {
  children: ReactNode;
  variant?: SplitButtonVariant;
  /** `positive` is the green Save used on edit screens. */
  tone?: SplitButtonTone;
  leadingIcon?: ReactNode;
  /** The main action. */
  onClick?: () => void;
  /**
   * Fires when the caret is activated, and when Esc / outside click / Tab ask to close an open menu
   * (so a consumer that toggles its own state keeps working). Prefer `onOpenChange`.
   */
  onMenuToggle?: () => void;
  /** Reports the next open state: caret click, ArrowDown on the caret, Esc, outside click, Tab. */
  onOpenChange?: (open: boolean) => void;
  /** Whether that menu is showing. Flips the caret. Omit to let the component own it. */
  menuOpen?: boolean;
  /** Initial open state when uncontrolled. */
  defaultMenuOpen?: boolean;
  /** Accessible name of the caret half ("More save options"). */
  menuLabel: string;
  disabled?: boolean;
  /** Render the Context Menu here; it is positioned under the caret. */
  menu?: ReactNode;
  /** Where the menu opens. `top` for a button at the foot of a page or drawer. Default `bottom`. */
  menuPlacement?: 'bottom' | 'top';
  className?: string;
}

/**
 * Split Button — primary action plus a caret that opens alternatives
 * ("+ Add projection year ▾" → Add historical year; "Report ▾" → Validate,
 * Preview, Finalize, Send). The two halves are separate hit targets.
 *
 * Figma: `Split Button` (Style × Tone × State, 16 variants). Hover and Open
 * map to CSS and `menuOpen`.
 *
 * Accessibility: opening moves focus to the first menu item; Esc, outside
 * click and Tab close it and focus returns to the caret. ArrowDown on the
 * caret opens the menu. The caret is `aria-controls` the menu popover.
 */
export const SplitButton = forwardRef<HTMLSpanElement, SplitButtonProps>(function SplitButton(
  {
    children, variant = 'primary', tone = 'main', leadingIcon, onClick, onMenuToggle, onOpenChange, menuOpen, defaultMenuOpen = false,
    menuLabel, disabled, menu, menuPlacement = 'bottom', className, ...rest
  },
  ref,
) {
  const popoverId = useId();
  const caretRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useControllableState<boolean>(menuOpen, defaultMenuOpen, onOpenChange);
  const shown = open && !!menu;

  const change = useCallback((next: boolean) => {
    setOpen(next);
    onMenuToggle?.();
  }, [setOpen, onMenuToggle]);

  // Resolved lazily at open time so the first enabled item receives focus.
  const initialFocus = useMemo(
    () => ({ get current() { return popoverRef.current?.querySelector<HTMLElement>(`${MENU_ITEM_SELECTOR}:not(:disabled)`) ?? popoverRef.current; } }),
    [],
  );
  useOverlay({
    open: shown, modal: false, containerRef: popoverRef, triggerRef: caretRef, initialFocus,
    onClose: () => change(false),
  });

  const onPopoverKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Tab') {
      // Hand focus back to the caret so Tab continues from the button, then close.
      caretRef.current?.focus();
      change(false);
    }
  };
  const onCaretKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' && !shown && menu) { e.preventDefault(); change(true); }
  };

  return (
    <span ref={ref} className={cx('scalar-split-button', `scalar-split-button--${variant}`, `scalar-split-button--${tone}`, className)} {...rest}>
      <button type="button" className="scalar-split-button__action" onClick={onClick} disabled={disabled}>
        {leadingIcon}
        {children}
      </button>
      <span className="scalar-split-button__separator" aria-hidden />
      <button
        ref={caretRef}
        type="button"
        className="scalar-split-button__menu"
        onClick={() => change(!open)}
        onKeyDown={onCaretKeyDown}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={shown ? popoverId : undefined}
        aria-label={menuLabel}
      >
        <Icon size="s" tone="inherit" className={cx(open && 'scalar-rotate-180')}>
          <ChevronDown />
        </Icon>
      </button>
      {shown && (
        // Key handling here only forwards Tab from the menu items; the menu element owns arrow/Esc keys.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- wrapper delegates Tab for the menu it contains
        <span
          ref={popoverRef}
          id={popoverId}
          onKeyDown={onPopoverKeyDown}
          className={cx('scalar-split-button__popover', menuPlacement === 'top' && 'scalar-split-button__popover--top')}
        >
          {menu}
        </span>
      )}
    </span>
  );
});

/* ---------------------------------------------------------------------------
 * FAB + Speed Dial
 * ------------------------------------------------------------------------ */

const SpeedDialContext = createContext<string | undefined>(undefined);

export interface FabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'> {
  children: ReactNode;
  icon?: ReactNode;
  /** Shows a caret; the FAB then opens a Speed Dial. */
  hasMenu?: boolean;
  /** Speed Dial is showing — the icon becomes a close glyph. Omit to let the FAB own it. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Reports the next open state when `hasMenu` and the FAB is clicked. */
  onOpenChange?: (open: boolean) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Fixes the button to the bottom-right of the viewport. Default true. */
  fixed?: boolean;
  className?: string;
}

/**
 * FAB — the page's single floating "add" action, bottom-right, above the
 * Workspace Drawer. Never destructive. With `hasMenu` it opens a Speed Dial.
 * Inside a `SpeedDial` trigger it is `aria-controls` the dial's menu automatically.
 */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { children, icon, hasMenu, open: openProp, defaultOpen = false, onOpenChange, onClick, disabled, fixed = true, className, ...rest },
  ref,
) {
  const dialId = useContext(SpeedDialContext);
  const [open, setOpen] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange);
  return (
    <button
      type="button"
      aria-controls={hasMenu && open ? dialId : undefined}
      {...rest}
      ref={ref}
      onClick={(e) => { onClick?.(e); if (hasMenu) setOpen(!open); }}
      disabled={disabled}
      aria-haspopup={hasMenu ? 'menu' : undefined}
      aria-expanded={hasMenu ? open : undefined}
      className={cx('scalar-fab', fixed && 'scalar-fab--fixed', open && 'scalar-fab--open', className)}
    >
      <Icon size="s" tone="inherit">{open ? <Close /> : (icon ?? <Plus />)}</Icon>
      {children}
      {hasMenu && (
        <Icon size="s" tone="inherit" className={cx(open && 'scalar-rotate-180')}>
          <ChevronDown />
        </Icon>
      )}
    </button>
  );
});

export interface SpeedDialItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'> {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
}

/** One option in a Speed Dial stack. Disabled when the option is not available yet. Focus is managed by the parent `SpeedDial`. */
export const SpeedDialItem = forwardRef<HTMLButtonElement, SpeedDialItemProps>(function SpeedDialItem(
  { children, onClick, disabled, className, ...rest },
  ref,
) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      {...rest}
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={cx('scalar-speed-dial-item', className)}
    >
      {children}
    </button>
  );
});

export interface SpeedDialProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** SpeedDialItem children, nearest-first = most used. */
  children: ReactNode;
  /** The FAB that opened it (rendered `open`). */
  trigger: ReactNode;
  label: string;
  /** Esc / Tab inside the dial. Close it here; focus has already been moved back to the FAB on Esc. */
  onClose?: (reason: MenuCloseReason) => void;
  /** Focus the first item on mount. Off by default so statically rendered dials never steal focus. */
  autoFocus?: boolean;
  className?: string;
}

/**
 * Speed Dial — the FAB expanded into its actions. Render over a `Scrim`;
 * clicking the scrim or the FAB closes it.
 *
 * Keyboard (menu pattern): Up/Down, Home/End, type-ahead; Esc closes and
 * returns focus to the FAB; Tab closes.
 */
export const SpeedDial = forwardRef<HTMLDivElement, SpeedDialProps>(function SpeedDial(
  { children, trigger, label, onClose, autoFocus, className, ...rest },
  ref,
) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menu = useMenuKeys({
    autoFocus,
    onClose: (reason) => {
      if (reason === 'escape') rootRef.current?.querySelector<HTMLElement>('.scalar-fab')?.focus();
      onClose?.(reason);
    },
  });
  return (
    <SpeedDialContext.Provider value={id}>
      <div ref={composeRefs(rootRef, ref)} className={cx('scalar-speed-dial', className)} {...rest}>
        <div id={id} ref={menu.ref as Ref<HTMLDivElement>} onKeyDown={menu.onKeyDown} role="menu" tabIndex={-1} aria-label={label} className="scalar-speed-dial__items">
          {children}
        </div>
        {trigger}
      </div>
    </SpeedDialContext.Provider>
  );
});

/* ---------------------------------------------------------------------------
 * Segmented Control
 * ------------------------------------------------------------------------ */

export interface SegmentOption<V extends string = string> {
  value: V;
  /** Text label, or the accessible name when `icon` is given. */
  label: string;
  /** Icon-only segment (list / calendar). `label` becomes its accessible name. */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<V extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: readonly SegmentOption<V>[];
  /** Selected value. Omit to let the control own it (see `defaultValue`). */
  value?: V;
  /** Initial value when uncontrolled. Defaults to the first enabled option. */
  defaultValue?: V;
  onChange?: (value: V) => void;
  /** Accessible name of the group ("View"). */
  label: string;
  className?: string;
}

/**
 * Segmented Control — mutually exclusive view toggle: Chart | Table,
 * Client | Internal, a date snapshot | Latest, and the icon-only list |
 * calendar switch. Exactly one segment is selected.
 *
 * Generalises `ToolSwitch`, which stays for the Valuations | Workboard switch.
 * Radiogroup pattern: one tab stop (the selected segment, else the first
 * enabled); arrow keys move focus and selection; Home/End jump.
 */
function SegmentedControlImpl<V extends string = string>(
  { options, value, defaultValue, onChange, label, className, ...rest }: SegmentedControlProps<V>,
  ref: Ref<HTMLDivElement>,
) {
  const firstEnabled = options.find((o) => !o.disabled)?.value;
  const [current, setCurrent] = useControllableState<V | undefined>(value, defaultValue ?? firstEnabled, onChange as ((v: V | undefined) => void) | undefined);
  const selectedEnabled = options.some((o) => o.value === current && !o.disabled);
  const tabStop = selectedEnabled ? current : firstEnabled;
  const roving = useRovingFocus({
    orientation: 'both',
    itemSelector: '[role="radio"]',
    onFocusItem: (el) => { const o = options.find((x) => x.value === el.dataset.value); if (o) setCurrent(o.value); },
  });
  return (
    <div {...rest} ref={ref} role="radiogroup" tabIndex={-1} aria-label={label} onKeyDown={(e) => { rest.onKeyDown?.(e); roving.onKeyDown(e); }} className={cx('scalar-segmented', className)}>
      {options.map((o) => {
        const on = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            data-value={o.value}
            aria-checked={on}
            aria-label={o.icon ? o.label : undefined}
            tabIndex={o.value === tabStop ? 0 : -1}
            disabled={o.disabled}
            onClick={() => setCurrent(o.value)}
            className={cx('scalar-segment', o.icon != null && 'scalar-segment--icon')}
          >
            {o.icon ?? o.label}
          </button>
        );
      })}
    </div>
  );
}
export const SegmentedControl = forwardRef(SegmentedControlImpl) as <V extends string = string>(
  props: SegmentedControlProps<V> & { ref?: Ref<HTMLDivElement> },
) => ReturnType<typeof SegmentedControlImpl>;
(SegmentedControl as { displayName?: string }).displayName = 'SegmentedControl';

/* ---------------------------------------------------------------------------
 * View Tab + View Tab Bar
 * ------------------------------------------------------------------------ */

export interface ViewTabProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onSelect'> {
  children: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  /** Shows the kebab; open a Context Menu (Rename, Clone, Delete) from it. Also bound to Shift+F10 / the Menu key on the tab. */
  onMenu?: () => void;
  /** Shows a close button for a temporary tab. Also bound to Delete on the tab. */
  onClose?: () => void;
  /** Name used in the kebab / close labels ("Firm summary options"). Defaults to the text of `children`. */
  label?: string;
  /** `id` of the tab button, so a panel can reference it with `aria-labelledby`. */
  tabId?: string;
  /** `id` of the panel this tab controls (`aria-controls`). */
  panelId?: string;
  className?: string;
}

/**
 * View Tab — a saved view, scenario or note tab (Firm summary ⋮, Current,
 * Note 1 ⋮, Backsolve ⋮, a closable company filter).
 *
 * Structure: the kebab and close buttons are siblings of the tab inside a
 * plain wrapper (so the tablist only ever owns tabs), and are out of the tab
 * order (`tabindex=-1`); the `ViewTabBar` is the single tab stop. From the tab, Shift+F10 / the Menu key
 * triggers `onMenu` and Delete triggers `onClose`.
 */
export const ViewTab = forwardRef<HTMLSpanElement, ViewTabProps>(function ViewTab(
  { children, selected, onSelect, onMenu, onClose, label, tabId, panelId, className, ...rest },
  ref,
) {
  const name = label ?? (typeof children === 'string' ? children : 'view');
  const autoId = useId();
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (onMenu && ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu')) { e.preventDefault(); onMenu(); }
    else if (onClose && e.key === 'Delete') { e.preventDefault(); onClose(); }
  };
  return (
    <span ref={ref} className={cx('scalar-view-tab', selected && 'scalar-view-tab--selected', className)} {...rest}>
      <button
        type="button"
        role="tab"
        id={tabId ?? autoId}
        aria-selected={!!selected}
        aria-controls={panelId}
        tabIndex={selected ? 0 : -1}
        className="scalar-view-tab__label"
        onClick={onSelect}
        onKeyDown={onKeyDown}
      >
        {children}
      </button>
      {onMenu && (
        <button type="button" tabIndex={-1} className="scalar-view-tab__action" aria-label={`${name} options`} aria-haspopup="menu" onClick={onMenu}>
          <Icon size="s" tone="inherit"><MoreVertical /></Icon>
        </button>
      )}
      {onClose && (
        <button type="button" tabIndex={-1} className="scalar-view-tab__action" aria-label={`Close ${name}`} onClick={onClose}>
          <Icon size="s" tone="inherit"><Close /></Icon>
        </button>
      )}
    </span>
  );
});

export interface ViewTabBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  /** Creates a new view. Omit to hide the add button. */
  onAdd?: () => void;
  addLabel?: string;
  /** Accessible name of the tab list. */
  label: string;
  className?: string;
}

/**
 * Row of View Tabs with a trailing "+" that creates a new view.
 * The tablist element is a zero-size owner (`aria-owns`) of the tab buttons.
 * Tabs pattern: one tab stop (the selected tab), Left/Right and Home/End move
 * focus between tabs, Enter / Space select (manual activation).
 */
export const ViewTabBar = forwardRef<HTMLDivElement, ViewTabBarProps>(function ViewTabBar(
  { children, onAdd, addLabel = 'Add view', label, className, onKeyDown, ...rest },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const roving = useRovingFocus({ orientation: 'horizontal', itemSelector: '[role="tab"]' });
  // Exactly one tab stop (the selected tab, else the first), and the tablist owns the tabs by id so
  // each tab's kebab / close buttons can sit beside it without becoming children of the tablist.
  useEffect(() => {
    if (!rootRef.current) return;
    const tabs = Array.from(rootRef.current.querySelectorAll<HTMLElement>('[role="tab"]'));
    normalizeTabStop(tabs.filter((el) => !(el as HTMLButtonElement).disabled), (el) => el.getAttribute('aria-selected') === 'true');
    // Set on the node (not state) so it tracks children without a render loop.
    tablistRef.current?.setAttribute('aria-owns', tabs.map((el) => el.id).join(' '));
  });
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- delegates arrow keys for the tabs it contains; the tablist role lives on the owned element
    <div
      ref={composeRefs(rootRef, ref)}
      className={cx('scalar-view-tab-bar', className)}
      onKeyDown={(e) => { onKeyDown?.(e); roving.onKeyDown(e); }}
      {...rest}
    >
      <div ref={tablistRef} role="tablist" aria-label={label} className="scalar-view-tab-bar__tablist" />
      <div className="scalar-view-tab-bar__tabs">{children}</div>
      {onAdd && (
        <ButtonIcon variant="tertiary" size="s" label={addLabel} onClick={onAdd} icon={<Icon size="s" tone="inherit"><Plus /></Icon>} />
      )}
    </div>
  );
});
