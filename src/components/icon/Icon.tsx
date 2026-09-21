import { forwardRef, type ReactNode, type SVGProps } from 'react';
import { cx } from '../../utils/cx.js';

export type IconSize = 'xs' | 's' | 'm' | 'l' | 'xl';

/**
 * Icon tints. Glyphs carry their own ramp so they can clear WCAG 1.4.11 on
 * their own, independently of the text beside them.
 */
export type IconTone =
  | 'primary' | 'secondary' | 'inverse' | 'disabled'
  | 'brand' | 'positive' | 'warning' | 'negative' | 'ai' | 'onBrand'
  | 'inherit';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /**
   * The glyph, as SVG path content.
   *
   * Glyphs ship from the separate `SDS_Main icons` Figma library, which is not
   * part of this package. Export the glyph you need and pass its path content
   * here, or pass a full icon component via `as`.
   */
  children?: ReactNode;
  /** Bound to Semantic: Sizing/Icon. Never hand-size an icon. */
  size?: IconSize;
  tone?: IconTone;
  /**
   * An icon that carries meaning needs a label; one that repeats adjacent text
   * does not and stays hidden from assistive technology (the default).
   */
  label?: string;
}

/**
 * Icon — sizing and tint wrapper for a glyph.
 *
 * Icons imported from SDS_Main icons default to Text/On Brand (white) and are
 * invisible on a light surface until re-tinted. This component always sets a
 * tint, so anything rendered through it is safe by default.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { children, size = 's', tone = 'secondary', label, className, ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      className={cx('scalar-icon', `scalar-icon--${size}`, `scalar-icon--${tone}`, className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
});
