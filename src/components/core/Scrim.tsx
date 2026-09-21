import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export interface ScrimProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Called when the scrim is clicked. Wire this to dismiss only when the
   * dialog has no unsaved state.
   */
  onDismiss?: () => void;
}

/**
 * Scrim — the dimming layer behind a modal.
 *
 * Token: Overlay/Scrim — 50% black in Light, 60% in Dark, so the layer deepens
 * rather than inverting.
 *
 * Always present under Elevation/Modal (rule R9). Render it as a sibling of the
 * dialog, never a child: a scrim inside the dialog cannot cover the page behind
 * it.
 */
export const Scrim = forwardRef<HTMLDivElement, ScrimProps>(function Scrim(
  { onDismiss, className, ...rest },
  ref,
) {
  return <div ref={ref} aria-hidden className={cx('scalar-scrim', className)} onClick={onDismiss} {...rest} />;
});
