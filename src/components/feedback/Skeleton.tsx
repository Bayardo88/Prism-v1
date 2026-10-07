import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export type SkeletonType = 'text' | 'title' | 'circle' | 'block';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  type?: SkeletonType;
  width?: number | string;
  height?: number | string;
}

/**
 * Skeleton — the shape of content that has not loaded yet.
 *
 * A skeleton must match the layout it replaces — same line count, same widths,
 * same positions. If the real content lands somewhere else, the page jumps and
 * the skeleton has made things worse.
 *
 * Use only for first loads of a known shape. For a refresh of content already
 * on screen, keep the old content and show progress instead of blanking it.
 *
 * Under 300ms, show nothing at all — a flash of skeleton reads as a glitch.
 *
 * Accessibility: each block is `aria-hidden`, so it is silent on its own. Put
 * `aria-busy="true"` on the region that is loading (and a visually hidden
 * "Loading…" status, or use `SkeletonGroup`) so screen-reader users know. The
 * pulse is switched off under prefers-reduced-motion.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { type = 'text', width, height, className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('scalar-skeleton', `scalar-skeleton--${type}`, className)}
      style={{ width, height, ...style }}
      {...rest}
      aria-hidden
    />
  );
});

export interface SkeletonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Text announced while loading. Default "Loading…". */
  label?: string;
}

/**
 * Skeleton Group — wraps several skeletons in one `aria-busy` region with a
 * single polite "Loading…" announcement. Replace it with the real content when
 * the data arrives.
 */
export const SkeletonGroup = forwardRef<HTMLDivElement, SkeletonGroupProps>(function SkeletonGroup(
  { label = 'Loading…', className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} aria-busy="true" className={className} {...rest}>
      <span role="status" className="scalar-visually-hidden">{label}</span>
      {children}
    </div>
  );
});
