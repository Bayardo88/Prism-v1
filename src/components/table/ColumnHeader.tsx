import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, ArrowUp } from '../icon/glyphs.js';
import { Tooltip } from '../core/Tooltip.js';

export interface ColumnHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Right-aligns the label to sit over a numeric column. */
  numeric?: boolean;
  /** Current sort direction, or `null` when this column is not the sort key. */
  sort?: 'asc' | 'desc' | null;
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
 */
export const ColumnHeader = forwardRef<HTMLDivElement, ColumnHeaderProps>(function ColumnHeader(
  { children, numeric, sort, onSortChange, actions, grow: _grow, width: _width, span, tone = 'brand', kind = 'default', mark, label, tooltip, icon, input, action, className, style, ...rest },
  ref,
) {
  const sortable = Boolean(onSortChange);
  return (
    <div
      ref={ref}
      role="columnheader"
      aria-sort={sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : sortable ? 'none' : undefined}
      tabIndex={sortable ? 0 : undefined}
      onClick={sortable ? () => onSortChange?.(sort === 'asc' ? 'desc' : 'asc') : undefined}
      onKeyDown={
        sortable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSortChange?.(sort === 'asc' ? 'desc' : 'asc');
              }
            }
          : undefined
      }
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
      {tooltip ? (
        <Tooltip content={tooltip} position="bottom">
          <span className="scalar-column-header__label" tabIndex={0}>{children}</span>
        </Tooltip>
      ) : (
        <span className="scalar-column-header__label">{children}</span>
      )}
      {label && <span className="scalar-column-header__tag">{label}</span>}
      {sort && (
        <Icon size="xs" tone="inherit">
          {sort === 'asc' ? <ArrowUp /> : <ArrowDown />}
        </Icon>
      )}
      {icon && (
        <Icon size="xs" tone="inherit" className="scalar-column-header__icon">
          {icon}
        </Icon>
      )}
      {actions}
    </div>
  );
});
