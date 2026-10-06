import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export interface ScrimProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Called when the scrim is clicked. Wire this to dismiss only when the
   * dialog has no unsaved state. A caller's own `onClick` still runs first.
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
 *
 * Accessibility: the scrim is a pointer-only convenience and is `aria-hidden`.
 * The dialog it sits under owns Escape and its own Close button.
 */
export const Scrim = forwardRef<HTMLDivElement, ScrimProps>(function Scrim(
  { onDismiss, onClick, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden
      {...rest}
      className={cx('scalar-scrim', className)}
      onClick={(e) => { onClick?.(e); onDismiss?.(); }}
    />
  );
});
