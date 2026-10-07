import {
  Children, cloneElement, forwardRef, isValidElement,
  type ButtonHTMLAttributes, type HTMLAttributes, type MouseEventHandler, type ReactElement, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { Slot } from '../../utils/Slot.js';
import type { AsChildProps } from '../../utils/types.js';
import { Icon } from '../icon/Icon.js';
import { ChevronRight, ChevronDown } from '../icon/glyphs.js';
import { Avatar } from '../avatar/Avatar.js';
import { useMenuKeys, type MenuCloseReason } from './useMenuKeys.js';

export type MenuItemTone = 'default' | 'destructive';

export interface MenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'>,
    AsChildProps {
  children?: ReactNode;
  /** Leading glyph. Pass an SDS_Main icon wrapped in `Icon`. */
  icon?: ReactNode;
  /** `destructive` is for irreversible actions (Delete, Revoke). Always last, after a divider. */
  tone?: MenuItemTone;
  /**
   * The item is the current/selected option. Exposed as `menuitemradio` + `aria-checked`
   * (pass `role="menuitemcheckbox"` for independent toggles).
   */
  selected?: boolean;
  /** Draws a trailing chevron for an item that opens a submenu or expands in place. Sets `aria-haspopup`. */
  hasSubmenu?: boolean;
  /** For `hasSubmenu` items that expand inline: whether the children are showing. */
  expanded?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  /** Renders an anchor. Ignored when `disabled`. */
  href?: string;
  className?: string;
}

/**
 * Menu Item — one action row in a Context Menu, User Menu or dropdown.
 *
 * Figma: `20 · Menus & Actions / Menu Item` (State × Tone). Hover is a CSS
 * state; Selected is `selected`; Disabled is the native attribute.
 *
 * Tokens: hover Background/Subtle · selected Background/Brand Subtle +
 * Text/Brand · destructive Text/Negative, hover Background/Negative Subtle.
 *
 * Accessibility: items are `tabindex=-1`; the parent menu (`ContextMenu`,
 * `UserMenu`, or `useMenuKeys`) owns the roving focus. Use `asChild` to render
 * a router link: `<MenuItem asChild><Link to="/x">Go</Link></MenuItem>`.
 */
export const MenuItem = forwardRef<HTMLElement, MenuItemProps>(function MenuItem(
  { children, icon, tone = 'default', selected, hasSubmenu, expanded, disabled, onClick, href, asChild, className, role, ...rest },
  ref,
) {
  const common = {
    role: role ?? (selected !== undefined ? 'menuitemradio' : 'menuitem'),
    tabIndex: -1,
    ...rest,
    onClick,
    'aria-checked': selected !== undefined ? selected : undefined,
    'aria-haspopup': hasSubmenu ? ('menu' as const) : undefined,
    'aria-expanded': hasSubmenu && expanded !== undefined ? expanded : undefined,
    className: cx('scalar-menu-item', tone === 'destructive' && 'scalar-menu-item--destructive', className),
  };
  const inner = (label: ReactNode) => (
    <>
      {icon}
      <span className="scalar-menu-item__label">{label}</span>
      {hasSubmenu && (
        <Icon size="s" tone="inherit">
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </Icon>
      )}
    </>
  );

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;
    const el = child as ReactElement<{ children?: ReactNode }>;
    return (
      <Slot ref={ref} {...common} aria-disabled={disabled || undefined}>
        {cloneElement(el, undefined, inner(el.props.children))}
      </Slot>
    );
  }

  if (href && !disabled) {
    return (
      <a ref={composeRefs<HTMLElement>(ref) as never} href={href} {...(common as HTMLAttributes<HTMLAnchorElement>)}>
        {inner(children)}
      </a>
    );
  }
  return (
    <button ref={composeRefs<HTMLElement>(ref) as never} type="button" disabled={disabled} {...(common as HTMLAttributes<HTMLButtonElement>)}>
      {inner(children)}
    </button>
  );
});

export interface MenuDividerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Horizontal rule between Menu Item groups. Destructive items sit after one. */
export const MenuDivider = forwardRef<HTMLDivElement, MenuDividerProps>(function MenuDivider({ className, ...rest }, ref) {
  return <div ref={ref} role="separator" className={cx('scalar-menu-divider', className)} {...rest} />;
});

/** Behaviour props shared by every menu surface. */
export interface MenuBehaviourProps {
  /**
   * Called when the user presses Esc or Tab inside the menu. The menu does not own open
   * state: close it here and return focus to the trigger.
   */
  onClose?: (reason: MenuCloseReason) => void;
  /** Focus the first item on mount. Off by default so statically rendered menus (galleries) never steal focus. */
  autoFocus?: boolean;
}

export interface ContextMenuProps extends HTMLAttributes<HTMLDivElement>, MenuBehaviourProps {
  children?: ReactNode;
  /** Optional overline heading above the items. */
  heading?: ReactNode;
  /** Accessible name — what the menu acts on ("Firm summary actions"). */
  label: string;
  className?: string;
}

/**
 * Context Menu — the floating menu opened by a kebab (⋮) or meatball (•••)
 * trigger: page actions, saved-view actions, per-row and per-column actions.
 *
 * Surface: Background/Surface Raised + Elevation/Overlay. Compose from
 * `MenuItem` and `MenuDivider`. Positioning and open state belong to the
 * trigger; this is the surface only.
 *
 * Keyboard: Up/Down, Home/End, type-ahead, Right/Left for inline submenus,
 * Esc and Tab call `onClose`. Pass `autoFocus` when the menu is mounted on open.
 */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { children, heading, label, className, onClose, autoFocus, onKeyDown, ...rest },
  ref,
) {
  const menu = useMenuKeys({ onClose, autoFocus, forwardedRef: ref as React.Ref<HTMLElement> });
  return (
    <div
      {...rest}
      ref={menu.ref as React.Ref<HTMLDivElement>}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      className={cx('scalar-context-menu', className)}
      onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented) menu.onKeyDown(e); }}
    >
      {heading && <div role="presentation" className="scalar-context-menu__heading">{heading}</div>}
      {children}
    </div>
  );
});

export interface UserMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>, MenuBehaviourProps {
  /** Firm or user shown in the header. */
  name: ReactNode;
  /** Secondary line — usually the signed-in email. */
  detail?: ReactNode;
  avatarSrc?: string;
  initials?: string;
  /** Describes the avatar picture for assistive tech. Defaults to empty (the name is shown beside it). */
  avatarAlt?: string;
  /** Accessible name of the menu. Default "Account". */
  label?: string;
  /** MenuItem / MenuDivider children. End with Sign out after a divider. */
  children?: ReactNode;
  className?: string;
}

/**
 * User Menu — account menu opened from the Avatar at the far right of the
 * Primary Menu. Header, then account and firm administration links, then
 * Sign out after a divider. Same keyboard model as `ContextMenu`.
 */
export const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(function UserMenu(
  { name, detail, avatarSrc, initials, avatarAlt, label = 'Account', children, className, onClose, autoFocus, onKeyDown, ...rest },
  ref,
) {
  const menu = useMenuKeys({ onClose, autoFocus, forwardedRef: ref as React.Ref<HTMLElement> });
  return (
    <div
      {...rest}
      ref={menu.ref as React.Ref<HTMLDivElement>}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      className={cx('scalar-context-menu', 'scalar-user-menu', className)}
      onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented) menu.onKeyDown(e); }}
    >
      <div role="presentation" className="scalar-user-menu__header">
        <Avatar size="s" src={avatarSrc} initials={initials} alt={avatarAlt ?? ''} aria-hidden />
        <span className="scalar-user-menu__text">
          <span className="scalar-user-menu__name">{name}</span>
          {detail && <span className="scalar-user-menu__detail">{detail}</span>}
        </span>
      </div>
      <MenuDivider />
      {children}
    </div>
  );
});

export interface MenuSubItemsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Accessible name of the group — usually the parent item's label ("Firm settings"). */
  label?: string;
  className?: string;
}

/** Children of an inline-expanding Menu Item (Firm settings → Firm profile, SSO…). Place directly after the parent item. */
export const MenuSubItems = forwardRef<HTMLDivElement, MenuSubItemsProps>(function MenuSubItems(
  { children, label, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="group" aria-label={label} className={cx('scalar-menu-subitems', className)} {...rest}>
      {children}
    </div>
  );
});
