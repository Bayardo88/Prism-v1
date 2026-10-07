import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { Close, Error as ErrorGlyph, Info, Success, Warning } from '../icon/glyphs.js';

export type ToastTone = 'info' | 'positive' | 'warning' | 'negative';
/** @deprecated Use `ToastTone`. */
export type ToastStyle = ToastTone;

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  /** The kind of message. Default `positive`. */
  tone?: ToastTone;
  /**
   * @deprecated Use `tone`. A string value is read as the tone for backwards
   * compatibility; a `CSSProperties` object is the normal HTML `style`.
   */
  style?: ToastTone | CSSProperties;
  children?: ReactNode;
  icon?: ReactNode;
  /** Renders a dismiss button that calls this. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. Default "Dismiss". */
  dismissLabel?: string;
}

const glyphs = { info: Info, positive: Success, warning: Warning, negative: ErrorGlyph } as const;

/**
 * Toast — a transient, system-initiated message.
 *
 * A toast reports something that already happened. It never asks a question and
 * never holds the only copy of information the user needs — it disappears.
 *
 * Accessibility: pair the colour with an icon and words (rule R8). `negative`
 * toasts are `role="alert"`, the rest `role="status"`. For reliable
 * announcement mount the toasts inside a `ToastViewport`, which is a live
 * region that exists before they arrive. Hover exists so the dismiss timer can
 * pause — keep that behaviour when you wire the timer (the library ships no timer).
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { tone, style, children, icon, onDismiss, dismissLabel = 'Dismiss', className, ...rest },
  ref,
) {
  const legacyTone = typeof style === 'string' ? style : undefined;
  const htmlStyle = typeof style === 'object' ? style : undefined;
  const resolved: ToastTone = tone ?? legacyTone ?? 'positive';
  const Glyph = glyphs[resolved];
  return (
    <div
      ref={ref}
      role={resolved === 'negative' ? 'alert' : 'status'}
      className={cx('scalar-toast', `scalar-toast--${resolved}`, className)}
      style={htmlStyle}
      {...rest}
    >
      {icon ?? (
        <Icon size="m" tone="inherit" aria-hidden>
          <Glyph />
        </Icon>
      )}
      <div className="scalar-toast__body">{children}</div>
      {onDismiss && (
        <ButtonIcon
          variant="tertiary"
          size="s"
          label={dismissLabel}
          onClick={onDismiss}
          icon={<Icon size="s" tone="inherit"><Close /></Icon>}
        />
      )}
    </div>
  );
});

export interface ToastViewportProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Fixed-position stack for toasts. Render one per application. It is the
 * persistent live region (`aria-live="polite"`, additions only) that makes
 * toasts mounted later get announced. Override the name with `aria-label`.
 */
export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(function ToastViewport(
  { children, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="region"
      aria-label="Toast notifications"
      aria-live="polite"
      aria-relevant="additions"
      className={cx('scalar-toast-viewport', className)}
      {...rest}
    >
      {children}
    </div>
  );
});
