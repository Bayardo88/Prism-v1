/**
 * Sheet — a CSS-grid shell for the grid-pattern cells (RowLabelCell,
 * GridValueCell, InCellControl, GridColumnHeader, GridColumnDivider).
 *
 * The DS ships those cells but no container that lays them out on one column
 * track (DataGrid is flex rows, sized per cell). Every row here is
 * `display: contents`, so a column's width is declared once, in `columns`, and
 * header and body cannot shear. Also used by p08 (Valuations).
 */
import type { ReactNode } from 'react';
import { color, zIndex } from '@scalar/design-system';

export interface SheetProps {
  /** Accessible name of the grid ("Cap table"). */
  label: string;
  /** A `grid-template-columns` value. Pinned dividers take an `auto` track. */
  columns: string;
  /** Share of the content width the sheet takes, e.g. '48%'. Default 100%. */
  width?: string;
  children?: ReactNode;
}

export function Sheet({ label, columns, width = '100%', children }: SheetProps) {
  return (
    <div
      role="grid"
      aria-label={label}
      style={{
        display: 'grid', gridTemplateColumns: columns, width, maxWidth: '100%',
        alignSelf: 'flex-start', background: color.bg.surface,
      }}
    >
      {children}
    </div>
  );
}

/** One row. `display: contents` keeps its cells on the sheet's column tracks. */
export function SheetRow({ children, label }: { children?: ReactNode; label?: string }) {
  return <div role="row" aria-label={label} style={{ display: 'contents' }}>{children}</div>;
}

/**
 * A grid cell that anchors a popover (a menu under an in-cell select). The
 * menu is absolutely positioned under the cell's right edge.
 */
export function Anchor({ children, menu }: { children: ReactNode; menu?: ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {children}
      {menu && (
        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: zIndex.overlay }}>{menu}</div>
      )}
    </div>
  );
}

/** Build a column template: a wide label column, then `n` value columns. */
export function columnsFor(n: number, opts: { label?: string; value?: string; pinnedTotal?: boolean } = {}): string {
  const label = opts.label ?? 'minmax(0, 2.4fr)';
  const value = opts.value ?? 'minmax(0, 1fr)';
  const values = Array.from({ length: n }, () => value).join(' ');
  return `${label} ${values}${opts.pinnedTotal ? ` auto ${value}` : ''}`;
}

/** Width share for a sheet with `n` value columns (label ≈ 16%, value ≈ 10%). */
export function widthFor(n: number, label = 16, value = 10): string {
  return `${Math.min(100, label + value * n)}%`;
}
