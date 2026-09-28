import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, ArrowUp } from '../icon/glyphs.js';

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
  { children, numeric, sort, onSortChange, actions, grow: _grow, width: _width, span, tone = 'brand', className, style, ...rest },
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
        className,
      )}
      style={span && span > 1 ? { gridColumn: `span ${span}`, ...style } : style}
      {...rest}
    >
      <span className="scalar-column-header__label">{children}</span>
      {sort && (
        <Icon size="xs" tone="inherit">
          {sort === 'asc' ? <ArrowUp /> : <ArrowDown />}
        </Icon>
      )}
      {actions}
    </div>
  );
});
