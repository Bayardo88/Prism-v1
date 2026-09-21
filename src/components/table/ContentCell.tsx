import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export type ContentCellType = 'user' | 'label' | 'date' | 'note';

export interface ContentCellProps {
  type?: ContentCellType;
  children?: ReactNode;
  /** A leading Avatar or Icon. */
  leading?: ReactNode;
  className?: string;
}

/**
 * Content_Cell — a cell carrying richer content than a number: a user, a label,
 * a date or a note.
 */
export function ContentCell({ type = 'user', children, leading, className }: ContentCellProps) {
  return (
    <div className={cx('scalar-content-cell', className)} data-type={type}>
      {leading}
      <span className={cx(type === 'label' && 'scalar-content-cell__accent')}>{children}</span>
    </div>
  );
}

export interface LedgerProps {
  /** What the dot means. A bare graphic never carries meaning alone (rule R8). */
  label: string;
  className?: string;
}

/**
 * Ledger — a ledger-entry dot, 8px.
 *
 * Because it is a bare graphic it never carries meaning alone: it must be
 * paired with a tooltip or a label, which is why `label` is required.
 */
export function Ledger({ label, className }: LedgerProps) {
  return <span className={cx('scalar-ledger', className)} role="img" aria-label={label} />;
}
