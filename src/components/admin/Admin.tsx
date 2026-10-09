import {
  forwardRef, useEffect, useId, useState,
  type AnchorHTMLAttributes, type ButtonHTMLAttributes, type HTMLAttributes, type LiHTMLAttributes, type OlHTMLAttributes, type ReactNode, type Ref,
} from 'react';
import { cx } from '../../utils/cx.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { useRovingFocus } from '../../utils/useRovingFocus.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
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

export interface KeyValueRowProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  /** Text, a Link, an InlineEdit or an InlinePicker. */
  children: ReactNode;
  /** `inline` = shaded key column; `stacked` = key above value for narrow cards. */
  layout?: 'inline' | 'stacked';
}

/**
 * Key-Value Row — one pair in a description list (comp group name / previous
 * versions, company information). Render rows inside a `KeyValueList` (`<dl>`);
 * they stack with no gap. For a single header metric use InformationLabel.
 */
export const KeyValueRow = forwardRef<HTMLDivElement, KeyValueRowProps>(function KeyValueRow(
  { label, children, layout = 'inline', className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('scalar-kv-row', `scalar-kv-row--${layout}`, className)} {...rest}>
      <dt className="scalar-kv-row__key">{label}</dt>
      <dd className="scalar-kv-row__value">{children}</dd>
    </div>
  );
});

/** Key-Value List — the `<dl>` that `KeyValueRow`s belong in (a `div` row is only valid inside one). */
export const KeyValueList = forwardRef<HTMLDListElement, HTMLAttributes<HTMLDListElement>>(function KeyValueList(
  { style, ...rest },
  ref,
) {
  return <dl ref={ref} style={{ margin: 0, ...style }} {...rest} />;
});

export interface VersionHistoryItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children'> {
  /** Effective range ("Aug 24, 2026 5:01 PM — Present"). */
  range: ReactNode;
  /** Who and why ("Changed by Analyst · Firm template change"). */
  meta?: ReactNode;
  /** Marks the live entry: shows the chip and sets `aria-current`. */
  current?: boolean;
  /** Text of the current-entry chip. Default "Current" ("Current · In use by 3 companies"). */
  currentLabel?: ReactNode;
  /** e.g. a tertiary "Restore" Button on past entries. */
  action?: ReactNode;
}

/** Version History Item — one entry of a settings/version timeline, newest first. Render inside a `VersionHistoryList`. */
export const VersionHistoryItem = forwardRef<HTMLLIElement, VersionHistoryItemProps>(function VersionHistoryItem(
  { range, meta, current, currentLabel = 'Current', action, className, ...rest },
  ref,
) {
  return (
    <li ref={ref} aria-current={current ? 'true' : undefined} className={cx('scalar-version-item', current && 'scalar-version-item--current', className)} {...rest}>
      <span className="scalar-version-item__rail" aria-hidden><span className="scalar-version-item__dot" /></span>
      <div className="scalar-version-item__body">
        <div className="scalar-version-item__top">
          <span className="scalar-version-item__range">{range}</span>
          {current && <Chip size="s" styleVariant="positive">{currentLabel}</Chip>}
        </div>
        {meta && <div className="scalar-version-item__meta">{meta}</div>}
        {action}
      </div>
    </li>
  );
});

/** Version History List — the `<ol>` (newest first) that `VersionHistoryItem`s belong in. */
export const VersionHistoryList = forwardRef<HTMLOListElement, OlHTMLAttributes<HTMLOListElement>>(function VersionHistoryList(
  { style, ...rest },
  ref,
) {
  return <ol ref={ref} style={{ margin: 0, padding: 0, listStyle: 'none', ...style }} {...rest} />;
});

/* ---------------------------------------------------------------------------
 * Permission Matrix Row / Role Selector / Profile Header
 * ------------------------------------------------------------------------ */

/** A table needs a name. */
export type PermissionMatrixProps = HTMLAttributes<HTMLDivElement> &
  ({ 'aria-label': string } | { 'aria-labelledby': string });

/**
 * Permission Matrix — the `role="table"` that `PermissionMatrixRow`s sit in.
 * Carries a visually hidden header row (Name / Edit / View) so each checkbox
 * has column context. Requires an accessible name.
 */
export const PermissionMatrix = forwardRef<HTMLDivElement, PermissionMatrixProps>(function PermissionMatrix(
  { children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="table" {...rest}>
      <div role="row" className="scalar-visually-hidden">
        <span role="columnheader">Name</span>
        <span role="columnheader">Edit</span>
        <span role="columnheader">View</span>
      </div>
      {children}
    </div>
  );
});

export interface PermissionMatrixRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * The entity or group name. A plain string because it also names the
   * checkboxes ("Edit VIP Fund", "View VIP Fund").
   */
  label: string;
  /** `group` is a section row that captions the columns; `entity` carries the checkboxes. */
  type?: 'group' | 'entity';
  /** Edit access, controlled. */
  edit?: boolean;
  /** View access, controlled. */
  view?: boolean;
  defaultEdit?: boolean;
  defaultView?: boolean;
  /** Edit implies View: turning Edit on reports `view: true` too. */
  onChange?: (next: { edit: boolean; view: boolean }) => void;
}

/** Permission Matrix Row — entities × access levels (Edit, View). Render inside a `PermissionMatrix`. */
export const PermissionMatrixRow = forwardRef<HTMLDivElement, PermissionMatrixRowProps>(function PermissionMatrixRow(
  { label, type = 'entity', edit, view, defaultEdit = false, defaultView = false, onChange, className, ...rest },
  ref,
) {
  const impliedId = useId();
  const [isEdit, setEdit] = useControllableState(edit, defaultEdit);
  const [isView, setView] = useControllableState(view, defaultView);
  const apply = (next: { edit: boolean; view: boolean }) => {
    setEdit(next.edit);
    setView(next.view);
    onChange?.(next);
  };
  return (
    <div ref={ref} role="row" className={cx('scalar-perm-row', `scalar-perm-row--${type}`, className)} {...rest}>
      <span role="rowheader" className="scalar-perm-row__label">{label}</span>
      {type === 'group' ? (
        <>
          <span role="cell" className="scalar-perm-row__col" aria-hidden>Edit</span>
          <span role="cell" className="scalar-perm-row__col" aria-hidden>View</span>
        </>
      ) : (
        <>
          <span role="cell" className="scalar-perm-row__col">
            <CheckboxItem size="s" checked={isEdit} aria-label={`Edit ${label}`} onChange={(e) => apply({ edit: e.target.checked, view: e.target.checked || isView })} />
          </span>
          <span role="cell" className="scalar-perm-row__col">
            <CheckboxItem size="s" checked={isView} disabled={isEdit} aria-label={`View ${label}`} aria-describedby={isEdit ? impliedId : undefined} onChange={(e) => apply({ edit: isEdit, view: e.target.checked })} />
            {isEdit && <VisuallyHidden id={impliedId}>Included with edit access</VisuallyHidden>}
          </span>
        </>
      )}
    </div>
  );
});

export interface RoleSelectorProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'children'> {
  /** The user's current role, as text. */
  role: string;
  /** Whether the menu it controls is open. */
  open?: boolean;
}

/**
 * Role Selector — compact pill that shows and changes a user's firm role. It is
 * a menu button (`aria-haspopup="menu"`): pair it with a MenuPanel and pass that
 * panel's id as `aria-controls`.
 */
export const RoleSelector = forwardRef<HTMLButtonElement, RoleSelectorProps>(function RoleSelector(
  { role, open = false, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-haspopup="menu" aria-expanded={open} aria-label={`Role: ${role}. Change`}
      className={cx('scalar-role-selector', open && 'scalar-role-selector--open', className)} {...rest}>
      {role}
      <Icon size="xs" tone="inherit" className={cx(open && 'scalar-rotate-180')}><ChevronDown /></Icon>
    </button>
  );
});

export interface ProfileHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  name: ReactNode;
  email?: ReactNode;
  lastLogin?: ReactNode;
  avatarSrc?: string;
  initials?: string;
  /** Usually a RoleSelector. */
  role?: ReactNode;
  /** Heading level of the name. Default 2. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Profile Header — top of a user detail panel (User Management). The avatar is decorative; the name is the heading. */
export const ProfileHeader = forwardRef<HTMLDivElement, ProfileHeaderProps>(function ProfileHeader(
  { name, email, lastLogin, avatarSrc, initials, role, headingLevel = 2, className, ...rest },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div ref={ref} className={cx('scalar-profile-header', className)} {...rest}>
      <Avatar size="xl" src={avatarSrc} initials={initials} aria-hidden />
      <div className="scalar-profile-header__text">
        {role}
        <Heading className="scalar-profile-header__name">{name}</Heading>
        {email && <div className="scalar-profile-header__email">{email}</div>}
        {lastLogin && (
          <div className="scalar-profile-header__login">
            <Icon size="xs" tone="secondary"><Clock /></Icon>{lastLogin}
          </div>
        )}
      </div>
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Filter Bar / Directory Group
 * ------------------------------------------------------------------------ */

export interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Filter controls: Select, DatePicker, Input with search, FilterDropdown. */
  children: ReactNode;
  /** Visible caption; also the group's accessible name. */
  label?: ReactNode;
  /** Apply / Refresh button. */
  action?: ReactNode;
}

/** Filter Bar — row of filters above a list or log (Audit logs, Documents, users). A labelled group, not a search landmark. */
export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  { children, label = 'Filter by', action, className, ...rest },
  ref,
) {
  const labelId = useId();
  return (
    <div ref={ref} role="group" aria-labelledby={labelId} className={cx('scalar-filter-bar', className)} {...rest}>
      <span id={labelId} className="scalar-filter-bar__label">{label}</span>
      <div className="scalar-filter-bar__filters">{children}</div>
      {action}
    </div>
  );
});

export interface DirectoryGroupProps extends HTMLAttributes<HTMLElement> {
  /** The letter ("A"). */
  letter: string;
  entries: ReadonlyArray<{ label: ReactNode; href?: string; onClick?: () => void }>;
  /** Accessible name of the section. Default `Companies starting with <letter>`. */
  groupLabel?: string;
}

/** Directory Group — one letter of the A–Z company directory on the portfolio home. */
export const DirectoryGroup = forwardRef<HTMLElement, DirectoryGroupProps>(function DirectoryGroup(
  { letter, entries, groupLabel, className, ...rest },
  ref,
) {
  return (
    <section ref={ref} aria-label={groupLabel ?? `Companies starting with ${letter}`} className={cx('scalar-directory-group', className)} {...rest}>
      <div className="scalar-directory-group__letter" aria-hidden><span>{letter}</span><span className="scalar-directory-group__rule" /></div>
      <ul className="scalar-directory-group__grid">
        {entries.map((e, i) => (
          <li key={e.href ?? (typeof e.label === 'string' ? e.label : i)}>
            {e.href ? <a href={e.href} className="scalar-directory-group__link">{e.label}</a>
              : <button type="button" onClick={e.onClick} className="scalar-directory-group__link">{e.label}</button>}
          </li>
        ))}
      </ul>
    </section>
  );
});

/* ---------------------------------------------------------------------------
 * Product Tile / Firm Switcher Tile
 * ------------------------------------------------------------------------ */

export interface ProductTileProps extends Omit<AnchorHTMLAttributes<HTMLElement>, 'title'> {
  product: ProductKey;
  title: ReactNode;
  description?: ReactNode;
  /** The product's SDS_Main glyph (tinted by the tile). Decorative: the title is the name. */
  icon: ReactNode;
  /** Renders an anchor when given, otherwise a button. */
  href?: string;
}

/**
 * Product Tile — entry card for one Scalar product. Bound to the Product/*
 * identity family (identity, not status). Icon well = Sizing/Icon Well/M.
 */
export const ProductTile = forwardRef<HTMLElement, ProductTileProps>(function ProductTile(
  { product, title, description, icon, href, className, ...rest },
  ref,
) {
  const body = (
    <>
      <span className="scalar-product-tile__well" aria-hidden>{icon}</span>
      <span className="scalar-product-tile__title">{title}</span>
      {description && <span className="scalar-product-tile__description">{description}</span>}
    </>
  );
  const cls = cx('scalar-product-tile', `scalar-product-tile--${product}`, className);
  return href
    ? <a ref={ref as Ref<HTMLAnchorElement>} href={href} className={cls} {...rest}>{body}</a>
    : <button ref={ref as Ref<HTMLButtonElement>} type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{body}</button>;
});

export interface FirmSwitcherTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'name' | 'children'> {
  /** Firm name — the accessible name. */
  name: string;
  logoSrc?: string;
  /** Shown when there is no logo. */
  initials?: string;
  /** The active firm. Exposed as `aria-current` (one tile of the strip is current). */
  selected?: boolean;
}

/** Firm Switcher Tile — square firm logo in the firm switcher strip. */
export const FirmSwitcherTile = forwardRef<HTMLButtonElement, FirmSwitcherTileProps>(function FirmSwitcherTile(
  { name, logoSrc, initials, selected, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={logoSrc ? name : undefined} aria-current={selected ? 'true' : undefined} className={cx('scalar-firm-tile', selected && 'scalar-firm-tile--selected', className)} {...rest}>
      {/* Initials are visible text, so the name must contain them: they stay in the accessible name beside the hidden full name. */}
      {logoSrc ? <img src={logoSrc} alt="" /> : <><span className="scalar-firm-tile__initials">{initials}</span><VisuallyHidden>{` ${name}`}</VisuallyHidden></>}
    </button>
  );
});

/* ---------------------------------------------------------------------------
 * Page Task Header / Code Grid / Rich Text Toolbar / App Footer
 * ------------------------------------------------------------------------ */

export interface PageTaskHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  onBack: () => void;
  /** Accessible name of the back button, ideally with its destination ("Back to requests"). Default "Back". */
  backLabel?: string;
  /** Heading level of the title. Default 1. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Secondary then primary Buttons. */
  actions?: ReactNode;
}

/**
 * Page Task Header — header for a focused, full-page task (Information request editor).
 * Renders a `div`, not `<header>`, so it never adds a second banner landmark.
 */
export const PageTaskHeader = forwardRef<HTMLDivElement, PageTaskHeaderProps>(function PageTaskHeader(
  { title, subtitle, onBack, backLabel = 'Back', headingLevel = 1, actions, className, ...rest },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div ref={ref} className={cx('scalar-task-header', className)} {...rest}>
      <ButtonIcon variant="tertiary" size="m" label={backLabel} onClick={onBack} icon={<Icon size="s" tone="inherit"><ArrowLeft /></Icon>} />
      <div className="scalar-task-header__text">
        <Heading className="scalar-task-header__title">{title}</Heading>
        {subtitle && <div className="scalar-task-header__subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="scalar-task-header__actions">{actions}</div>}
    </div>
  );
});

export interface CodeGridProps extends HTMLAttributes<HTMLDivElement> {
  codes: readonly string[];
  /** Mask the codes. Show real codes only right after generation. */
  masked?: boolean;
  /** Download / Print Buttons. */
  actions?: ReactNode;
  /** Accessible name of the list. */
  label?: string;
}

/** Code Grid — one-time secrets shown once (2FA backup codes). Masked codes read as "Hidden code"; toggling is announced. */
export const CodeGrid = forwardRef<HTMLDivElement, CodeGridProps>(function CodeGrid(
  { codes, masked = false, actions, label = 'Backup codes', className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('scalar-code-grid', className)} {...rest}>
      <ul aria-label={label} className="scalar-code-grid__codes">
        {codes.map((c, i) => (
          <li key={`${c}-${i}`} className="scalar-code-grid__code">
            {masked ? <><span aria-hidden>••••-••••</span><VisuallyHidden>Hidden code</VisuallyHidden></> : c}
          </li>
        ))}
      </ul>
      <VisuallyHidden role="status" aria-live="polite">{masked ? 'Codes hidden' : 'Codes shown'}</VisuallyHidden>
      {actions && <div className="scalar-code-grid__actions">{actions}</div>}
    </div>
  );
});

export type RichTextFormat = 'bold' | 'italic' | 'underline' | 'list' | 'link';

export interface RichTextToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> {
  active?: readonly RichTextFormat[];
  onToggle: (format: RichTextFormat) => void;
  /** Button names, for localisation. Defaults are English. */
  labels?: Partial<Record<RichTextFormat, string>>;
}

const RTE_LABELS: Record<RichTextFormat, string> = {
  bold: 'Bold', italic: 'Italic', underline: 'Underline', list: 'Bulleted list', link: 'Link',
};

/**
 * Rich Text Toolbar — formatting bar for note editors (Workspace Drawer → Notes).
 * An APG toolbar: one tab stop, Left/Right move between buttons (wrapping),
 * Home/End jump to the ends. Named "Formatting" unless you pass `aria-label`.
 */
export const RichTextToolbar = forwardRef<HTMLDivElement, RichTextToolbarProps>(function RichTextToolbar(
  { active = [], onToggle, labels, className, onKeyDown, ...rest },
  ref,
) {
  const roving = useRovingFocus({ orientation: 'horizontal', itemSelector: 'button' });
  const name = (f: RichTextFormat) => labels?.[f] ?? RTE_LABELS[f];
  const btn = (f: RichTextFormat, glyph: ReactNode, first = false) => (
    <button key={f} type="button" tabIndex={first ? 0 : -1} aria-label={name(f)} aria-pressed={active.includes(f)} onClick={() => onToggle(f)} className={cx('scalar-rte__button', `scalar-rte__button--${f}`)}>
      {glyph}
    </button>
  );
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={rest['aria-labelledby'] ? undefined : 'Formatting'}
      className={cx('scalar-rte', className)}
      {...rest}
      onKeyDown={(e) => { onKeyDown?.(e); roving.onKeyDown(e); }}
    >
      {btn('bold', <span aria-hidden>B</span>, true)}
      {btn('italic', <span aria-hidden>I</span>)}
      {btn('underline', <span aria-hidden>U</span>)}
      <span className="scalar-rte__sep" aria-hidden />
      {btn('list', <Icon size="s" tone="inherit"><List /></Icon>)}
      {btn('link', <Icon size="s" tone="inherit"><LinkGlyph /></Icon>)}
    </div>
  );
});

export interface AppFooterProps extends HTMLAttributes<HTMLElement> {
  /** Replaces the default copyright line. */
  children?: ReactNode;
  version?: string;
  /**
   * Year in the default copyright line. When omitted the year is filled in
   * after mount, so server and client markup match around New Year.
   */
  year?: number;
}

/** App Footer — copyright and app version at the end of account/settings pages. */
export const AppFooter = forwardRef<HTMLElement, AppFooterProps>(function AppFooter(
  { children, version, year, className, ...rest },
  ref,
) {
  const [clientYear, setClientYear] = useState<number | undefined>(year);
  useEffect(() => {
    if (year === undefined) setClientYear(new Date().getFullYear());
  }, [year]);
  const shownYear = year ?? clientYear;
  return (
    <footer ref={ref} className={cx('scalar-app-footer', className)} {...rest}>
      <span>{children ?? `© Scalar Technologies${shownYear ? ` ${shownYear}` : ''}`}</span>
      {version && <><span aria-hidden>|</span><span>{version}</span></>}
    </footer>
  );
});
