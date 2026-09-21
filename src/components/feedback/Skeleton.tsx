import type { CSSProperties } from 'react';
import { cx } from '../../utils/cx.js';

export type SkeletonType = 'text' | 'title' | 'circle' | 'block';

export interface SkeletonProps {
  type?: SkeletonType;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
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
 */
export function Skeleton({ type = 'text', width, height, className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cx('scalar-skeleton', `scalar-skeleton--${type}`, className)}
      style={{ width, height, ...style }}
    />
  );
}
