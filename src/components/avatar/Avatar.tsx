import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export type AvatarSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Bound to Semantic: Sizing/Avatar. Never hand-size an avatar — pick a step. */
  size?: AvatarSize;
  /** Image URL. Without one the avatar falls back to initials. */
  src?: string;
  /**
   * Describes the person or company, not the picture. Falls back to `initials`
   * for the accessible name. With neither, the avatar is decorative and hidden
   * from assistive technology (use that only beside the person's name).
   */
  alt?: string;
  /** Usually two characters. Rendered uppercase. Shown when there is no `src` or the image fails to load. */
  initials?: string;
  /** Fallback content (e.g. an `Icon`) when there is neither an image nor initials. */
}

/**
 * Avatar — a person or company identity mark.
 *
 * Initials scale with the ramp rather than being hand-set: Heading/S at XS and
 * S, Text/M at M, Text/2XL at L, Heading/3XL at XL.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { size = 's', src, alt, initials, className, children, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const showImage = Boolean(src) && !failed;
  const name = alt || initials;
  return (
    <span
      ref={ref}
      className={cx('scalar-avatar', `scalar-avatar--${size}`, className)}
      role={name ? 'img' : undefined}
      aria-label={name || undefined}
      aria-hidden={name ? undefined : true}
      {...rest}
    >
      {showImage ? (
        <img className="scalar-avatar__image" src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        initials ?? children
      )}
    </span>
  );
});
