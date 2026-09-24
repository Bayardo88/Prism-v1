import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, ArrowUp, Calendar, ChevronDown, Close, DragHandle, Filter, Minus, Plus, Sort } from '../icon/glyphs.js';
import { ButtonIcon } from '../button/ButtonIcon.js';

/* ---------------------------------------------------------------------------
 * Row Label Cell
 * ------------------------------------------------------------------------ */

export type RowLabelType = 'line-item' | 'child' | 'subtotal' | 'total' | 'group-header';

export interface RowLabelCellProps {
  children: ReactNode;
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
export function RowLabelCell({ children, type = 'line-item', expanded, onToggle, className }: RowLabelCellProps) {
  const expandable = expanded !== undefined;
  return (
    <div role="rowheader" aria-expanded={expandable ? expanded : undefined} className={cx('scalar-row-label', `scalar-row-label--${type}`, className)}>
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

export interface GridValueCellProps {
  children?: ReactNode;
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
export function GridValueCell({ children, kind = 'calculated', state = 'default', hasComment, errorMessage, className }: GridValueCellProps) {
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

export interface InCellControlProps {
  type: InCellControlType;
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
export function InCellControl({ type, children, open = false, onClick, label, className }: InCellControlProps) {
  return (
    <button
      type="button"
      role="gridcell"
      aria-haspopup={type === 'date' ? 'dialog' : 'listbox'}
      aria-expanded={open}
      aria-label={label}
      onClick={onClick}
      className={cx('scalar-incell', `scalar-incell--${type}`, open && 'scalar-incell--open', className)}
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

export interface ColumnGroupHeaderProps {
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
export function ColumnGroupHeader({ children, span, styleVariant = 'default', periodDivider, className }: ColumnGroupHeaderProps) {
  return (
    <div
      role="columnheader"
      aria-colspan={span}
      style={{ gridColumn: `span ${span}` }}
      className={cx('scalar-group-header', `scalar-group-header--${styleVariant}`, periodDivider && 'scalar-group-header--period', className)}
    >
      {children}
    </div>
  );
}

export type SortDirection = 'none' | 'ascending' | 'descending';

export interface GridColumnHeaderProps {
  children: ReactNode;
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
  className?: string;
}

/**
 * Grid Column Header — interactive header for configurable portfolio grids:
 * drag handle, sort indicator, optional filter and a resize edge. Long labels
 * truncate; put the full label in a Tooltip.
 */
export function GridColumnHeader({ children, sort = 'none', onSort, draggable, onFilter, selected, numeric, className }: GridColumnHeaderProps) {
  const name = typeof children === 'string' ? children : 'column';
  return (
    <div
      role="columnheader"
      aria-sort={onSort ? sort : undefined}
      aria-selected={selected || undefined}
      className={cx('scalar-grid-header', selected && 'scalar-grid-header--selected', numeric && 'scalar-grid-header--numeric', className)}
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
      {onFilter && (
        <button type="button" className="scalar-grid-header__filter" aria-label={`Filter ${name}`} onClick={onFilter}>
          <Icon size="xs" tone="inherit"><Filter /></Icon>
        </button>
      )}
      <span className="scalar-grid-header__resize" aria-hidden />
    </div>
  );
}

export interface AddColumnHeaderProps {
  onClick: () => void;
  children?: ReactNode;
  className?: string;
}

/** Add Column Header — trailing pseudo-header that opens the Add Columns modal. */
export function AddColumnHeader({ onClick, children = 'Add column', className }: AddColumnHeaderProps) {
  return (
    <div role="columnheader" className={cx('scalar-add-column', className)}>
      <button type="button" onClick={onClick}>
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
