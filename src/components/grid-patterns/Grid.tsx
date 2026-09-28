import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, ArrowUp, Calendar, ChevronDown, Close, DragHandle, Filter, Minus, Plus, Sort } from '../icon/glyphs.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import * as m from '../icon/material.js';

/** What every grid-pattern cell forwards to its element: style, data-*, aria-*, handlers. */
type CellAttrs = Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style' | 'onClick' | 'onToggle'>;

/** Columns a cell spans inside a DataGrid. */
const spanStyle = (span: number | undefined, style: CSSProperties | undefined): CSSProperties | undefined =>
  span && span > 1 ? { gridColumn: `span ${span}`, ...style } : style;

/* ---------------------------------------------------------------------------
 * Row Label Cell
 * ------------------------------------------------------------------------ */

export type RowLabelType = 'line-item' | 'child' | 'subtotal' | 'total' | 'group-header';

export interface RowLabelCellProps extends CellAttrs {
  children: ReactNode;
  span?: number;
  style?: CSSProperties;
  /** Row hierarchy. `group-header` is the full-width band (VIP Fund, Holding Co.). */
  type?: RowLabelType;
  /** Makes the row expandable; `true` = children showing. */
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

/**
 * Row Label Cell — the first (sticky) column of a financial statement, cap
 * table or allocation grid. Carries the hierarchy the base `Cell` cannot:
 * Line Item (optionally expandable), Child (indented), Subtotal, Total and
 * Group Header.
 *
 * Tokens: Group Header = Background/Group Header + Text/On Group Header (stays
 * navy in both modes); Total = Background/Subtle with Stroke/Strong rules.
 */
export function RowLabelCell({ children, type = 'line-item', expanded, onToggle, span, style, className, ...rest }: RowLabelCellProps) {
  const expandable = expanded !== undefined;
  return (
    <div role="rowheader" aria-expanded={expandable ? expanded : undefined} className={cx('scalar-row-label', `scalar-row-label--${type}`, className)} style={spanStyle(span, style)} {...rest}>
      {expandable && (
        <button type="button" className="scalar-row-label__toggle" aria-label={expanded ? 'Collapse row' : 'Expand row'} onClick={onToggle}>
          <Icon size="xs" tone="inherit">{expanded ? <Minus /> : <Plus />}</Icon>
        </button>
      )}
      <span className="scalar-row-label__text">{children}</span>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Grid Value Cell
 * ------------------------------------------------------------------------ */

/** Where the value comes from. Drives the text colour. */
export type ValueKind = 'calculated' | 'editable' | 'sourced' | 'total';
export type ValueCellState = 'default' | 'focused' | 'error' | 'placeholder' | 'not-applicable';

export interface GridValueCellProps extends CellAttrs {
  children?: ReactNode;
  span?: number;
  style?: CSSProperties;
  onClick?: () => void;
  /** calculated → Text/Primary · editable → Text/Editable · sourced → Text/Sourced · total → bold, ruled. */
  kind?: ValueKind;
  state?: ValueCellState;
  /** Draws the corner flag used for cell notes. */
  hasComment?: boolean;
  /** Required with `state="error"` — explain why (R8). Rendered as the cell's title and accessible description. */
  errorMessage?: string;
  className?: string;
}

/**
 * Grid Value Cell — value cell for editable financial grids. Right-aligned,
 * tabular figures. Error always carries a message (colour alone never carries
 * meaning, R8); Placeholder is an empty required input ("ENTER DATA");
 * Not Applicable is shaded and non-interactive.
 */
export function GridValueCell({ children, kind = 'calculated', state = 'default', hasComment, errorMessage, span, style, onClick, className, ...rest }: GridValueCellProps) {
  const content = state === 'placeholder' ? 'Enter data' : state === 'not-applicable' ? '—' : children;
  return (
    <div
      role="gridcell"
      aria-invalid={state === 'error' || undefined}
      aria-readonly={state === 'not-applicable' || undefined}
      aria-description={state === 'error' ? errorMessage : undefined}
      title={state === 'error' ? errorMessage : undefined}
      tabIndex={state === 'not-applicable' ? undefined : -1}
      className={cx('scalar-value-cell', `scalar-value-cell--${kind}`, `scalar-value-cell--${state}`, className)}
      style={spanStyle(span, style)}
      onClick={onClick}
      {...rest}
    >
      {content}
      {hasComment && <span className="scalar-value-cell__flag" aria-label="Has note" role="img" />}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * In-cell Control
 * ------------------------------------------------------------------------ */

export type InCellControlType = 'select' | 'date' | 'currency';

export interface InCellControlProps extends CellAttrs {
  type: InCellControlType;
  /** `error` paints the cell negative; pass `errorMessage` — colour alone never carries meaning (R8). */
  state?: 'default' | 'error';
  errorMessage?: string;
  span?: number;
  style?: CSSProperties;
  /** Current value, or omit for the "Select option" prompt. */
  children?: ReactNode;
  open?: boolean;
  onClick?: () => void;
  /** Accessible name ("Security type"). */
  label: string;
  className?: string;
}

/**
 * In-cell Control — borderless picker inside a grid cell: Select (security
 * type, allocation method), Date (opens DatePicker), Currency (company
 * currency pill). Text/Editable marks it as user input.
 */
export function InCellControl({ type, children, open = false, onClick, label, state = 'default', errorMessage, span, style, className, ...rest }: InCellControlProps) {
  return (
    <button
      type="button"
      role="gridcell"
      aria-haspopup={type === 'date' ? 'dialog' : 'listbox'}
      aria-expanded={open}
      aria-label={label}
      aria-invalid={state === 'error' || undefined}
      aria-description={state === 'error' ? errorMessage : undefined}
      title={state === 'error' ? errorMessage : undefined}
      onClick={onClick}
      className={cx('scalar-incell', `scalar-incell--${type}`, open && 'scalar-incell--open', state === 'error' && 'scalar-incell--error', className)}
      style={spanStyle(span, style)}
      {...rest}
    >
      <span className={type === 'currency' ? 'scalar-incell__pill' : 'scalar-incell__value'}>
        {children ?? (type === 'select' ? 'Select option' : type === 'date' ? 'Select date' : 'USD')}
        {type === 'currency' && <Icon size="xs" tone="inherit" className={cx(open && 'scalar-rotate-180')}><ChevronDown /></Icon>}
      </span>
      {type === 'select' && <Icon size="xs" tone="inherit" className={cx(open && 'scalar-rotate-180')}><ChevronDown /></Icon>}
      {type === 'date' && <Icon size="s" tone="inherit"><Calendar /></Icon>}
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * Headers
 * ------------------------------------------------------------------------ */

export interface ColumnGroupHeaderProps extends CellAttrs {
  style?: CSSProperties;
  children: ReactNode;
  /** Number of columns spanned — sets `aria-colspan`; width comes from layout. */
  span: number;
  /** `emphasis` for Projections-style groups. */
  styleVariant?: 'default' | 'emphasis';
  /** Draws the 3px Stroke/Brand rule between actuals and projections. */
  periodDivider?: boolean;
  className?: string;
}

/**
 * Column Group Header — second header tier spanning a run of columns
 * (Projections over FY2025–27, LTM/NTM, Previous valuation…). Repeat the
 * period rule down the body with `GridColumnDivider`.
 */
export function ColumnGroupHeader({ children, span, styleVariant = 'default', periodDivider, style, className, ...rest }: ColumnGroupHeaderProps) {
  return (
    <div
      role="columnheader"
      aria-colspan={span}
      style={{ gridColumn: `span ${span}`, ...style }}
      className={cx('scalar-group-header', `scalar-group-header--${styleVariant}`, periodDivider && 'scalar-group-header--period', className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export type SortDirection = 'none' | 'ascending' | 'descending';

export interface GridColumnHeaderProps extends CellAttrs {
  children: ReactNode;
  /** Share of the grid's leftover width this column takes (DataGrid). Default 1. */
  grow?: number;
  /** A fixed column track instead of the header-sized one (DataGrid). */
  width?: string;
  span?: number;
  style?: CSSProperties;
  /** Trailing content after the label, e.g. an editable-date marker. */
  trailing?: ReactNode;
  sort?: SortDirection;
  /** Cycles none → ascending → descending. Omit for an unsortable column. */
  onSort?: () => void;
  /** Shows the drag handle; wire reordering in the grid. */
  draggable?: boolean;
  /** Shows the in-header filter button. */
  onFilter?: () => void;
  /** Active column (blue top tab). */
  selected?: boolean;
  numeric?: boolean;
  /**
   * The column's values are user-editable dates: the label turns editable
   * blue and a calendar glyph trails it.
   */
  editable?: boolean;
  className?: string;
}

/**
 * Grid Column Header — interactive header for configurable portfolio grids:
 * drag handle, sort indicator, optional filter and a resize edge. Long labels
 * truncate; put the full label in a Tooltip.
 */
export function GridColumnHeader({ children, sort = 'none', onSort, draggable, onFilter, selected, numeric, editable, grow: _grow, width: _width, span, style, trailing, className, ...rest }: GridColumnHeaderProps) {
  const name = typeof children === 'string' ? children : 'column';
  return (
    <div
      role="columnheader"
      aria-sort={onSort ? sort : undefined}
      aria-selected={selected || undefined}
      className={cx('scalar-grid-header', selected && 'scalar-grid-header--selected', numeric && 'scalar-grid-header--numeric', editable && 'scalar-grid-header--editable', className)}
      style={spanStyle(span, style)}
      {...rest}
    >
      {draggable && <span className="scalar-grid-header__drag" aria-hidden><Icon size="xs" tone="inherit"><DragHandle /></Icon></span>}
      {onSort ? (
        <button type="button" className="scalar-grid-header__label" onClick={onSort}>
          <span className="scalar-grid-header__text">{children}</span>
          <Icon size="xs" tone="inherit" className="scalar-grid-header__sort">
            {sort === 'ascending' ? <ArrowUp /> : sort === 'descending' ? <ArrowDown /> : <Sort />}
          </Icon>
        </button>
      ) : (
        <span className="scalar-grid-header__label"><span className="scalar-grid-header__text">{children}</span></span>
      )}
      {editable && <Icon size="xs" tone="inherit" className="scalar-grid-header__editable-icon"><Calendar /></Icon>}
      {trailing}
      {onFilter && (
        <button type="button" className="scalar-grid-header__filter" aria-label={`Filter ${name}`} onClick={onFilter}>
          <Icon size="xs" tone="inherit"><Filter /></Icon>
        </button>
      )}
      <span className="scalar-grid-header__resize" aria-hidden />
    </div>
  );
}

export interface AddColumnHeaderProps extends CellAttrs {
  onClick: () => void;
  children?: ReactNode;
  /** The add-column affordance is the active target (e.g. its picker is open). */
  selected?: boolean;
  width?: string;
  grow?: number;
  style?: CSSProperties;
  className?: string;
}

/** Add Column Header — trailing pseudo-header that opens the Add Columns modal. */
export function AddColumnHeader({ onClick, children = 'Add column', selected, width: _width, grow: _grow, style, className, ...rest }: AddColumnHeaderProps) {
  return (
    <div role="columnheader" aria-selected={selected || undefined} className={cx('scalar-add-column', selected && 'scalar-add-column--selected', className)} style={style} {...rest}>
      <button type="button" onClick={onClick} aria-expanded={selected}>
        {children}
        <Icon size="xs" tone="inherit"><Plus /></Icon>
      </button>
    </div>
  );
}

export interface CollapsedColumnRailProps {
  /** Number of hidden columns. */
  count: number;
  onExpand: () => void;
  className?: string;
}

/** Collapsed Column Rail — vertical pill standing in for hidden columns ("+ 8 columns"). */
export function CollapsedColumnRail({ count, onExpand, className }: CollapsedColumnRailProps) {
  return (
    <button type="button" onClick={onExpand} aria-label={`Show ${count} hidden columns`} className={cx('scalar-column-rail', className)}>
      <span className="scalar-column-rail__text">+ {count} columns</span>
    </button>
  );
}

export interface GridColumnDividerProps {
  /** `period` = actuals | projections (Stroke/Brand); `pinned` = before a pinned total column (Stroke/Strong). */
  type?: 'period' | 'pinned';
  className?: string;
}

/** Grid Column Divider — full-height vertical rule between column groups. */
export function GridColumnDivider({ type = 'period', className }: GridColumnDividerProps) {
  return <div role="separator" aria-orientation="vertical" className={cx('scalar-column-divider', `scalar-column-divider--${type}`, className)} />;
}

/* ---------------------------------------------------------------------------
 * Chart Hover Card / Cell History Popover
 * ------------------------------------------------------------------------ */

export interface ChartHoverCardProps {
  /** The x value ("Dec 31, 2024"). */
  heading: ReactNode;
  /** One entry per series; `swatch` is a resolved colour from useChartTokens. */
  rows: ReadonlyArray<{ label: ReactNode; value: ReactNode; swatch: string }>;
  className?: string;
}

/**
 * Chart Hover Card — hover read-out for Line / Bar / Waterfall charts. The
 * swatch is passed in resolved (canvas colours come from `useChartTokens`).
 */
export function ChartHoverCard({ heading, rows, className }: ChartHoverCardProps) {
  return (
    <div role="tooltip" className={cx('scalar-chart-hover', className)}>
      <div className="scalar-chart-hover__heading">{heading}</div>
      {rows.map((r, i) => (
        <div key={i} className="scalar-chart-hover__row">
          <span className="scalar-chart-hover__swatch" style={{ background: r.swatch }} aria-hidden />
          <span className="scalar-chart-hover__label">{r.label}:</span>
          <span className="scalar-chart-hover__value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export interface CellHistoryPopoverProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** The chart — normally a `LineChart`. */
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

/**
 * Cell History Popover — opened from the trend icon on a value cell; shows
 * that value over time. Anchor below-right of the cell, close on Escape or
 * outside click (the caller owns positioning and dismissal).
 */
export function CellHistoryPopover({ title, subtitle, children, onClose, className }: CellHistoryPopoverProps) {
  return (
    <div role="dialog" aria-label={typeof title === 'string' ? title : 'Value history'} className={cx('scalar-cell-history', className)}>
      <div className="scalar-cell-history__header">
        <div>
          <div className="scalar-cell-history__title">{title}</div>
          {subtitle && <div className="scalar-cell-history__subtitle">{subtitle}</div>}
        </div>
        <ButtonIcon variant="tertiary" size="s" label="Close" onClick={onClose} icon={<Icon size="s" tone="inherit"><Close /></Icon>} />
      </div>
      <div className="scalar-cell-history__body">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Task Pill
 * ------------------------------------------------------------------------ */

export type TaskPillTone = 'negative' | 'warning' | 'brand';

export interface TaskPillProps {
  /**
   * Accessible name, **required** — the glyph and count are not the name
   * ("3 overdue tasks", "Review requested"). Also the pill's tooltip text.
   */
  label: string;
  /** Pending-task count. Omit for a single marker with no number. */
  count?: number;
  /** `negative` overdue / blocked · `warning` due soon / needs review · `brand` open. Default `warning`. */
  tone?: TaskPillTone;
  /** Glyph, passed through `Icon`. Default Material `pending_actions`. */
  icon?: ReactNode;
  /** Makes the pill a button (open the task list). */
  onClick?: () => void;
  className?: string;
}

/**
 * Task Pill — a compact tinted pill in a grid row flagging pending tasks: an
 * icon plus an optional count. The tint is `bg.*Subtle` with its matching
 * text, and the icon and number carry the meaning with the label as the
 * accessible name, so colour is never the only signal (R8).
 *
 * Dense grid furniture: 24px tall (Target/Dense), the documented exception to
 * the 44px target.
 */
export function TaskPill({ label, count, tone = 'warning', icon, onClick, className }: TaskPillProps) {
  const cls = cx('scalar-task-pill', `scalar-task-pill--${tone}`, className);
  const body = (
    <>
      <Icon size="xs" tone="inherit">{icon ?? <m.PendingActions />}</Icon>
      {count != null && <span className="scalar-task-pill__count" aria-hidden>{count}</span>}
    </>
  );
  return onClick ? (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cls}>{body}</button>
  ) : (
    <span role="img" aria-label={label} title={label} className={cls}>{body}</span>
  );
}
