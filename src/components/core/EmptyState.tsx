import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Typography } from '../typography/Typography.js';

/**
 * No data is a first-run state and should offer the action that fills it.
 * No results follows a search or filter and should offer the way out of it.
 * Error explains what failed and offers a retry.
 */
export type EmptyStateType = 'no-data' | 'no-results' | 'error';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  type?: EmptyStateType;
  title: ReactNode;
  /** The heading level, so the title fits the page outline. Default 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  body?: ReactNode;
  /** An icon from SDS_Main icons, wrapped in `Icon`. */
  icon?: ReactNode;
  /** One or two Button instances carrying the way forward. */
  actions?: ReactNode;
}

/**
 * Empty State — what a surface shows when it has nothing to show.
 *
 * An empty state is the most-read screen in a new account. Write the copy as
 * guidance, not apology — never a bare "Something went wrong".
 *
 * It has no live-region role by default: a static empty state must not shout at
 * page load, and it holds buttons, which an alert should not. When an error
 * appears after a user action, pass `role="status"` (or announce it elsewhere).
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { type = 'no-data', title, headingLevel = 3, body, icon, actions, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} {...rest} className={cx('scalar-empty-state', className)} data-type={type}>
      {icon}
      <Typography variant="heading" step="xl" weight="semiBold" tone="primary" as={`h${headingLevel}`}>
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
});
