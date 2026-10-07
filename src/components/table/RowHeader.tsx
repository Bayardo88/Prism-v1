import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { useControllableState } from '../../utils/useControllableState.js';
import { Icon } from '../icon/Icon.js';
import { CheckboxItem } from '../checkbox/CheckboxItem.js';

/** What the row header holds. Drives the text colour and weight. */
export type RowHeaderType = 'readable' | 'data' | 'input' | 'total' | 'divider';

export interface RowHeaderBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** The label — a name, a period, a figure. Plain text; do not pass a `Link`. */
  children?: ReactNode;
  /**
   * `readable` → Text/Primary · `data` → Text/Sourced (pulled from a source) ·
   * `input` → Text/Editable · `total` → ruled above and below, semibold ·
   * `divider` → the shaded section band.
   */
  type?: RowHeaderType;
  /** Figma `Mark`: a 2px Stroke/Focus bar on the left edge. */
  mark?: boolean;
  /** Figma `Bulk`: a leading checkbox for bulk actions. */
  bulk?: boolean;
  /** Controlled state of the bulk checkbox. Omit to let it own its state. */
  checked?: boolean;
  /** Initial state of the bulk checkbox when uncontrolled. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Accessible name of the bulk checkbox, e.g. "Select Apple Inc.". */
  selectLabel?: string;
  /** Row-reading `Group`: a 2px Stroke/Control bar on the left edge. */
  group?: boolean;
  /** Row-input `Start Group`: a 2px Stroke/Control rule on top. */
  groupStart?: boolean;
  /** Row-input `End Group`: a 2px Stroke/Control rule underneath. */
  groupEnd?: boolean;
  /** Figma `Icon`: a trailing 12px glyph (the expander "+"). Pass the glyph itself. */
  icon?: ReactNode;
  /** A superscript reference or currency marker. See `Footnote`. */
  footnote?: ReactNode;
  /**
   * Makes the whole label navigate. The header keeps its own look — it is not
   * drawn as a text link — and underlines on hover and focus.
   */
  href?: string;
  /** Columns this header spans inside a DataGrid. Default 1. */
  span?: number;
}

/** The trailing glyph is decorative, or a button — and a button must be named. */
export type RowHeaderIconProps =
  | { onIconClick?: undefined; iconLabel?: string }
  | {
      /** Makes the trailing glyph a button. */
      onIconClick: () => void;
      /** Accessible name of that button, e.g. "Expand Apple Inc.". Required with `onIconClick`. */
      iconLabel: string;
    };

export type RowHeaderProps = RowHeaderBaseProps & RowHeaderIconProps;

/**
 * Row Header — the first cell of a table row: its name.
 *
 * Figma: **Row-reading** (1035:1911) and **Row-input** (1092:3672). They share
 * one anatomy — a mark bar, an optional bulk checkbox, the label, a trailing
 * glyph — and differ only in how they draw grouping, so code carries one
 * component: Reading's `group` is a left bar, Input's `groupStart` / `groupEnd`
 * are rules on top and underneath.
 *
 * Use it for every row's first cell instead of a text link or a bare `Cell`.
 * Tokens: Background/Surface, 26px minimum height (Sizing/Row/Compact), padding
 * Spacing/2XS and /XS, Heading/S Light (Semi Bold for `total` and `divider`).
 *
 * Accessibility: `role="rowheader"` — use inside a `Row` of a `DataGrid`. The
 * bulk checkbox, link and icon button are separate native controls, each a
 * normal tab stop.
 */
export const RowHeader = forwardRef<HTMLDivElement, RowHeaderProps>(function RowHeader(
  {
    children, type = 'readable', mark, bulk, checked: checkedProp, defaultChecked, onCheckedChange, selectLabel, group, groupStart, groupEnd,
    icon, onIconClick, iconLabel, footnote, href, span, className, style, ...rest
  },
  ref,
) {
  const [checked, setChecked] = useControllableState<boolean>(checkedProp, defaultChecked ?? false, onCheckedChange);
  return (
    <div
      ref={ref}
      role="rowheader"
      className={cx(
        'scalar-row-header',
        `scalar-row-header--${type}`,
        mark && 'scalar-row-header--mark',
        group && 'scalar-row-header--group',
        groupStart && 'scalar-row-header--group-start',
        groupEnd && 'scalar-row-header--group-end',
        className,
      )}
      style={span && span > 1 ? { gridColumn: `span ${span}`, ...style } : style}
      {...rest}
    >
      {bulk && (
        <CheckboxItem
          size="s"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          aria-label={selectLabel ?? 'Select row'}
        />
      )}
      {href ? (
        <a className="scalar-row-header__text scalar-row-header__text--action" href={href}>{children}</a>
      ) : (
        <span className="scalar-row-header__text">{children}</span>
      )}
      {footnote}
      {icon &&
        (onIconClick ? (
          <button type="button" className="scalar-row-header__icon scalar-row-header__icon--action" aria-label={iconLabel} onClick={onIconClick}>
            <Icon size="xs" tone="inherit">{icon}</Icon>
          </button>
        ) : (
          <Icon size="xs" tone="disabled" className="scalar-row-header__icon">{icon}</Icon>
        ))}
    </div>
  );
});
