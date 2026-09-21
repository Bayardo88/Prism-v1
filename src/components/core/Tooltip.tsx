import { useId, useState, type ReactElement, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** The trigger. Must be focusable — a tooltip is never hover-only. */
  children: ReactElement;
  /** The explanation. Keep it short; this is not a place to store content. */
  content: ReactNode;
  /** The side the tooltip sits on, so the arrow points back at its trigger. */
  position?: TooltipPosition;
  className?: string;
}

/**
 * Tooltip — a short explanation of the control under the pointer.
 *
 * A tooltip explains; it never holds the only copy of something. Anything a
 * user must read to complete a task belongs in the layout, not behind a hover.
 *
 * Accessibility: reachable by keyboard focus, not hover alone. Dismissible with
 * Escape. It describes the trigger (`aria-describedby`) and never wraps it as a
 * container.
 */
export function Tooltip({ children, content, position = 'top', className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="scalar-tooltip-root"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open && (
        <span role="tooltip" id={id} className={cx('scalar-tooltip', `scalar-tooltip--${position}`, className)}>
          {content}
        </span>
      )}
    </span>
  );
}
