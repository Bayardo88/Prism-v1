import {
  forwardRef, useId, useRef,
  type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type MouseEventHandler, type ReactNode, type Ref,
} from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { useOverlay } from '../../utils/useOverlay.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
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

export interface RowLabelCellBaseProps extends CellAttrs {
  children: ReactNode;
  span?: number;
  style?: CSSProperties;
  /** Row hierarchy. `group-header` is the full-width band (VIP Fund, Holding Co.). */
  type?: RowLabelType;
  /**
   * Names the row in the toggle's accessible name ("Expand Apple Inc."). Defaults
   * to `children` when that is a string.
   */
  toggleLabel?: string;
  className?: string;
}

/** A row is either static, or expandable — and an expandable one needs its handler. */
export type RowLabelCellExpandProps =
  | { expanded?: undefined; onToggle?: undefined }
  | {
      /** Makes the row expandable; `true` = children showing. */
      expanded: boolean;
      /** Called when the toggle is pressed. Required with `expanded`. */
      onToggle: () => void;
    };

export type RowLabelCellProps = RowLabelCellBaseProps & RowLabelCellExpandProps;

/**
 * Row Label Cell — the first (sticky) column of a financial statement, cap
 * table or allocation grid. Carries the hierarchy the base `Cell` cannot:
 * Line Item (optionally expandable), Child (indented), Subtotal, Total and
 * Group Header.
 *
 * Tokens: Group Header = Background/Group Header + Text/On Group Header (stays
 * navy in both modes); Total = Background/Subtle with Stroke/Strong rules.
 *
 * Accessibility: `role="rowheader"` inside a `Row` of a `DataGrid` (an ARIA
 * table). The expand control is a native `<button>` named "Expand <row>" with
 * `aria-expanded`; it is a normal tab stop — there is no tree-grid arrow-key
 * model, because the table is not a `treegrid`.
 */
export const RowLabelCell = forwardRef<HTMLDivElement, RowLabelCellProps>(function RowLabelCell(
  { children, type = 'line-item', expanded, onToggle, toggleLabel, span, style, className, ...rest },
  ref,
) {
  const expandable = expanded !== undefined;
  const name = toggleLabel ?? (typeof children === 'string' ? children : undefined);
  return (
    <div ref={ref} role="rowheader" className={cx('scalar-row-label', `scalar-row-label--${type}`, className)} style={spanStyle(span, style)} {...rest}>
      {expandable && (
        <button type="button" className="scalar-row-label__toggle" aria-label={name ? `Expand ${name}` : 'Expand row'} aria-expanded={expanded} onClick={onToggle}>
          <Icon size="xs" tone="inherit">{expanded ? <Minus /> : <Plus />}</Icon>
        </button>
      )}
      <span className="scalar-row-label__text">{children}</span>
    </div>
  );
});

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
  /**
   * Makes the value activatable (open its history, select it). The content is
   * then wrapped in a native `<button>` inside the cell, so Enter / Space work.
   */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** calculated → Text/Primary · editable → Text/Editable · sourced → Text/Sourced · total → bold, ruled. */
  kind?: ValueKind;
  state?: ValueCellState;
  /** Draws the corner flag used for cell notes. */
  hasComment?: boolean;
  /** Accessible name of the note flag. Default "Has note". */
  commentLabel?: string;
  /** Required with `state="error"` — explain why (R8). Shown as the cell's title and read out as its description. */
  errorMessage?: string;
  /** What `state="placeholder"` shows. Default "Enter data". */
  placeholderText?: string;
  className?: string;
}

/**
 * Grid Value Cell — value cell for editable financial grids. Right-aligned,
 * tabular figures. Error always carries a message (colour alone never carries
 * meaning, R8); Placeholder is an empty required input ("ENTER DATA");
 * Not Applicable is shaded and non-interactive.
 *
 * Accessibility: `role="cell"` inside a `Row` of a `DataGrid`. With `onClick`
 * the value is a native `<button>` (one tab stop per actionable cell); without
 * it the cell is static text. Editing is the consumer's job — render an input
 * as `children`. `data-state` / `data-kind` expose the state for styling hooks.
 */
export const GridValueCell = forwardRef<HTMLDivElement, GridValueCellProps>(function GridValueCell(
  { children, kind = 'calculated', state = 'default', hasComment, commentLabel = 'Has note', errorMessage, placeholderText = 'Enter data', span, style, onClick, className, ...rest },
  ref,
) {
  const errorId = useId();
  const content = state === 'placeholder' ? placeholderText : state === 'not-applicable' ? '—' : children;
  const actionable = onClick && state !== 'not-applicable';
  return (
    <div
      ref={ref}
      role="cell"
      aria-invalid={state === 'error' || undefined}
      aria-describedby={state === 'error' && errorMessage ? errorId : undefined}
      title={state === 'error' ? errorMessage : undefined}
      data-state={state}
      data-kind={kind}
      className={cx('scalar-value-cell', `scalar-value-cell--${kind}`, `scalar-value-cell--${state}`, className)}
      style={spanStyle(span, style)}
      {...rest}
    >
      {actionable ? (
        <button type="button" className="scalar-value-cell__button" onClick={onClick}>
          {content}
        </button>
      ) : (
        content
      )}
      {state === 'not-applicable' && <VisuallyHidden>Not applicable</VisuallyHidden>}
      {state === 'error' && errorMessage && <VisuallyHidden id={errorId}>{errorMessage}</VisuallyHidden>}
      {hasComment && <span className="scalar-value-cell__flag" aria-label={commentLabel} role="img" />}
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * In-cell Control
 * ------------------------------------------------------------------------ */

export type InCellControlType = 'select' | 'date' | 'currency';

export interface InCellControlProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'style' | 'type'> {
  type: InCellControlType;
  /** `error` paints the cell negative; pass `errorMessage` — colour alone never carries meaning (R8). */
  state?: 'default' | 'error';
  errorMessage?: string;
  span?: number;
  /** Style of the cell wrapper (the control fills it). */
  style?: CSSProperties;
  /** Current value, or omit for the "Select option" prompt. */
  children?: ReactNode;
  /** Whether the popup is open. Omit when no popup is wired — `aria-expanded` is then not announced. */
  open?: boolean;
  /** Accessible name of the field ("Security type"); the current value is appended to it. */
  label: string;
  className?: string;
}

/**
 * In-cell Control — borderless picker inside a grid cell: Select (security
 * type, allocation method), Date (opens DatePicker), Currency (company
 * currency pill). Text/Editable marks it as user input.
 *
 * Accessibility: a `role="cell"` wrapper holds a native `<button>`, so the
 * control keeps its button semantics. Its name is `label` plus the visible
 * value ("Security type Common"), which satisfies label-in-name. Pass
 * `aria-controls` (the popup's id) through; the ref and rest props go to the
 * button. Focus return after the popup closes is the popup owner's job.
 */
export const InCellControl = forwardRef<HTMLButtonElement, InCellControlProps>(function InCellControl(
  { type, children, open, label, state = 'default', errorMessage, span, style, className, ...rest },
  ref,
) {
  const ids = useId();
  const labelId = `${ids}-label`;
  const valueId = `${ids}-value`;
  const errorId = `${ids}-error`;
  const value = children ?? (type === 'select' ? 'Select option' : type === 'date' ? 'Select date' : 'USD');
  return (
    <div role="cell" className="scalar-incell-cell" style={spanStyle(span, style)}>
      <button
        ref={ref}
        type="button"
        aria-haspopup={type === 'date' ? 'dialog' : 'listbox'}
        aria-expanded={open}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-invalid={state === 'error' || undefined}
        aria-describedby={state === 'error' && errorMessage ? errorId : undefined}
        title={state === 'error' ? errorMessage : undefined}
        className={cx('scalar-incell', `scalar-incell--${type}`, open && 'scalar-incell--open', state === 'error' && 'scalar-incell--error', className)}
        {...rest}
      >
        <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
        <span id={valueId} className={type === 'currency' ? 'scalar-incell__pill' : 'scalar-incell__value'}>
          {value}
          {type === 'currency' && <Icon size="xs" tone="inherit" className={cx(open && 'scalar-rotate-180')}><ChevronDown /></Icon>}
        </span>
        {type === 'select' && <Icon size="xs" tone="inherit" className={cx(open && 'scalar-rotate-180')}><ChevronDown /></Icon>}
        {type === 'date' && <Icon size="s" tone="inherit"><Calendar /></Icon>}
        {state === 'error' && errorMessage && <VisuallyHidden id={errorId}>{errorMessage}</VisuallyHidden>}
      </button>
    </div>
  );
});

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
 *
 * Accessibility: `role="columnheader"` with `aria-colspan`, in the group row of
 * a `DataGrid`.
 */
export const ColumnGroupHeader = forwardRef<HTMLDivElement, ColumnGroupHeaderProps>(function ColumnGroupHeader(
  { children, span, styleVariant = 'default', periodDivider, style, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="columnheader"
      aria-colspan={span}
      style={{ gridColumn: `span ${span}`, ...style }}
      className={cx('scalar-group-header', `scalar-group-header--${styleVariant}`, periodDivider && 'scalar-group-header--period', className)}
      {...rest}
    >
      {children}
    </div>
  );
});

export type SortDirection = 'none' | 'ascending' | 'descending';

export interface GridColumnHeaderProps extends CellAttrs {
  children: ReactNode;
  /** Share of the grid's leftover width this column takes (DataGrid). Default 1. */
  grow?: number;
  /** A fixed column track instead of the header-sized one (DataGrid). */
  width?: string;
  span?: number;
  style?: CSSProperties;
  /**
   * Plain-text name of the column, used by the filter and reorder buttons
   * ("Filter Revenue"). Defaults to `children` when that is a string.
   */
  label?: string;
  /** Trailing content after the label, e.g. an editable-date marker. */
  trailing?: ReactNode;
  sort?: SortDirection;
  /** Cycles none → ascending → descending. Omit for an unsortable column. */
  onSort?: () => void;
  /**
   * Shows the drag handle. On its own the handle is a decorative affordance —
   * wire pointer reordering in the grid and pair it with `onMove`.
   */
  draggable?: boolean;
  /**
   * Keyboard (and single-pointer) alternative to dragging, WCAG 2.5.7. With
   * `draggable`, the handle becomes a button: focus it and press ArrowLeft /
   * ArrowRight to move the column one place.
   */
  onMove?: (direction: 'left' | 'right') => void;
  /** Shows the in-header filter button. */
  onFilter?: () => void;
  /** Active column (blue top tab). Exposed as `aria-current`. */
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
 * drag handle, sort indicator and an optional filter. Long labels truncate; put
 * the full label in a Tooltip. (The old resize edge was decorative and has been
 * removed — column widths come from the DataGrid tracks.)
 *
 * Accessibility: `role="columnheader"` with `aria-sort` when sortable; sort,
 * filter and reorder are separate native buttons.
 */
export const GridColumnHeader = forwardRef<HTMLDivElement, GridColumnHeaderProps>(function GridColumnHeader(
  { children, label, sort = 'none', onSort, draggable, onMove, onFilter, selected, numeric, editable, grow: _grow, width: _width, span, style, trailing, className, ...rest },
  ref,
) {
  const name = label ?? (typeof children === 'string' ? children : 'column');
  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      onMove?.(e.key === 'ArrowLeft' ? 'left' : 'right');
    }
  };
  return (
    <div
      ref={ref}
      role="columnheader"
      aria-sort={onSort ? sort : undefined}
      aria-current={selected || undefined}
      className={cx('scalar-grid-header', selected && 'scalar-grid-header--selected', numeric && 'scalar-grid-header--numeric', editable && 'scalar-grid-header--editable', className)}
      style={spanStyle(span, style)}
      {...rest}
    >
      {draggable && (onMove ? (
        <button type="button" className="scalar-grid-header__drag" aria-label={`Move ${name}`} title="Use the left and right arrow keys to move this column" onKeyDown={onHandleKey}>
          <Icon size="xs" tone="inherit"><DragHandle /></Icon>
        </button>
      ) : (
        <span className="scalar-grid-header__drag" aria-hidden><Icon size="xs" tone="inherit"><DragHandle /></Icon></span>
      ))}
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
    </div>
  );
});

export interface AddColumnHeaderProps extends CellAttrs {
  onClick: () => void;
  children?: ReactNode;
  /** The add-column affordance is the active target (e.g. its picker is open). */
  selected?: boolean;
  /** The id of the dialog the button opens (`aria-controls`). */
  controls?: string;
  width?: string;
  grow?: number;
  style?: CSSProperties;
  className?: string;
}

/**
 * Add Column Header — trailing pseudo-header that opens the Add Columns modal.
 * The ref and rest props go to the `columnheader` wrapper; the button inside is
 * the control (`aria-haspopup="dialog"`, `aria-expanded` while `selected`).
 */
export const AddColumnHeader = forwardRef<HTMLDivElement, AddColumnHeaderProps>(function AddColumnHeader(
  { onClick, children = 'Add column', selected, controls, width: _width, grow: _grow, style, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="columnheader" className={cx('scalar-add-column', selected && 'scalar-add-column--selected', className)} style={style} {...rest}>
      <button type="button" onClick={onClick} aria-haspopup="dialog" aria-expanded={selected ?? false} aria-controls={controls}>
        {children}
        <Icon size="xs" tone="inherit"><Plus /></Icon>
      </button>
    </div>
  );
});

export interface CollapsedColumnRailProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'className' | 'children'> {
  /** Number of hidden columns. */
  count: number;
  onExpand: () => void;
  className?: string;
}

/**
 * Collapsed Column Rail — vertical pill standing in for hidden columns ("+ 8 columns").
 * Its name is the visible text plus a hidden "show hidden columns" hint, so the
 * visible label is contained in the name.
 */
export const CollapsedColumnRail = forwardRef<HTMLButtonElement, CollapsedColumnRailProps>(function CollapsedColumnRail(
  { count, onExpand, className, ...rest },
  ref,
) {
  return (
    <button ref={ref} type="button" onClick={onExpand} className={cx('scalar-column-rail', className)} {...rest}>
      <span className="scalar-column-rail__text">+ {count} {count === 1 ? 'column' : 'columns'}</span>
      <VisuallyHidden>, show hidden {count === 1 ? 'column' : 'columns'}</VisuallyHidden>
    </button>
  );
});

export interface GridColumnDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** `period` = actuals | projections (Stroke/Brand); `pinned` = before a pinned total column (Stroke/Strong). */
  type?: 'period' | 'pinned';
}

/** Grid Column Divider — full-height vertical rule between column groups. Purely decorative: hidden from assistive technology. */
export const GridColumnDivider = forwardRef<HTMLDivElement, GridColumnDividerProps>(function GridColumnDivider(
  { type = 'period', className, ...rest },
  ref,
) {
  return <div ref={ref} aria-hidden className={cx('scalar-column-divider', `scalar-column-divider--${type}`, className)} {...rest} />;
});

/* ---------------------------------------------------------------------------
 * Chart Hover Card / Cell History Popover
 * ------------------------------------------------------------------------ */

export interface ChartHoverRow {
  /** Stable key for the row. Defaults to `label` when that is a string. */
  id?: string;
  label: ReactNode;
  value: ReactNode;
  /** A resolved colour from useChartTokens. */
  swatch: string;
}

export interface ChartHoverCardProps extends HTMLAttributes<HTMLDivElement> {
  /** The x value ("Dec 31, 2024"). */
  heading: ReactNode;
  /** One entry per series. */
  rows: ReadonlyArray<ChartHoverRow>;
}

/**
 * Chart Hover Card — hover read-out for Line / Bar / Waterfall charts. The
 * swatch is passed in resolved (canvas colours come from `useChartTokens`).
 *
 * Accessibility: `role="tooltip"` is a pointer read-out — the same data is in
 * the chart's table alternative. To tie it to its trigger, give it an `id`
 * and set `aria-describedby` on the trigger; the owner dismisses it on Escape.
 */
export const ChartHoverCard = forwardRef<HTMLDivElement, ChartHoverCardProps>(function ChartHoverCard(
  { heading, rows, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="tooltip" className={cx('scalar-chart-hover', className)} {...rest}>
      <div className="scalar-chart-hover__heading">{heading}</div>
      {rows.map((r, i) => (
        <div key={r.id ?? (typeof r.label === 'string' ? r.label : i)} className="scalar-chart-hover__row">
          <span className="scalar-chart-hover__swatch" style={{ '--swatch': r.swatch } as CSSProperties} aria-hidden />
          <span className="scalar-chart-hover__label">{r.label}:</span>
          <span className="scalar-chart-hover__value">{r.value}</span>
        </div>
      ))}
    </div>
  );
});

export interface CellHistoryPopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** The chart — normally a `LineChart`. */
  children: ReactNode;
  onClose: () => void;
  /** Accessible name of the close button. Default "Close". */
  closeLabel?: string;
  /**
   * Move focus into the popover on mount and return it to the opener on
   * unmount. The popover is mounted only while open, so this defaults to
   * `true`; pass `false` to render it statically (a gallery) without taking focus.
   * Escape and outside clicks only close it while this is on.
   */
  autoFocus?: boolean;
}

/**
 * Cell History Popover — opened from the trend icon on a value cell; shows
 * that value over time. The caller owns positioning (anchor below-right of the
 * cell) and mounts it only while open.
 *
 * Accessibility: a non-modal `role="dialog"` named by its title
 * (`aria-labelledby`). Focus moves in on mount (to the close button), Escape or
 * a click outside calls `onClose`, Tab can leave, and focus returns to the
 * opener when it unmounts.
 */
export const CellHistoryPopover = forwardRef<HTMLDivElement, CellHistoryPopoverProps>(function CellHistoryPopover(
  { title, subtitle, children, onClose, closeLabel = 'Close', autoFocus = true, className, ...rest },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlay({ open: autoFocus, onClose, containerRef, modal: false });
  return (
    <div
      ref={composeRefs(containerRef, ref)}
      role="dialog"
      aria-labelledby={titleId}
      className={cx('scalar-cell-history', className)}
      {...rest}
    >
      <div className="scalar-cell-history__header">
        <div>
          <div id={titleId} className="scalar-cell-history__title">{title}</div>
          {subtitle && <div className="scalar-cell-history__subtitle">{subtitle}</div>}
        </div>
        <ButtonIcon variant="tertiary" size="s" label={closeLabel} onClick={onClose} icon={<Icon size="s" tone="inherit"><Close /></Icon>} />
      </div>
      <div className="scalar-cell-history__body">{children}</div>
    </div>
  );
});

/* ---------------------------------------------------------------------------
 * Task Pill
 * ------------------------------------------------------------------------ */

export type TaskPillTone = 'negative' | 'warning' | 'brand';

export interface TaskPillProps extends Omit<HTMLAttributes<HTMLElement>, 'onClick'> {
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
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * Task Pill — a compact tinted pill in a grid row flagging pending tasks: an
 * icon plus an optional count. The tint is `bg.*Subtle` with its matching
 * text, and the icon and number carry the meaning with the label as the
 * accessible name, so colour is never the only signal (R8).
 *
 * Dense grid furniture: 24px tall (Target/Dense), the documented exception to
 * the 44px target. The ref points at the root, a `<button>` with `onClick`,
 * otherwise a `<span role="img">`.
 */
export const TaskPill = forwardRef<HTMLElement, TaskPillProps>(function TaskPill(
  { label, count, tone = 'warning', icon, onClick, className, ...rest },
  ref,
) {
  const cls = cx('scalar-task-pill', `scalar-task-pill--${tone}`, className);
  const body = (
    <>
      <Icon size="xs" tone="inherit">{icon ?? <m.PendingActions />}</Icon>
      {count != null && <span className="scalar-task-pill__count" aria-hidden>{count}</span>}
    </>
  );
  return onClick ? (
    <button ref={ref as Ref<HTMLButtonElement>} type="button" aria-label={label} title={label} onClick={onClick} className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{body}</button>
  ) : (
    <span ref={ref} role="img" aria-label={label} title={label} className={cls} {...rest}>{body}</span>
  );
});
