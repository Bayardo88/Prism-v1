import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
import { Icon } from '../icon/Icon.js';
import { Tooltip } from '../core/Tooltip.js';
import { ArrowDropDown, CalendarMonth } from '../icon/material.js';

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
  /** Figma `Label`: a small tag after the content. */
  label?: ReactNode;
  /**
   * Figma `Tooltip`: explanatory text. Draws the corner indicator and shows the
   * text on hover and keyboard focus. Never put the only copy of something here.
   */
  tooltip?: ReactNode;
  /**
   * Figma `Icon Type`: the trailing 12px glyph. `dropdown` for select and picker
   * cells, `calendar` for date cells, or pass your own glyph.
   */
  trailingIcon?: 'dropdown' | 'calendar' | ReactNode;
  /** Draws the left bracket edge of a grouped run. */
  groupStart?: boolean;
  /** Draws the bottom bracket edge of a grouped run. */
  groupEnd?: boolean;
  /** Columns this cell spans inside a DataGrid. Default 1. */
  span?: number;
  /**
   * With `state="error"`: why the value is wrong. Read out as part of the cell
   * as hidden text, because the red tint alone never carries meaning (R8).
   */
  errorMessage?: string;
}

/**
 * Cell — the atom of the data grid.
 *
 * The Figma set is 145 variants: State × Type plus a set of content booleans.
 * Here Type and State are props and the booleans are optional slots.
 *
 * These cells use a 2px corner, which maps to Semantic: Radius/2XS.
 *
 * Accessibility: renders `role="cell"` and belongs inside a `Row` inside a
 * `DataGrid` (an ARIA `table`). `error`, `draft` and `total` reach assistive
 * technology as visually hidden text after the content — `aria-selected` is
 * not valid on a table cell, so `selected` is visual only; mark the row with
 * `Row selected` instead.
 */
export const Cell = forwardRef<HTMLDivElement, CellProps>(function Cell(
  { children, type = 'readable', state = 'default', numeric, footnote, icon, label, tooltip, trailingIcon, groupStart, groupEnd, span, errorMessage, className, style, ...rest },
  ref,
) {
  if (type === 'divider') {
    return <div ref={ref} className={cx('scalar-cell', 'scalar-cell--divider', className)} aria-hidden style={style} {...rest} />;
  }

  return (
    <div
      ref={ref}
      role="cell"
      className={cx(
        'scalar-cell',
        `scalar-cell--${type}`,
        state !== 'default' && `scalar-cell--${state}`,
        numeric && 'scalar-cell--numeric',
        Boolean(tooltip) && 'scalar-cell--tooltip',
        groupStart && 'scalar-cell--group-start',
        groupEnd && 'scalar-cell--group-end',
        className,
      )}
      style={span && span > 1 ? { gridColumn: `span ${span}`, ...style } : style}
      {...rest}
    >
      {icon}
      {tooltip ? (
        <Tooltip content={tooltip} position="bottom">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the Tooltip trigger must be keyboard-focusable (Tooltip contract) */}
          <span className="scalar-cell__content" tabIndex={0}>{children}</span>
        </Tooltip>
      ) : (
        <span className="scalar-cell__content">{children}</span>
      )}
      {footnote}
      {state === 'error' && <VisuallyHidden>{errorMessage ? `Error: ${errorMessage}` : 'Error'}</VisuallyHidden>}
      {state === 'draft' && <VisuallyHidden>Draft</VisuallyHidden>}
      {state === 'total' && <VisuallyHidden>Total</VisuallyHidden>}
      {label && <span className="scalar-cell__tag">{label}</span>}
      {trailingIcon && (
        <Icon size="xs" tone="primary" className="scalar-cell__trailing">
          {trailingIcon === 'dropdown' ? <ArrowDropDown /> : trailingIcon === 'calendar' ? <CalendarMonth /> : trailingIcon}
        </Icon>
      )}
    </div>
  );
});
