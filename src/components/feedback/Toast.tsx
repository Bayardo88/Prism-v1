import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { Close, Error as ErrorGlyph, Info, Success, Warning } from '../icon/glyphs.js';

export type ToastStyle = 'info' | 'positive' | 'warning' | 'negative';

export interface ToastProps {
  style?: ToastStyle;
  children?: ReactNode;
  icon?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const glyphs = { info: Info, positive: Success, warning: Warning, negative: ErrorGlyph } as const;

/**
 * Toast — a transient, system-initiated message.
 *
 * A toast reports something that already happened. It never asks a question and
 * never holds the only copy of information the user needs — it disappears.
 *
 * Accessibility: pair the colour with an icon and words (rule R8). Hover exists
 * so the dismiss timer can pause — keep that behaviour when you wire the timer.
 */
export function Toast({ style = 'positive', children, icon, onDismiss, className }: ToastProps) {
  const Glyph = glyphs[style];
  return (
    <div className={cx('scalar-toast', `scalar-toast--${style}`, className)} role="status" aria-live="polite">
      {icon ?? (
        <Icon size="m" tone="inherit">
          <Glyph />
        </Icon>
      )}
      <div className="scalar-toast__body">{children}</div>
      {onDismiss && (
        <ButtonIcon
          variant="tertiary"
          size="s"
          label="Dismiss"
          onClick={onDismiss}
          icon={<Icon size="s" tone="inherit"><Close /></Icon>}
        />
      )}
    </div>
  );
}

/** Fixed-position stack for toasts. Render one per application. */
export function ToastViewport({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cx('scalar-toast-viewport', className)} role="region" aria-label="Notifications">
      {children}
    </div>
  );
}
