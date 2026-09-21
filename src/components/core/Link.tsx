import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Link/S · Link/M · Link/L. */
  size?: 's' | 'm' | 'l';
}

/**
 * Link — inline navigation inside running text.
 *
 * The Link type role exists so link metrics track body text without inheriting
 * a heading's tracking. The underline is permanent, not a hover reveal: colour
 * alone never signals that something is a link (rule R8), and a link that only
 * underlines on hover is invisible to anyone not already pointing at it.
 *
 * A link navigates. If it submits, deletes or saves, it is a Button wearing the
 * wrong clothes.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { size = 'm', className, ...rest },
  ref,
) {
  return <a ref={ref} className={cx('scalar-link', `scalar-type-link-${size}`, className)} {...rest} />;
});
