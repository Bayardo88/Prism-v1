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
   * The glyph, as SVG body content: `<Icon><icons.Search /></Icon>` (the
   * product set) or `<Icon><glyphs.Check /></Icon>` (structural aliases).
   */
  children?: ReactNode;
  /** Bound to Semantic: Sizing/Icon. Never hand-size an icon. */
  size?: IconSize;
  tone?: IconTone;
  /**
   * Opt-in accessible name. Icons are decorative (`aria-hidden`) by default;
   * one that carries meaning on its own needs a label, which switches it to
   * `role="img"`. A consumer-supplied `aria-label` / `aria-labelledby` has the
   * same effect.
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
  const named = Boolean(label || rest['aria-label'] || rest['aria-labelledby']);
  return (
    <svg
      ref={ref}
      className={cx('scalar-icon', `scalar-icon--${size}`, `scalar-icon--${tone}`, className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      {...rest}
      aria-hidden={named ? undefined : true}
      role={named ? 'img' : undefined}
      aria-label={label ?? rest['aria-label']}
    >
      {children}
    </svg>
  );
});
