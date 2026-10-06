import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';
import { Slot } from '../../utils/Slot.js';
import type { AsChildProps } from '../../utils/types.js';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, AsChildProps {
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
 *
 * `asChild` renders your router link instead of an `<a>`:
 * `<Link asChild><RouterLink to="/x">Valuations</RouterLink></Link>`.
 * `target="_blank"` defaults `rel` to `noopener noreferrer`.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { size = 'm', asChild, className, target, rel, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'a';
  return (
    <Comp
      ref={ref}
      className={cx('scalar-link', `scalar-type-link-${size}`, className)}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      {...rest}
    />
  );
});
