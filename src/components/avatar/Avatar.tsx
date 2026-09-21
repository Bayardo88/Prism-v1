import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export type AvatarSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Bound to Semantic: Sizing/Avatar. Never hand-size an avatar — pick a step. */
  size?: AvatarSize;
  /** Image URL. Without one the avatar falls back to initials. */
  src?: string;
  /** Describes the person or company, not the picture. */
  alt?: string;
  /** Usually two characters. Rendered uppercase. */
  initials?: string;
}

/**
 * Avatar — a person or company identity mark.
 *
 * Initials scale with the ramp rather than being hand-set: Heading/S at XS and
 * S, Text/M at M, Text/2XL at L, Heading/3XL at XL.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size = 's', src, alt = '', initials, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx('scalar-avatar', `scalar-avatar--${size}`, className)}
      role={src ? undefined : 'img'}
      aria-label={src ? undefined : alt || initials}
      {...rest}
    >
      {src ? <img className="scalar-avatar__image" src={src} alt={alt} /> : initials}
    </span>
  );
});
