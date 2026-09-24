import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ArrowLeft, ChevronDown, Clock, Link as LinkGlyph, List } from '../icon/glyphs.js';
import { Avatar } from '../avatar/Avatar.js';
import { Chip } from '../chip/Chip.js';
import { CheckboxItem } from '../checkbox/CheckboxItem.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import type { ProductKey } from '../../tokens/index.js';

/* ---------------------------------------------------------------------------
 * Key-Value Row / Version History Item
 * ------------------------------------------------------------------------ */

export interface KeyValueRowProps {
  label: ReactNode;
  /** Text, a Link, an InlineEdit or an InlinePicker. */
  children: ReactNode;
  /** `inline` = shaded key column; `stacked` = key above value for narrow cards. */
  layout?: 'inline' | 'stacked';
  className?: string;
}

/**
 * Key-Value Row — one pair in a description list (comp group name / previous
 * versions, company information). Render rows inside a `<dl>`; they stack
 * with no gap. For a single header metric use InformationLabel.
 */
export function KeyValueRow({ label, children, layout = 'inline', className }: KeyValueRowProps) {
  return (
    <div className={cx('scalar-kv-row', `scalar-kv-row--${layout}`, className)}>
      <dt className="scalar-kv-row__key">{label}</dt>
      <dd className="scalar-kv-row__value">{children}</dd>
    </div>
  );
}

export interface VersionHistoryItemProps {
  /** Effective range ("Aug 24, 2026 5:01 PM — Present"). */
  range: ReactNode;
  /** Who and why ("Changed by Analyst · Firm template change"). */
  meta?: ReactNode;
  current?: boolean;
  /** e.g. a tertiary "Restore" Button on past entries. */
  action?: ReactNode;
  className?: string;
}

/** Version History Item — one entry of a settings/version timeline, newest first. */
export function VersionHistoryItem({ range, meta, current, action, className }: VersionHistoryItemProps) {
  return (
    <li className={cx('scalar-version-item', current && 'scalar-version-item--current', className)}>
      <span className="scalar-version-item__rail" aria-hidden><span className="scalar-version-item__dot" /></span>
      <div className="scalar-version-item__body">
        <div className="scalar-version-item__top">
          <span className="scalar-version-item__range">{range}</span>
          {current && <Chip size="s" styleVariant="positive">Current</Chip>}
        </div>
        {meta && <div className="scalar-version-item__meta">{meta}</div>}
        {action}
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------------------
 * Permission Matrix Row / Role Selector / Profile Header
 * ------------------------------------------------------------------------ */

export interface PermissionMatrixRowProps {
  label: ReactNode;
  /** `group` labels the columns and can bulk-toggle its entities. */
  type?: 'group' | 'entity';
  edit: boolean;
  view: boolean;
  /** Edit implies View — the caller should check View when Edit turns on. */
  onChange?: (next: { edit: boolean; view: boolean }) => void;
  className?: string;
}

/** Permission Matrix Row — entities × access levels (Edit, View). */
export function PermissionMatrixRow({ label, type = 'entity', edit, view, onChange, className }: PermissionMatrixRowProps) {
  const name = typeof label === 'string' ? label : 'entity';
  return (
    <div role="row" className={cx('scalar-perm-row', `scalar-perm-row--${type}`, className)}>
      <span role="rowheader" className="scalar-perm-row__label">{label}</span>
      {type === 'group' ? (
        <>
          <span role="columnheader" className="scalar-perm-row__col">Edit</span>
          <span role="columnheader" className="scalar-perm-row__col">View</span>
        </>
      ) : (
        <>
          <span role="gridcell" className="scalar-perm-row__col">
            <CheckboxItem size="s" checked={edit} aria-label={`Edit ${name}`} onChange={(e) => onChange?.({ edit: e.target.checked, view: e.target.checked || view })} />
          </span>
          <span role="gridcell" className="scalar-perm-row__col">
            <CheckboxItem size="s" checked={view} disabled={edit} aria-label={`View ${name}`} onChange={(e) => onChange?.({ edit, view: e.target.checked })} />
          </span>
        </>
      )}
    </div>
  );
}

export interface RoleSelectorProps {
  role: string;
  open?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Role Selector — compact pill that shows and changes a user's firm role. Opens a MenuPanel. */
export function RoleSelector({ role, open = false, onClick, className }: RoleSelectorProps) {
  return (
    <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={`Role: ${role}. Change`} onClick={onClick}
      className={cx('scalar-role-selector', open && 'scalar-role-selector--open', className)}>
      {role}
      <Icon size="xs" tone="inherit" className={cx(open && 'scalar-rotate-180')}><ChevronDown /></Icon>
    </button>
  );
}

export interface ProfileHeaderProps {
  name: ReactNode;
  email?: ReactNode;
  lastLogin?: ReactNode;
  avatarSrc?: string;
  initials?: string;
  /** Usually a RoleSelector. */
  role?: ReactNode;
  className?: string;
}

/** Profile Header — top of a user detail panel (User Management). */
export function ProfileHeader({ name, email, lastLogin, avatarSrc, initials, role, className }: ProfileHeaderProps) {
  return (
    <div className={cx('scalar-profile-header', className)}>
      <Avatar size="xl" src={avatarSrc} initials={initials} />
      <div className="scalar-profile-header__text">
        {role}
        <div className="scalar-profile-header__name">{name}</div>
        {email && <div className="scalar-profile-header__email">{email}</div>}
        {lastLogin && (
          <div className="scalar-profile-header__login">
            <Icon size="xs" tone="secondary"><Clock /></Icon>{lastLogin}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Filter Bar / Directory Group
 * ------------------------------------------------------------------------ */

export interface FilterBarProps {
  /** Filter controls: Select, DatePicker, Input with search, FilterDropdown. */
  children: ReactNode;
  label?: ReactNode;
  /** Apply / Refresh button. */
  action?: ReactNode;
  className?: string;
}

/** Filter Bar — row of filters above a list or log (Audit logs, Documents, users). */
export function FilterBar({ children, label = 'Filter by', action, className }: FilterBarProps) {
  return (
    <div role="search" className={cx('scalar-filter-bar', className)}>
      <span className="scalar-filter-bar__label">{label}</span>
      <div className="scalar-filter-bar__filters">{children}</div>
      {action}
    </div>
  );
}

export interface DirectoryGroupProps {
  /** The letter ("A"). */
  letter: string;
  entries: ReadonlyArray<{ label: ReactNode; href?: string; onClick?: () => void }>;
  className?: string;
}

/** Directory Group — one letter of the A–Z company directory on the portfolio home. */
export function DirectoryGroup({ letter, entries, className }: DirectoryGroupProps) {
  return (
    <section aria-label={letter} className={cx('scalar-directory-group', className)}>
      <div className="scalar-directory-group__letter"><span>{letter}</span><span className="scalar-directory-group__rule" aria-hidden /></div>
      <ul className="scalar-directory-group__grid">
        {entries.map((e, i) => (
          <li key={i}>
            {e.href ? <a href={e.href} className="scalar-directory-group__link">{e.label}</a>
              : <button type="button" onClick={e.onClick} className="scalar-directory-group__link">{e.label}</button>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Product Tile / Firm Switcher Tile
 * ------------------------------------------------------------------------ */

export interface ProductTileProps {
  product: ProductKey;
  title: ReactNode;
  description?: ReactNode;
  /** The product's SDS_Main glyph (tinted by the tile). */
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Product Tile — entry card for one Scalar product. Bound to the Product/*
 * identity family (identity, not status). Icon well = Sizing/Icon Well/M.
 */
export function ProductTile({ product, title, description, icon, href, onClick, className }: ProductTileProps) {
  const body = (
    <>
      <span className="scalar-product-tile__well">{icon}</span>
      <span className="scalar-product-tile__title">{title}</span>
      {description && <span className="scalar-product-tile__description">{description}</span>}
    </>
  );
  const cls = cx('scalar-product-tile', `scalar-product-tile--${product}`, className);
  return href ? <a href={href} className={cls}>{body}</a> : <button type="button" onClick={onClick} className={cls}>{body}</button>;
}

export interface FirmSwitcherTileProps {
  /** Firm name — the accessible name. */
  name: string;
  logoSrc?: string;
  /** Shown when there is no logo. */
  initials?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Firm Switcher Tile — square firm logo in the firm switcher strip. */
export function FirmSwitcherTile({ name, logoSrc, initials, selected, onClick, className }: FirmSwitcherTileProps) {
  return (
    <button type="button" aria-label={name} aria-pressed={!!selected} onClick={onClick} className={cx('scalar-firm-tile', selected && 'scalar-firm-tile--selected', className)}>
      {logoSrc ? <img src={logoSrc} alt="" /> : <span className="scalar-firm-tile__initials">{initials}</span>}
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * Page Task Header / Code Grid / Rich Text Toolbar / App Footer
 * ------------------------------------------------------------------------ */

export interface PageTaskHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onBack: () => void;
  /** Secondary then primary Buttons. */
  actions?: ReactNode;
  className?: string;
}

/** Page Task Header — header for a focused, full-page task (Information request editor). */
export function PageTaskHeader({ title, subtitle, onBack, actions, className }: PageTaskHeaderProps) {
  return (
    <header className={cx('scalar-task-header', className)}>
      <ButtonIcon variant="tertiary" size="m" label="Back" onClick={onBack} icon={<Icon size="s" tone="inherit"><ArrowLeft /></Icon>} />
      <div className="scalar-task-header__text">
        <h1 className="scalar-task-header__title">{title}</h1>
        {subtitle && <div className="scalar-task-header__subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="scalar-task-header__actions">{actions}</div>}
    </header>
  );
}

export interface CodeGridProps {
  codes: readonly string[];
  /** Mask the codes. Show real codes only right after generation. */
  masked?: boolean;
  /** Download / Print Buttons. */
  actions?: ReactNode;
  label?: string;
  className?: string;
}

/** Code Grid — one-time secrets shown once (2FA backup codes). */
export function CodeGrid({ codes, masked = false, actions, label = 'Backup codes', className }: CodeGridProps) {
  return (
    <div className={cx('scalar-code-grid', className)}>
      <ul aria-label={label} className="scalar-code-grid__codes">
        {codes.map((c, i) => <li key={i} className="scalar-code-grid__code">{masked ? '••••-••••' : c}</li>)}
      </ul>
      {actions && <div className="scalar-code-grid__actions">{actions}</div>}
    </div>
  );
}

export type RichTextFormat = 'bold' | 'italic' | 'underline' | 'list' | 'link';

export interface RichTextToolbarProps {
  active?: readonly RichTextFormat[];
  onToggle: (format: RichTextFormat) => void;
  className?: string;
}

/** Rich Text Toolbar — formatting bar for note editors (Workspace Drawer → Notes). */
export function RichTextToolbar({ active = [], onToggle, className }: RichTextToolbarProps) {
  const btn = (f: RichTextFormat, label: string, glyph: ReactNode) => (
    <button key={f} type="button" aria-label={label} aria-pressed={active.includes(f)} onClick={() => onToggle(f)} className={cx('scalar-rte__button', `scalar-rte__button--${f}`)}>
      {glyph}
    </button>
  );
  return (
    <div role="toolbar" aria-label="Formatting" className={cx('scalar-rte', className)}>
      {btn('bold', 'Bold', 'B')}
      {btn('italic', 'Italic', 'I')}
      {btn('underline', 'Underline', 'U')}
      <span className="scalar-rte__sep" aria-hidden />
      {btn('list', 'Bulleted list', <Icon size="s" tone="inherit"><List /></Icon>)}
      {btn('link', 'Link', <Icon size="s" tone="inherit"><LinkGlyph /></Icon>)}
    </div>
  );
}

export interface AppFooterProps {
  children?: ReactNode;
  version?: string;
  className?: string;
}

/** App Footer — copyright and app version at the end of account/settings pages. */
export function AppFooter({ children = `© Scalar Technologies ${new Date().getFullYear()}`, version, className }: AppFooterProps) {
  return (
    <footer className={cx('scalar-app-footer', className)}>
      <span>{children}</span>
      {version && <><span aria-hidden>|</span><span>{version}</span></>}
    </footer>
  );
}
