import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, ArrowUp, Sort } from '../icon/glyphs.js';
import { Tooltip } from '../core/Tooltip.js';

export interface ColumnHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Right-aligns the label to sit over a numeric column. */
  numeric?: boolean;
  /**
   * Current sort direction, or `null`/`'none'` when this column is not the sort
   * key. Accepts the `GridColumnHeader` vocabulary (`'ascending'` /
   * `'descending'`) as well as `'asc'` / `'desc'`.
   */
  sort?: 'asc' | 'desc' | 'ascending' | 'descending' | 'none' | null;
  /**
   * Makes the header sortable: a native button inside the header carries the
   * activation. Called with the direction to sort by next.
   */
  onSortChange?: (next: 'asc' | 'desc') => void;
  /** Trailing controls — a filter menu, an action button. */
  actions?: ReactNode;
  /** Share of the grid's leftover width this column takes (DataGrid). Default 1. */
  grow?: number;
  /** A fixed column track instead of the header-sized one (DataGrid). */
  width?: string;
  /** Columns this header spans. Default 1. */
  span?: number;
  /**
   * `brand` (default) — the navy grid chrome. `subtle` — the light header
   * band: Subtle ground, secondary text, a strong bottom rule, for tables
   * that sit inside a card or a modal.
   */
  tone?: 'brand' | 'subtle';
  /**
   * Figma `Style`. `default` is the navy chrome; `action-button` is the white
   * header that stands in for an action, such as the trailing "add column"
   * header.
   */
  kind?: 'default' | 'action-button';
  /** Figma `Mark`: a brand rule across the top edge, marking a period or a group boundary. */
  mark?: boolean;
  /** Figma `Label`: a small tag beside the title, e.g. "Projection". */
  label?: ReactNode;
  /**
   * Figma `Tooltip`: explanatory text. Draws the corner indicator and shows the
   * text on hover and keyboard focus. Never put the only copy of something here.
   */
  tooltip?: ReactNode;
  /** Figma `Icon`: a trailing 12px glyph. Wrap nothing — pass the glyph itself. */
  icon?: ReactNode;
  /** Figma `Input`: the trailing glyph takes the accent tint, marking an editable or add-new header. */
  input?: boolean;
  /** Figma `Action`: the header's action is engaged; draws the accent rule on the top and left edges. */
  action?: boolean;
}

/**
 * Header — the data-grid column header.
 *
 * Tokens: fill Background/Brand Pressed with Text/On Brand, so it reads as
 * chrome rather than as data. `tone="subtle"` swaps to Background/Subtle with
 * Text/Secondary over a Stroke/Strong rule. Use one tone per grid.
 *
 * The header is sticky in use — render it outside the scroll container.
 *
 * Accessibility: the header is a `role="columnheader"` container; when sortable
 * the sort control is a real `<button>` inside it (Enter / Space / click), so
 * trailing `actions` buttons are separate controls and never trigger a sort.
 * `aria-sort` is set on the header (`none` while sortable but unsorted).
 */
export const ColumnHeader = forwardRef<HTMLDivElement, ColumnHeaderProps>(function ColumnHeader(
  { children, numeric, sort, onSortChange, actions, grow: _grow, width: _width, span, tone = 'brand', kind = 'default', mark, label, tooltip, icon, input, action, className, style, ...rest },
  ref,
) {
  const sortable = Boolean(onSortChange);
  const dir = sort === 'asc' || sort === 'ascending' ? 'asc' : sort === 'desc' || sort === 'descending' ? 'desc' : null;
  const sortIcon = (
    <Icon size="xs" tone="inherit">
      {dir === 'asc' ? <ArrowUp /> : dir === 'desc' ? <ArrowDown /> : <Sort />}
    </Icon>
  );
  const labelNode = <span className="scalar-column-header__label">{children}</span>;
  const sortButton = (
    <button type="button" className="scalar-column-header__sort-button" onClick={() => onSortChange?.(dir === 'asc' ? 'desc' : 'asc')}>
      {labelNode}
      {sortIcon}
    </button>
  );
  return (
    <div
      ref={ref}
      role="columnheader"
      aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : sortable ? 'none' : undefined}
      className={cx(
        'scalar-column-header',
        numeric && 'scalar-column-header--numeric',
        sortable && 'scalar-column-header--sortable',
        tone === 'subtle' && 'scalar-column-header--subtle',
        kind === 'action-button' && 'scalar-column-header--action-button',
        mark && 'scalar-column-header--mark',
        Boolean(tooltip) && 'scalar-column-header--tooltip',
        input && 'scalar-column-header--input',
        action && 'scalar-column-header--action',
        className,
      )}
      style={span && span > 1 ? { gridColumn: `span ${span}`, ...style } : style}
      {...rest}
    >
      {sortable ? (
        tooltip ? <Tooltip content={tooltip} position="bottom">{sortButton}</Tooltip> : sortButton
      ) : tooltip ? (
        <Tooltip content={tooltip} position="bottom">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the Tooltip trigger must be keyboard-focusable (Tooltip contract) */}
          <span className="scalar-column-header__label" tabIndex={0}>{children}</span>
        </Tooltip>
      ) : (
        labelNode
      )}
      {!sortable && dir && sortIcon}
      {label && <span className="scalar-column-header__tag">{label}</span>}
      {icon && (
        <Icon size="xs" tone="inherit" className="scalar-column-header__icon">
          {icon}
        </Icon>
      )}
      {actions}
    </div>
  );
});
