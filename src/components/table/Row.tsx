import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export type RowType = 'readable' | 'input' | 'data' | 'total' | 'divider';

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  type?: RowType;
  /** Alternating background. Apply on odd rows only. */
  zebra?: boolean;
  /** A grouped run of rows under a group header. */
  group?: boolean;
}

/**
 * Row — one line of the data grid.
 *
 * Figma models this as two sets, Row-reading and Row-input, which differ only
 * in whether the editing affordances are suppressed. Here that is the `type` of
 * the cells inside the row, so one component covers both: use `type="readable"`
 * for locked periods and published figures.
 *
 * Both sets are composed from Cell — change Cell, not this.
 */
export const Row = forwardRef<HTMLDivElement, RowProps>(function Row(
  { children, type = 'readable', zebra, group, className, ...rest },
  ref,
) {
  if (type === 'divider') {
    return <div ref={ref} className={cx('scalar-row', 'scalar-row--divider', className)} aria-hidden {...rest} />;
  }
  return (
    <div
      ref={ref}
      role="row"
      className={cx(
        'scalar-row',
        type === 'total' && 'scalar-row--total',
        group && 'scalar-row--group',
        zebra && 'scalar-row--zebra',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
