import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { ButtonIcon } from '../button/ButtonIcon.js';
import { Icon } from '../icon/Icon.js';
import { Close, Error as ErrorGlyph, Info, Success, Warning } from '../icon/glyphs.js';
import { Typography } from '../typography/Typography.js';

export type AlertTone = 'info' | 'positive' | 'warning' | 'negative';
/** @deprecated Use `AlertTone`. */
export type AlertStyle = AlertTone;

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'style'> {
  /** The kind of message. Default `info`. */
  tone?: AlertTone;
  /**
   * @deprecated Use `tone`. A string value is read as the tone for backwards
   * compatibility; a `CSSProperties` object is the normal HTML `style`.
   */
  style?: AlertTone | CSSProperties;
  title?: ReactNode;
  children?: ReactNode;
  /** Overrides the default glyph. The icon is never optional. */
  icon?: ReactNode;
  /** Trailing actions — usually one Button. */
  actions?: ReactNode;
  /** Renders a dismiss button that calls this. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. Default "Dismiss". */
  dismissLabel?: string;
}

const glyphs = {
  info: Info,
  positive: Success,
  warning: Warning,
  negative: ErrorGlyph,
} as const;

/**
 * Alert — a message about the state of the page or the task, shown inline.
 *
 * Alert is inline and stays until the condition changes. Toast is transient and
 * floats. If the user must act on it, it is an Alert; if it is an
 * acknowledgement they can miss, it is a Toast.
 *
 * Say what happened and what to do next. "Import failed" is half a message.
 *
 * Accessibility: `negative` is `role="alert"` (assertive); the rest are
 * `role="status"` (polite). Override with the `role` prop. The glyph is
 * decorative; the tone is conveyed by the glyph shape and the words.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone, style, title, children, icon, actions, onDismiss, dismissLabel = 'Dismiss', className, ...rest },
  ref,
) {
  const legacyTone = typeof style === 'string' ? style : undefined;
  const htmlStyle = typeof style === 'object' ? style : undefined;
  const resolved: AlertTone = tone ?? legacyTone ?? 'info';
  const Glyph = glyphs[resolved];
  return (
    <div
      ref={ref}
      role={resolved === 'negative' ? 'alert' : 'status'}
      className={cx('scalar-alert', `scalar-alert--${resolved}`, className)}
      style={htmlStyle}
      {...rest}
    >
      <span className="scalar-alert__icon" aria-hidden>
        {icon ?? (
          <Icon size="m" tone="inherit">
            <Glyph />
          </Icon>
        )}
      </span>
      <div className="scalar-alert__body">
        {title && (
          <Typography as="div" variant="text" step="m" weight="semiBold" tone="primary">
            {title}
          </Typography>
        )}
        {children && (
          <Typography as="div" variant="text" step="s" tone="secondary">
            {children}
          </Typography>
        )}
        {actions}
      </div>
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
