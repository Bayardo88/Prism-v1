import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronRight } from '../icon/glyphs.js';
import { Divider } from '../core/Divider.js';

export type SubmenuItemState = 'default' | 'pinned' | 'ai';

export interface SubmenuItemProps {
  children?: ReactNode;
  icon?: ReactNode;
  /** Draws the trailing chevron for an item that opens a further level. */
  hasSubmenu?: boolean;
  /** The item the user is on. */
  current?: boolean;
  /** `pinned` keeps a favourite at the top; `ai` marks a generative option. */
  state?: SubmenuItemState;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

/**
 * Submenu Item — one row in a dropdown menu.
 *
 * Accessibility: keyboard navigable, Escape closes, focus returns to the
 * trigger.
 */
export function SubmenuItem({
  children, icon, hasSubmenu, current, state = 'default', disabled, onClick, href, className,
}: SubmenuItemProps) {
  const Tag = href && !disabled ? 'a' : 'button';
  return (
    <Tag
      {...(href && !disabled ? { href } : { type: 'button' as const, disabled })}
      role="menuitem"
      onClick={onClick}
      aria-current={current || undefined}
      data-state={state !== 'default' ? state : undefined}
      className={cx('scalar-submenu-item', className)}
    >
      {icon}
      <span className="scalar-submenu-item__label">{children}</span>
      {hasSubmenu && (
        <Icon size="xs" tone="secondary">
          <ChevronRight />
        </Icon>
      )}
    </Tag>
  );
}

export interface MenuPanelProps {
  children?: ReactNode;
  label?: string;
  className?: string;
}

/**
 * MenuPanel — the floating surface a dropdown's rows sit on.
 *
 * Tokens: Background/Surface, corner Semantic: Radius/S, elevation
 * Elevation/Overlay. This is the shared shell behind Company Dropdown, the
 * Captable sub-menu and the Valuations sub-menu, all of which use one contract
 * so the sections navigate identically.
 */
export function MenuPanel({ children, label, className }: MenuPanelProps) {
  return (
    <div role="menu" aria-label={label} className={cx('scalar-menu-panel', className)}>
      {children}
    </div>
  );
}

/** A group label inside a MenuPanel. */
export function MenuGroupLabel({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cx('scalar-menu-panel__group-label', className)}>{children}</div>;
}

export interface CompanyOption {
  id: string;
  name: ReactNode;
  pinned?: boolean;
}

export interface CompanyDropdownPanelProps {
  companies: CompanyOption[];
  currentId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Company Dropdown panel — the open company switcher.
 *
 * Pinned entries are shown as their own group separated by a Stroke/Divider
 * above the full list; with none pinned this is the plain scrollable list.
 */
export function CompanyDropdownPanel({ companies, currentId, onSelect, className }: CompanyDropdownPanelProps) {
  const pinned = companies.filter((c) => c.pinned);
  const rest = companies.filter((c) => !c.pinned);

  return (
    <MenuPanel label="Companies" className={className}>
      {pinned.length > 0 && (
        <>
          <MenuGroupLabel>Pinned</MenuGroupLabel>
          {pinned.map((c) => (
            <SubmenuItem
              key={c.id}
              state="pinned"
              current={c.id === currentId}
              onClick={() => onSelect?.(c.id)}
            >
              {c.name}
            </SubmenuItem>
          ))}
          <Divider />
        </>
      )}
      {rest.map((c) => (
        <SubmenuItem key={c.id} current={c.id === currentId} onClick={() => onSelect?.(c.id)}>
          {c.name}
        </SubmenuItem>
      ))}
    </MenuPanel>
  );
}

export interface SectionSubMenuProps {
  /** The section this menu belongs to, e.g. "Cap table" or "Valuations". */
  label: string;
  items: Array<{ id: string; label: ReactNode; hasSubmenu?: boolean; disabled?: boolean }>;
  currentId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Section sub-menu — the navigation panel for one product section.
 *
 * Figma ships this twice, as "Captable sub-menu" and "Valuations sub-menu",
 * which share a single token contract so the two sections navigate
 * identically. One component covers both: pass the section's own items.
 */
export function SectionSubMenu({ label, items, currentId, onSelect, className }: SectionSubMenuProps) {
  return (
    <MenuPanel label={label} className={className}>
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
}
