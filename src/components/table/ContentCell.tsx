import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

/** `user` a person · `label` an accented tag-like value · `date` a date · `note` free text. */
export type ContentCellType = 'user' | 'label' | 'date' | 'note';

export interface ContentCellProps extends HTMLAttributes<HTMLDivElement> {
  /** What the cell holds. Drives `data-type` and, for `label`, the accent colour. */
  type?: ContentCellType;
  children?: ReactNode;
  /** A leading Avatar or Icon. Make it decorative (`aria-hidden`) or give it its own accessible name — it is not named for you. */
  leading?: ReactNode;
}

/**
 * Content_Cell — a cell carrying richer content than a number: a user, a label,
 * a date or a note.
 *
 * Accessibility: `role="cell"` — use it inside a `Row` of a `DataGrid`.
 */
export const ContentCell = forwardRef<HTMLDivElement, ContentCellProps>(function ContentCell(
  { type = 'user', children, leading, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="cell" className={cx('scalar-content-cell', className)} data-type={type} {...rest}>
      {leading}
      <span className={cx(type === 'label' && 'scalar-content-cell__accent')}>{children}</span>
    </div>
  );
});

export interface LedgerProps extends HTMLAttributes<HTMLSpanElement> {
  /** What the dot means. A bare graphic never carries meaning alone (rule R8). */
  label: string;
}

/**
 * Ledger — a ledger-entry dot, 8px.
 *
 * Because it is a bare graphic it never carries meaning alone: it must be
 * paired with a tooltip or a label, which is why `label` is required.
 */
export const Ledger = forwardRef<HTMLSpanElement, LedgerProps>(function Ledger({ label, className, ...rest }, ref) {
  return <span ref={ref} className={cx('scalar-ledger', className)} role="img" aria-label={label} {...rest} />;
});
