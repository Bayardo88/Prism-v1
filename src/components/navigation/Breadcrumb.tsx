import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ChevronRight } from '../icon/glyphs.js';

export interface BreadcrumbItemData {
  label: ReactNode;
  href?: string;
  /** With no `href` the item renders as a `<button>`; with an `href` it is a link and this runs on click. */
  onClick?: () => void;
}

export interface BreadcrumbLinkRenderProps {
  href: string;
  className: string;
  children: ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Root first, current page last. The last item is always the current one. */
  items: BreadcrumbItemData[];
  /** Accessible name of the landmark. Default "Breadcrumb". */
  label?: string;
  /** Render links with a client router's link component. Receives the classes to apply. */
  renderLink?: (props: BreadcrumbLinkRenderProps) => ReactNode;
}

/**
 * Breadcrumb — where this page sits in the hierarchy, and a way back up.
 *
 * A breadcrumb reflects structure, not history. It is not a back button: it
 * shows the path from the root to here, no matter how the user arrived.
 *
 * In deep trails, collapse the middle rather than the ends — the root and the
 * parent are the two the user actually needs.
 *
 * Accessibility: labelled `nav`, an ordered list, the separator lives inside
 * each `li` and is hidden from assistive technology, the last item carries
 * `aria-current="page"`. Items with no `href` render as buttons so they stay
 * keyboard operable.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, label = 'Breadcrumb', renderLink, className, ...rest },
  ref,
) {
  return (
    <nav ref={ref} aria-label={label} className={cx('scalar-breadcrumb', className)} {...rest}>
      <ol className="scalar-breadcrumb__list">
        {items.map((item, i) => {
          const isCurrent = i === items.length - 1;
          const cls = 'scalar-breadcrumb-item';
          let content: ReactNode;
          if (isCurrent) {
            content = (
              <span className={`${cls} ${cls}--current`} aria-current="page">
                {item.label}
              </span>
            );
          } else if (item.href !== undefined) {
            content = renderLink
              ? renderLink({ href: item.href, className: cls, children: item.label, onClick: item.onClick })
              : (
                <a className={cls} href={item.href} onClick={item.onClick}>
                  {item.label}
                </a>
              );
          } else if (item.onClick) {
            content = (
              <button type="button" className={cls} onClick={item.onClick}>
                {item.label}
              </button>
            );
          } else {
            content = <span className={cls}>{item.label}</span>;
          }
          return (
            <li key={i} className="scalar-breadcrumb__item">
              {content}
              {!isCurrent && (
                <Icon size="xs" tone="secondary" aria-hidden>
                  <ChevronRight />
                </Icon>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
