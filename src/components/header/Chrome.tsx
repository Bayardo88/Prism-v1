import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

/* ---------------------------------------------------------------------------
 * Tier 1 — Primary Menu
 * ------------------------------------------------------------------------ */

export interface MainMenuItemProps {
  children?: ReactNode;
  icon?: ReactNode;
  /** The section the user is in. */
  current?: boolean;
  /** True while this item's dropdown is open. */
  expanded?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** Main-Menu-horizontal-item — one item in the primary navigation. */
export function MainMenuItem({ children, icon, current, expanded, href, onClick, className }: MainMenuItemProps) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      {...(href ? { href } : { type: 'button' as const })}
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
      aria-expanded={expanded}
      className={cx('scalar-main-menu-item', className)}
    >
      {icon}
      {children}
    </Tag>
  );
}

export interface PrimaryMenuProps {
  /** The Scalar mark. */
  logo?: ReactNode;
  /** MainMenuItem instances. */
  children?: ReactNode;
  /** Company switcher, search, notifications, avatar. */
  end?: ReactNode;
  className?: string;
}

/**
 * Primary Menu — the top-level application bar.
 *
 * Composed from MainMenuItem, CompanyDropdown, SearchBar, Notification and
 * Avatar — change those, not this.
 *
 * It spans the viewport, so it is one of the two components that legitimately
 * use a full-bleed width. Set the viewport type mode on `ScalarProvider` to
 * move it between breakpoints rather than hand-resizing type.
 */
export function PrimaryMenu({ logo, children, end, className }: PrimaryMenuProps) {
  return (
    <header className={cx('scalar-primary-menu', className)}>
      {logo}
      <nav className="scalar-primary-menu__nav" aria-label="Primary">
        {children}
      </nav>
      {end && <div className="scalar-primary-menu__end">{end}</div>}
    </header>
  );
}

/* ---------------------------------------------------------------------------
 * Tier 2 — Secondary Menu
 * ------------------------------------------------------------------------ */

export interface SecondaryMenuItemProps {
  children?: ReactNode;
  current?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** One item in the second navigation tier. */
export function SecondaryMenuItem({ children, current, href, onClick, className }: SecondaryMenuItemProps) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      {...(href ? { href } : { type: 'button' as const })}
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
      className={cx('scalar-secondary-menu-item', className)}
    >
      {children}
    </Tag>
  );
}

/**
 * Secondary Menu — the second navigation tier, scoped to the selected company.
 *
 * Sits directly under Primary Menu and changes when the company changes.
 */
export function SecondaryMenu({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <nav className={cx('scalar-secondary-menu', className)} aria-label="Secondary">
      {children}
    </nav>
  );
}

/* ---------------------------------------------------------------------------
 * Tier 3 — Tertiary Menu
 * ------------------------------------------------------------------------ */

export interface TertiaryMenuItemProps {
  children?: ReactNode;
  icon?: ReactNode;
  current?: boolean;
  /** Combo tags shown beside the label. */
  tags?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** Tertiary Menu Item — one item in the third navigation tier. */
export function TertiaryMenuItem({ children, icon, current, tags, href, onClick, className }: TertiaryMenuItemProps) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      {...(href ? { href } : { type: 'button' as const })}
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
      className={cx('scalar-tertiary-menu-item', className)}
    >
      {icon}
      {children}
      {tags}
    </Tag>
  );
}

/**
 * Tertiary Menu — the third navigation tier, scoped to the selected section.
 *
 * Three tiers is the limit. A fourth level belongs in the page body, not the
 * chrome.
 */
export function TertiaryMenu({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <nav className={cx('scalar-tertiary-menu', className)} aria-label="Tertiary">
      {children}
    </nav>
  );
}

/* ---------------------------------------------------------------------------
 * Company info bar
 * ------------------------------------------------------------------------ */

export interface CompanyInfoProps {
  /** An Avatar instance. */
  avatar?: ReactNode;
  name: ReactNode;
  /** Ticker, sector and other metadata. */
  meta?: ReactNode;
  /** Badge, Chip or status pill beside the name. */
  status?: ReactNode;
  /** Key figures — InformationLabel instances. */
  end?: ReactNode;
  className?: string;
}

/**
 * Company info — the company identity block under the primary bar.
 *
 * Composed from Avatar, Badge, InformationLabel and ComboTag.
 */
export function CompanyInfo({ avatar, name, meta, status, end, className }: CompanyInfoProps) {
  return (
    <div className={cx('scalar-company-info', className)}>
      {avatar}
      <span className="scalar-company-info__name">{name}</span>
      {meta && <span className="scalar-company-info__meta">{meta}</span>}
      {status}
      {end && <div className="scalar-company-info__end">{end}</div>}
    </div>
  );
}
