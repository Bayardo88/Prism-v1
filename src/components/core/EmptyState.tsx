import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Typography } from '../typography/Typography.js';

/**
 * No data is a first-run state and should offer the action that fills it.
 * No results follows a search or filter and should offer the way out of it.
 * Error explains what failed and offers a retry.
 */
export type EmptyStateType = 'no-data' | 'no-results' | 'error';

export interface EmptyStateProps {
  type?: EmptyStateType;
  title: ReactNode;
  body?: ReactNode;
  /** An icon from SDS_Main icons, wrapped in `Icon`. */
  icon?: ReactNode;
  /** One or two Button instances carrying the way forward. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Empty State — what a surface shows when it has nothing to show.
 *
 * An empty state is the most-read screen in a new account. Write the copy as
 * guidance, not apology — never a bare "Something went wrong".
 */
export function EmptyState({ type = 'no-data', title, body, icon, actions, className }: EmptyStateProps) {
  return (
    <div
      className={cx('scalar-empty-state', className)}
      data-type={type}
      role={type === 'error' ? 'alert' : undefined}
    >
      {icon}
      <Typography variant="heading" step="xl" weight="semiBold" tone="primary" as="h3">
        {title}
      </Typography>
      {body && (
        <Typography variant="text" step="m" tone="tertiary">
          {body}
        </Typography>
      )}
      {actions && <div className="scalar-empty-state__actions">{actions}</div>}
    </div>
  );
}
