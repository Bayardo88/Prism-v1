/**
 * Anchor — one grid cell that anchors a popover (a SelectMenu under an
 * in-cell select). Kept local because positioning a menu under its trigger is
 * the trigger's job (SelectMenu / ContextMenu are surfaces only). The wrapper
 * is the cell's grid item inside the Row subgrid; the control fills it.
 * Also used by p08 (Valuations).
 */
import type { ReactNode } from 'react';
import { zIndex } from '@scalar/design-system';

export function Anchor({ children, menu, align = 'right' }: { children: ReactNode; menu?: ReactNode; align?: 'left' | 'right' }) {
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {children}
      {menu && (
        <div style={{ position: 'absolute', top: '100%', [align]: 0, zIndex: zIndex.overlay }}>{menu}</div>
      )}
    </div>
  );
}

/**
 * Column tracks for a sheet with a pinned Total: a label column, `n` value
 * columns, the pinned divider (an `auto` track — `GridColumnDivider` takes no
 * sizing props, so these grids pass `columns` explicitly) and the total.
 */
export function pinnedTracks(n: number, labelGrow = 2): string[] {
  const value = 'minmax(max-content, 1fr)';
  return [`minmax(max-content, ${labelGrow}fr)`, ...Array.from({ length: n }, () => value), 'auto', value];
}
