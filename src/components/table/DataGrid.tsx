import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export interface DataGridProps {
  /** The sticky header row. Render `ColumnHeader` instances here. */
  head?: ReactNode;
  /** The body rows. Render `Row` instances here. */
  children?: ReactNode;
  label?: string;
  className?: string;
}

/**
 * DataGrid — the scroll and stickiness shell around Row and Cell.
 *
 * Figma has no single grid component: the library ships Header, Row-reading,
 * Row-input and Cell, and each screen assembles them. This is that assembly,
 * kept in one place so sticky-header behaviour is not re-implemented per page.
 */
export function DataGrid({ head, children, label, className }: DataGridProps) {
  return (
    <div role="grid" aria-label={label} className={cx('scalar-grid', className)}>
      {head && (
        <div role="row" className="scalar-grid__head">
          {head}
        </div>
      )}
      {children}
    </div>
  );
}
