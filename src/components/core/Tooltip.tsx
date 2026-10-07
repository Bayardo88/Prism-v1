import {
  cloneElement, forwardRef, isValidElement, useEffect, useId, useState,
  type HTMLAttributes, type ReactElement, type ReactNode,
} from 'react';
import { cx } from '../../utils/cx.js';
import { useEvent } from '../../utils/useEvent.js';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** The trigger. Must be focusable — a tooltip is never hover-only. */
  children: ReactElement;
  /** The explanation. Keep it short; this is not a place to store content. */
  content: ReactNode;
  /** The side the tooltip sits on, so the arrow points back at its trigger. */
  position?: TooltipPosition;
  /**
   * Controlled visibility. `true` forces the tooltip open (a guided tour, a
   * documentation frame), `false` keeps it shut; omit it for the normal
   * hover / focus behaviour.
   */
  open?: boolean;
  /** Called with the hover / focus / Escape intent, controlled or not. */
  onOpenChange?: (open: boolean) => void;
  /** Class name for the tooltip bubble. Extra root props (`ref`, `data-*`) land on the positioning wrapper. */
  className?: string;
}

/**
 * Tooltip — a short explanation of the control under the pointer.
 *
 * A tooltip explains; it never holds the only copy of something. Anything a
 * user must read to complete a task belongs in the layout, not behind a hover.
 *
 * Accessibility: reachable by keyboard focus, not hover alone. Escape closes
 * it from anywhere while it is open. `aria-describedby` is set on the trigger
 * itself (the child element), so assistive tech reads the text with the control.
 * The `ref` points at the positioning wrapper.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { children, content, position = 'top', open: openProp, onOpenChange, className, ...rest },
  ref,
) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const notify = useEvent(onOpenChange);
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    notify(next);
  };
  const id = useId();

  // Escape dismisses wherever focus is (WCAG 1.4.13), not only inside the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (openProp === undefined) setOpenState(false);
      notify(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, openProp, notify]);

  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' ') || undefined,
      })
    : children;

  return (
    <span
      ref={ref}
      {...rest}
      className="scalar-tooltip-root"
      onMouseEnter={(e) => { rest.onMouseEnter?.(e); setOpen(true); }}
      onMouseLeave={(e) => { rest.onMouseLeave?.(e); setOpen(false); }}
      onFocus={(e) => { rest.onFocus?.(e); setOpen(true); }}
      onBlur={(e) => { rest.onBlur?.(e); setOpen(false); }}
    >
      {trigger}
      {/* Always in the DOM (hidden when closed) so the trigger's aria-describedby has a target to announce. */}
      <span role="tooltip" id={id} hidden={!open} className={cx('scalar-tooltip', `scalar-tooltip--${position}`, className)}>
        {content}
      </span>
    </span>
  );
});
