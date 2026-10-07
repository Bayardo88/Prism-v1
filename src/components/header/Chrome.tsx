import { forwardRef, type HTMLAttributes, type MouseEventHandler, type ReactNode, type Ref } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Add, MoreVert } from '../icon/material.js';
import { LinkOrButton, type LinkOrButtonProps } from './LinkOrButton.js';

/* ---------------------------------------------------------------------------
 * Tier 1 — Primary Menu
 * ------------------------------------------------------------------------ */

export interface MainMenuItemProps extends Omit<LinkOrButtonProps, 'children'> {
  children?: ReactNode;
  icon?: ReactNode;
  /** The section the user is in (`aria-current="page"`). */
  current?: boolean;
  /**
   * Set only for an item that opens a dropdown: it is then a disclosure button
   * and carries `aria-expanded`. Leave undefined for a plain link. Pass
   * `aria-controls` to name the panel.
   */
  expanded?: boolean;
}

/** Main-Menu-horizontal-item — one item in the primary navigation. */
export const MainMenuItem = forwardRef<HTMLElement, MainMenuItemProps>(function MainMenuItem(
  { children, icon, current, expanded, className, asChild, ...rest },
  ref,
) {
  return (
    <LinkOrButton
      ref={ref}
      asChild={asChild}
      aria-current={current ? 'page' : undefined}
      aria-expanded={expanded}
      className={cx('scalar-main-menu-item', className)}
      {...rest}
    >
      {asChild ? children : <>{icon}{children}</>}
    </LinkOrButton>
  );
});

export interface PrimaryMenuProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The Scalar mark. */
  logo?: ReactNode;
  /** MainMenuItem instances. */
  children?: ReactNode;
  /** Company switcher, search, notifications, avatar. */
  end?: ReactNode;
  /** Accessible name of the primary `<nav>` landmark. Default "Primary". */
  navLabel?: string;
  /**
   * Root element. `header` (default) is the page banner landmark; pass `div`
   * when the page already has a banner (e.g. a PageTaskHeader) to avoid two.
   */
  as?: 'header' | 'div';
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
 *
 * Accessibility: a banner landmark containing a labelled `<nav>`; the current
 * item carries `aria-current="page"`.
 */
export const PrimaryMenu = forwardRef<HTMLElement, PrimaryMenuProps>(function PrimaryMenu(
  { logo, children, end, navLabel = 'Primary', as: Root = 'header', className, ...rest },
  ref,
) {
  return (
    <Root ref={ref as Ref<HTMLDivElement>} className={cx('scalar-primary-menu', className)} {...rest}>
      {logo}
      <nav className="scalar-primary-menu__nav" aria-label={navLabel}>
        {children}
      </nav>
      {end && <div className="scalar-primary-menu__end">{end}</div>}
    </Root>
  );
});

/* ---------------------------------------------------------------------------
 * Tier 2 — Secondary Menu
 * ------------------------------------------------------------------------ */

export interface SecondaryMenuItemProps extends LinkOrButtonProps {
  /** The page the user is on (`aria-current="page"`). */
  current?: boolean;
}

/** One item in the second navigation tier. */
export const SecondaryMenuItem = forwardRef<HTMLElement, SecondaryMenuItemProps>(function SecondaryMenuItem(
  { children, current, className, ...rest },
  ref,
) {
  return (
    <LinkOrButton
      ref={ref}
      aria-current={current ? 'page' : undefined}
      className={cx('scalar-secondary-menu-item', className)}
      {...rest}
    >
      {children}
    </LinkOrButton>
  );
});

export interface SecondaryMenuProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Accessible name of the `<nav>` landmark. Default "Secondary". */
  label?: string;
}

/**
 * Secondary Menu — the second navigation tier, scoped to the selected company.
 *
 * Sits directly under Primary Menu and changes when the company changes.
 * A labelled `<nav>` landmark.
 */
export const SecondaryMenu = forwardRef<HTMLElement, SecondaryMenuProps>(function SecondaryMenu(
  { children, label = 'Secondary', className, ...rest },
  ref,
) {
  return (
    <nav ref={ref} className={cx('scalar-secondary-menu', className)} aria-label={label} {...rest}>
      {children}
    </nav>
  );
});

/* ---------------------------------------------------------------------------
 * Tier 3 — Tertiary Menu
 * ------------------------------------------------------------------------ */

export interface TertiaryMenuItemProps extends LinkOrButtonProps {
  icon?: ReactNode;
  /** The view the user is on (`aria-current="page"`). */
  current?: boolean;
  /** Combo tags shown beside the label. */
  tags?: ReactNode;
  /** Show the kebab for the view's actions. Defaults to on for the current item. */
  menu?: boolean;
  /**
   * Makes the kebab a real, separately focusable button that opens the view's
   * actions. Without it the kebab is a decorative affordance (`aria-hidden`).
   */
  onMenuClick?: MouseEventHandler<HTMLButtonElement>;
  /** Accessible name of the kebab button. Default "View actions". */
  menuLabel?: string;
}

/** Tertiary Menu Item — one item in the third navigation tier. */
export const TertiaryMenuItem = forwardRef<HTMLElement, TertiaryMenuItemProps>(function TertiaryMenuItem(
  { children, icon, current, tags, menu, onMenuClick, menuLabel = 'View actions', className, asChild, ...rest },
  ref,
) {
  const showKebab = menu ?? current;
  const kebab = <Icon size="s" tone="inherit"><MoreVert /></Icon>;
  const interactiveKebab = showKebab && onMenuClick;
  const item = (
    <LinkOrButton
      ref={ref}
      asChild={asChild}
      aria-current={current ? 'page' : undefined}
      className={cx('scalar-tertiary-menu-item', className)}
      {...rest}
    >
      {asChild ? children : (
        <>
          {icon}
          {children}
          {tags}
          {showKebab && !onMenuClick && kebab}
        </>
      )}
    </LinkOrButton>
  );
  if (!interactiveKebab) return item;
  return (
    <span className="scalar-tertiary-menu-item-group">
      {item}
      <button
        type="button"
        className="scalar-tertiary-menu-item scalar-tertiary-menu-item--kebab"
        aria-label={menuLabel}
        aria-haspopup="menu"
        onClick={onMenuClick}
      >
        {kebab}
      </button>
    </span>
  );
});

export interface TertiaryMenuProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** TertiaryMenuItem instances. */
  children?: ReactNode;
  /** Shows the + that adds a view; called when it is pressed. */
  onAdd?: () => void;
  /** The page toolbar on the right: AI tool, currency, table tools, primary action. */
  end?: ReactNode;
  /** Accessible name of the `<nav>` landmark. Default "Tertiary". */
  label?: string;
  /** Accessible name of the + button. Default "Add view". */
  addLabel?: string;
}

/**
 * Tertiary Menu — the third navigation tier, scoped to the selected section.
 *
 * Three tiers is the limit. A fourth level belongs in the page body, not the
 * chrome. A labelled `<nav>` landmark.
 */
export const TertiaryMenu = forwardRef<HTMLElement, TertiaryMenuProps>(function TertiaryMenu(
  { children, onAdd, end, label = 'Tertiary', addLabel = 'Add view', className, ...rest },
  ref,
) {
  return (
    <nav ref={ref} className={cx('scalar-tertiary-menu', className)} aria-label={label} {...rest}>
      <div className="scalar-tertiary-menu__items">
        {children}
        {onAdd && (
          <button type="button" onClick={onAdd} aria-label={addLabel} className="scalar-tertiary-menu-item">
            <Icon size="s" tone="inherit"><Add /></Icon>
          </button>
        )}
      </div>
      {end && <div className="scalar-tertiary-menu__end">{end}</div>}
    </nav>
  );
});

/* ---------------------------------------------------------------------------
 * Company info bar
 * ------------------------------------------------------------------------ */

export interface CompanyInfoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** An Avatar instance, for a company with its own mark. */
  avatar?: ReactNode;
  /** The page or company title. */
  name: ReactNode;
  /** Heading level of the title (default 1, the page title). `false` renders a plain span. */
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6 | false;
  /** Ticker, sector and other metadata beside the name. */
  meta?: ReactNode;
  /** Badge beside the name, e.g. Draft. */
  status?: ReactNode;
  /** A FilterDropdown beside the name, e.g. Filter by Fund. */
  filter?: ReactNode;
  /** The tab row: SecondaryMenu with its items. */
  children?: ReactNode;
  /** The page's selectors and actions, pinned right. */
  end?: ReactNode;
}

/**
 * Company info — the Secondary Menu bar under the primary bar.
 *
 * Composed from Badge, FilterDropdown, SecondaryMenu, InformationLabel and
 * Selector. On a firm page it carries the page title; on a company it carries
 * the company name and its tab row.
 *
 * Accessibility: the title is a heading (level 1 by default) so the page has
 * an outline; pass `titleLevel` when another heading already owns level 1.
 */
export const CompanyInfo = forwardRef<HTMLDivElement, CompanyInfoProps>(function CompanyInfo(
  { avatar, name, titleLevel = 1, meta, status, filter, children, end, className, ...rest },
  ref,
) {
  const Title = titleLevel === false ? 'span' : (`h${titleLevel}` as 'h1');
  return (
    <div ref={ref} className={cx('scalar-company-info', className)} {...rest}>
      {avatar}
      <Title className="scalar-company-info__name">{name}</Title>
      {meta && <span className="scalar-company-info__meta">{meta}</span>}
      {status}
      {filter}
      {children}
      {end && <div className="scalar-company-info__end">{end}</div>}
    </div>
  );
});
