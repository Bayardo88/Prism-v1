import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronRight, ChevronDown } from '../icon/glyphs.js';
import { Avatar } from '../avatar/Avatar.js';

export type MenuItemTone = 'default' | 'destructive';

export interface MenuItemProps {
  children?: ReactNode;
  /** Leading glyph. Pass an SDS_Main icon wrapped in `Icon`. */
  icon?: ReactNode;
  /** `destructive` is for irreversible actions (Delete, Revoke). Always last, after a divider. */
  tone?: MenuItemTone;
  /** The item is the current/selected option. */
  selected?: boolean;
  /** Draws a trailing chevron for an item that opens a submenu or expands in place. */
  hasSubmenu?: boolean;
  /** For `hasSubmenu` items that expand inline: whether the children are showing. */
  expanded?: boolean;
  disabled?: boolean;
  onClick?: () => void;
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
 */
export function MenuItem({
  children, icon, tone = 'default', selected, hasSubmenu, expanded, disabled, onClick, href, className,
}: MenuItemProps) {
  const Tag = href && !disabled ? 'a' : 'button';
  return (
    <Tag
      {...(href && !disabled ? { href } : { type: 'button' as const, disabled })}
      role="menuitem"
      onClick={onClick}
      aria-current={selected || undefined}
      aria-expanded={hasSubmenu && expanded !== undefined ? expanded : undefined}
      className={cx('scalar-menu-item', tone === 'destructive' && 'scalar-menu-item--destructive', className)}
    >
      {icon}
      <span className="scalar-menu-item__label">{children}</span>
      {hasSubmenu && (
        <Icon size="s" tone="inherit">
          {expanded ? <ChevronDown /> : <ChevronRight />}
        </Icon>
      )}
    </Tag>
  );
}

/** Horizontal rule between Menu Item groups. Destructive items sit after one. */
export function MenuDivider({ className }: { className?: string }) {
  return <div role="separator" className={cx('scalar-menu-divider', className)} />;
}

export interface ContextMenuProps {
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
 */
export function ContextMenu({ children, heading, label, className }: ContextMenuProps) {
  return (
    <div role="menu" aria-label={label} className={cx('scalar-context-menu', className)}>
      {heading && <div className="scalar-context-menu__heading">{heading}</div>}
      {children}
    </div>
  );
}

export interface UserMenuProps {
  /** Firm or user shown in the header. */
  name: ReactNode;
  /** Secondary line — usually the signed-in email. */
  detail?: ReactNode;
  avatarSrc?: string;
  initials?: string;
  /** MenuItem / MenuDivider children. End with Sign out after a divider. */
  children?: ReactNode;
  className?: string;
}

/**
 * User Menu — account menu opened from the Avatar at the far right of the
 * Primary Menu. Header, then account and firm administration links, then
 * Sign out after a divider.
 */
export function UserMenu({ name, detail, avatarSrc, initials, children, className }: UserMenuProps) {
  return (
    <div role="menu" aria-label="Account" className={cx('scalar-context-menu', 'scalar-user-menu', className)}>
      <div className="scalar-user-menu__header">
        <Avatar size="s" src={avatarSrc} initials={initials} />
        <span className="scalar-user-menu__text">
          <span className="scalar-user-menu__name">{name}</span>
          {detail && <span className="scalar-user-menu__detail">{detail}</span>}
        </span>
      </div>
      <MenuDivider />
      {children}
    </div>
  );
}

/** Children of an inline-expanding Menu Item (Firm settings → Firm profile, SSO…). */
export function MenuSubItems({ children, className }: { children?: ReactNode; className?: string }) {
  return <div role="group" className={cx('scalar-menu-subitems', className)}>{children}</div>;
}
