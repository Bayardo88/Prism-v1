import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Error as ErrorGlyph, Info, Success, Warning } from '../icon/glyphs.js';
import { Typography } from '../typography/Typography.js';

export type AlertStyle = 'info' | 'positive' | 'warning' | 'negative';

export interface AlertProps {
  style?: AlertStyle;
  title?: ReactNode;
  children?: ReactNode;
  /** Overrides the default glyph. The icon is never optional. */
  icon?: ReactNode;
  /** Trailing actions — usually one Button. */
  actions?: ReactNode;
  className?: string;
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
 */
export function Alert({ style = 'info', title, children, icon, actions, className }: AlertProps) {
  const Glyph = glyphs[style];
  return (
    <div
      className={cx('scalar-alert', `scalar-alert--${style}`, className)}
      role={style === 'negative' ? 'alert' : 'status'}
    >
      <span className="scalar-alert__icon">
        {icon ?? (
          <Icon size="m" tone="inherit">
            <Glyph />
          </Icon>
        )}
      </span>
      <div className="scalar-alert__body">
        {title && (
          <Typography variant="text" step="m" weight="semiBold" tone="primary">
            {title}
          </Typography>
        )}
        {children && (
          <Typography variant="text" step="s" tone="secondary">
            {children}
          </Typography>
        )}
        {actions}
      </div>
    </div>
  );
}
