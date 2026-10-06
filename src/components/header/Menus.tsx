import {
  createContext, forwardRef, useContext, useId, useLayoutEffect, useMemo, useRef,
  type HTMLAttributes, type KeyboardEvent, type ReactNode,
} from 'react';
import { composeRefs } from '../../utils/refs.js';
import { cx } from '../../utils/cx.js';
import { useOverlay } from '../../utils/useOverlay.js';
import { useRovingFocus } from '../../utils/useRovingFocus.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Icon } from '../icon/Icon.js';
import { ChevronRight } from '../icon/glyphs.js';
import { Divider } from '../core/Divider.js';
import { LinkOrButton, type LinkOrButtonProps } from './LinkOrButton.js';

/**
 * What a MenuPanel is, which decides the semantics of the rows inside it.
 *
 * - `navigation` — a disclosure of links/buttons (section sub-menus). No ARIA
 *   composite role: native `<nav>`, links and buttons, `aria-current` on the
 *   current row. Tab moves through the rows.
 * - `menu` — an action menu (`role="menu"` / `menuitem`) with the full APG
 *   keys: Up/Down, Home/End, type-ahead, Esc, Tab.
 * - `listbox` — a single-choice picker (`role="listbox"` / `option`) with the
 *   same keys; the current row is `aria-selected`.
 */
export type MenuPanelKind = 'navigation' | 'menu' | 'listbox';

const MenuKindContext = createContext<MenuPanelKind>('navigation');

export type SubmenuItemState = 'default' | 'pinned' | 'ai';

export interface SubmenuItemProps extends LinkOrButtonProps {
  icon?: ReactNode;
  /** Draws the trailing chevron for an item that opens a further level. */
  hasSubmenu?: boolean;
  /** Whether that further level is open (`aria-expanded`). Only meaningful with `hasSubmenu`. */
  expanded?: boolean;
  /** The item the user is on. */
  current?: boolean;
  /** `pinned` keeps a favourite at the top; `ai` marks a generative option. Announced as text too. */
  state?: SubmenuItemState;
}

/**
 * Submenu Item — one row in a dropdown menu.
 *
 * Its role follows the MenuPanel it sits in: a plain link/button in a
 * `navigation` panel (`aria-current`), `menuitem` in a `menu`, `option`
 * (`aria-selected`) in a `listbox`. Outside any panel it is a plain row.
 * The `pinned` / `ai` states are read out as well as shown.
 */
export const SubmenuItem = forwardRef<HTMLElement, SubmenuItemProps>(function SubmenuItem(
  { children, icon, hasSubmenu, expanded, current, state = 'default', disabled, className, ...rest },
  ref,
) {
  const kind = useContext(MenuKindContext);
  const role = kind === 'menu' ? 'menuitem' : kind === 'listbox' ? 'option' : undefined;
  return (
    <LinkOrButton
      ref={ref}
      role={role}
      disabled={disabled}
      aria-disabled={disabled && kind !== 'navigation' ? true : undefined}
      aria-current={kind !== 'listbox' && current ? (kind === 'navigation' ? 'page' : 'true') : undefined}
      aria-selected={kind === 'listbox' ? !!current : undefined}
      aria-haspopup={hasSubmenu ? (kind === 'menu' ? 'menu' : 'true') : undefined}
      aria-expanded={hasSubmenu ? expanded ?? false : undefined}
      data-state={state !== 'default' ? state : undefined}
      className={cx('scalar-submenu-item', className)}
      {...rest}
    >
      {icon}
      <span className="scalar-submenu-item__label">{children}</span>
      {state === 'pinned' && <VisuallyHidden>, pinned</VisuallyHidden>}
      {state === 'ai' && <VisuallyHidden>, AI</VisuallyHidden>}
      {hasSubmenu && (
        <Icon size="xs" tone="secondary">
          <ChevronRight />
        </Icon>
      )}
    </LinkOrButton>
  );
});

export interface MenuPanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Accessible name of the panel. Provide this or `aria-labelledby`. */
  label?: string;
  /** See {@link MenuPanelKind}. Default `navigation`. */
  kind?: MenuPanelKind;
  /**
   * `menu` / `listbox` only. Moves focus onto the current (else first) row
   * when mounted and returns it to the opener on unmount. Opt-in so a panel
   * rendered statically in a gallery never steals focus.
   */
  initialFocus?: boolean;
  /** `menu` / `listbox` only. Called on Esc, Tab and (with `initialFocus`) an outside click. */
  onClose?: () => void;
}

const ITEM_SELECTOR = '[role="menuitem"],[role="option"]';

/**
 * MenuPanel — the floating surface a dropdown's rows sit on.
 *
 * Tokens: Background/Surface, corner Semantic: Radius/S, elevation
 * Elevation/Overlay. This is the shared shell behind Company Dropdown, the
 * Captable sub-menu and the Valuations sub-menu.
 *
 * Accessibility: `kind="navigation"` (default) is a labelled `<nav>`;
 * `kind="menu"` / `"listbox"` implement the APG composite keys (one tab stop,
 * Up/Down/Home/End, type-ahead, Esc and Tab call `onClose`).
 */
export const MenuPanel = forwardRef<HTMLDivElement, MenuPanelProps>(function MenuPanel(
  { children, label, kind = 'navigation', initialFocus = false, onClose, className, onKeyDown, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef<HTMLElement | null>(null);
  const composite = kind !== 'navigation';
  const roving = useRovingFocus({ orientation: 'vertical', itemSelector: ITEM_SELECTOR, typeahead: true });

  // One tab stop: the current row (else the first enabled one).
  useLayoutEffect(() => {
    const root = innerRef.current;
    if (!composite || !root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter((el) => !el.hasAttribute('disabled'));
    const active = items.find((el) => el.getAttribute('aria-selected') === 'true' || el.getAttribute('aria-current') === 'true') ?? items[0];
    items.forEach((el) => el.setAttribute('tabindex', el === active ? '0' : '-1'));
    initialRef.current = active ?? null;
  });

  useOverlay({ open: composite && initialFocus, onClose, containerRef: innerRef, modal: false, initialFocus: initialRef });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!composite || e.defaultPrevented) return;
    if (e.key === 'Tab') { onClose?.(); return; }
    if (e.key === 'Escape') { onClose?.(); return; }
    roving.onKeyDown(e);
  };

  const panelProps = {
    ref: composeRefs(ref, innerRef),
    'aria-label': label,
    className: cx('scalar-menu-panel', className),
    onKeyDown: handleKeyDown,
    ...rest,
  };
  return (
    <MenuKindContext.Provider value={kind}>
      {kind === 'navigation' ? (
        <nav {...panelProps}>{children}</nav>
      ) : (
        <div {...panelProps} role={kind === 'menu' ? 'menu' : 'listbox'}>{children}</div>
      )}
    </MenuKindContext.Provider>
  );
});

export interface MenuGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * A group label inside a MenuPanel. Presentational on its own; inside a
 * `menu` / `listbox` panel, wrap the group's rows in {@link MenuGroup} so the
 * label names them.
 */
export const MenuGroupLabel = forwardRef<HTMLDivElement, MenuGroupLabelProps>(function MenuGroupLabel(
  { children, className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx('scalar-menu-panel__group-label', className)} {...rest}>{children}</div>;
});

export interface MenuGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** The visible group heading. Rendered as a MenuGroupLabel and used as the group's name. */
  label: ReactNode;
}

/** A labelled `role="group"` of rows inside a `menu` / `listbox` MenuPanel. */
export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(
  { label, children, className, ...rest },
  ref,
) {
  const id = useId();
  return (
    <div ref={ref} role="group" aria-labelledby={id} className={cx('scalar-menu-panel__group', className)} {...rest}>
      <MenuGroupLabel id={id}>{label}</MenuGroupLabel>
      {children}
    </div>
  );
});

export interface CompanyOption {
  id: string;
  name: ReactNode;
  pinned?: boolean;
}

export interface CompanyDropdownPanelProps extends Omit<MenuPanelProps, 'children' | 'kind' | 'onSelect' | 'label'> {
  companies: CompanyOption[];
  currentId?: string;
  onSelect?: (id: string) => void;
  /** Accessible name. Default "Companies". */
  label?: string;
}

/**
 * Company Dropdown panel — the open company switcher.
 *
 * Choosing a company is a selection, so this is a `listbox` of `option`s
 * (`aria-selected` on the current one) with Up/Down/Home/End, type-ahead, Esc
 * and Tab (via `onClose`). Pass `initialFocus` when the screen opens it so focus
 * moves in and returns to the trigger on close.
 *
 * Pinned entries are shown as their own group separated by a Stroke/Divider
 * above the full list; with none pinned this is the plain scrollable list.
 */
export const CompanyDropdownPanel = forwardRef<HTMLDivElement, CompanyDropdownPanelProps>(function CompanyDropdownPanel(
  { companies, currentId, onSelect, label = 'Companies', ...rest },
  ref,
) {
  const pinned = useMemo(() => companies.filter((c) => c.pinned), [companies]);
  const others = useMemo(() => companies.filter((c) => !c.pinned), [companies]);
  const row = (c: CompanyOption, state?: SubmenuItemState) => (
    <SubmenuItem key={c.id} state={state} current={c.id === currentId} onClick={() => onSelect?.(c.id)}>
      {c.name}
    </SubmenuItem>
  );

  return (
    <MenuPanel ref={ref} kind="listbox" label={label} {...rest}>
      {pinned.length > 0 && (
        <>
          <MenuGroup label="Pinned">{pinned.map((c) => row(c, 'pinned'))}</MenuGroup>
          <Divider decorative />
        </>
      )}
      {others.map((c) => row(c))}
    </MenuPanel>
  );
});

export interface SectionSubMenuProps extends Omit<MenuPanelProps, 'children' | 'kind' | 'onSelect' | 'label'> {
  /** The section this menu belongs to, e.g. "Cap table" or "Valuations". Also the nav's accessible name. */
  label: string;
  items: Array<{ id: string; label: ReactNode; hasSubmenu?: boolean; disabled?: boolean }>;
  currentId?: string;
  onSelect?: (id: string) => void;
}

/**
 * Section sub-menu — the navigation panel for one product section.
 *
 * Figma ships this twice, as "Captable sub-menu" and "Valuations sub-menu",
 * which share a single token contract so the two sections navigate
 * identically. One component covers both: pass the section's own items.
 *
 * It is a navigation disclosure — a labelled `<nav>` of links/buttons, not an
 * ARIA menu — so Tab walks the rows and the current one has `aria-current`.
 */
export const SectionSubMenu = forwardRef<HTMLDivElement, SectionSubMenuProps>(function SectionSubMenu(
  { label, items, currentId, onSelect, ...rest },
  ref,
) {
  return (
    <MenuPanel ref={ref} kind="navigation" label={label} {...rest}>
      <MenuGroupLabel>{label}</MenuGroupLabel>
      {items.map((item) => (
        <SubmenuItem
          key={item.id}
          hasSubmenu={item.hasSubmenu}
          disabled={item.disabled}
          current={item.id === currentId}
          onClick={() => onSelect?.(item.id)}
        >
          {item.label}
        </SubmenuItem>
      ))}
    </MenuPanel>
  );
});
