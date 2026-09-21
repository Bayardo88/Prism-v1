import { Fragment, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronRight } from '../icon/glyphs.js';

export interface BreadcrumbItemData {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  /** Root first, current page last. The last item is always the current one. */
  items: BreadcrumbItemData[];
  className?: string;
}

/**
 * Breadcrumb — where this page sits in the hierarchy, and a way back up.
 *
 * A breadcrumb reflects structure, not history. It is not a back button: it
 * shows the path from the root to here, no matter how the user arrived.
 *
 * In deep trails, collapse the middle rather than the ends — the root and the
 * parent are the two the user actually needs.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx('scalar-breadcrumb', className)}>
      <ol className="scalar-breadcrumb__list">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li className="scalar-breadcrumb__item">
                {isCurrent ? (
                  <span className="scalar-breadcrumb-item scalar-breadcrumb-item--current" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <a className="scalar-breadcrumb-item" href={item.href} onClick={item.onClick}>
                    {item.label}
                  </a>
                )}
              </li>
              {!isCurrent && (
                <Icon size="xs" tone="secondary" aria-hidden>
                  <ChevronRight />
                </Icon>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
