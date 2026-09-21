import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

/** What the cell holds. Type drives the text colour. */
export type CellType = 'readable' | 'input' | 'data' | 'group' | 'divider';

/** What has happened to the cell. */
export type CellState = 'default' | 'selected' | 'error' | 'draft' | 'total';

export interface CellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  children?: ReactNode;
  /**
   * `readable` takes Text/Primary, `input` takes Text/Editable, and `data`
   * takes Text/Sourced — the colour states where the number came from.
   */
  type?: CellType;
  state?: CellState;
  /** Right-aligns and applies tabular figures. Use for every money column. */
  numeric?: boolean;
  /** A superscript reference or currency marker. See `Footnote`. */
  footnote?: ReactNode;
  /** A leading glyph. Wrap it in `Icon`. */
  icon?: ReactNode;
  /** Draws the left bracket edge of a grouped run. */
  groupStart?: boolean;
  /** Draws the bottom bracket edge of a grouped run. */
  groupEnd?: boolean;
}

/**
 * Cell — the atom of the data grid.
 *
 * The Figma set is 145 variants: State × Type plus a set of content booleans.
 * Here Type and State are props and the booleans are optional slots.
 *
 * Known gap carried over from Figma: these cells use a 2px corner, which maps
 * to Semantic: Radius/2XS — present in the v1.1 collection but not yet in the
 * published contract text. See docs/known-gaps.md.
 */
export const Cell = forwardRef<HTMLDivElement, CellProps>(function Cell(
  { children, type = 'readable', state = 'default', numeric, footnote, icon, groupStart, groupEnd, className, ...rest },
  ref,
) {
  if (type === 'divider') {
    return <div ref={ref} className={cx('scalar-cell', 'scalar-cell--divider', className)} aria-hidden {...rest} />;
  }

  return (
    <div
      ref={ref}
      role="gridcell"
      aria-selected={state === 'selected' || undefined}
      aria-invalid={state === 'error' || undefined}
      className={cx(
        'scalar-cell',
        `scalar-cell--${type}`,
        state !== 'default' && `scalar-cell--${state}`,
        numeric && 'scalar-cell--numeric',
        groupStart && 'scalar-cell--group-start',
        groupEnd && 'scalar-cell--group-end',
        className,
      )}
      {...rest}
    >
      {icon}
      <span className="scalar-cell__content">{children}</span>
      {footnote}
    </div>
  );
});
