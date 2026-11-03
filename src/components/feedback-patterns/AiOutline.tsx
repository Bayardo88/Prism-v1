import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Slot, cx, type AsChildProps } from '../../utils/index.js';

export interface AiOutlineProps extends HTMLAttributes<HTMLDivElement>, AsChildProps {
  /**
   * A comet of the AI gradient travels round the outline while AI works on
   * the item. `false` holds the whole ring still (the item is AI-made but
   * nothing is running). Default `true`.
   */
  active?: boolean;
  children?: ReactNode;
}

/**
 * AI Outline — a 3px ring in the AI gradient (violet → blue → teal → pink,
 * `color.gradient.ai.*`), drawn on its own layer over the edge of the surface
 * it wraps. While `active`, a short comet of the gradient orbits the edge once
 * every 3s with a matching glow just outside the edge, following the corners, and a full turn ends where it began. Still,
 * or under reduced motion, the whole ring shows at rest.
 *
 * The surface keeps its own fill and border: the ring never paints them. Use
 * `asChild` to put the outline on your own element (a card, the bell); it
 * follows that element's corner radius.
 *
 * Decorative: the outline never says "working" on its own (R8), so pair it
 * with words or a `Spinner`. Figma: AI Outline (components file, page 24). Guide: docs/ai-outline.md.
 */
export const AiOutline = forwardRef<HTMLDivElement, AiOutlineProps>(function AiOutline(
  { active = true, asChild = false, className, children, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      ref={ref}
      className={cx('scalar-ai-outline', active && 'scalar-ai-outline--active', className)}
      {...rest}
    >
      {children}
    </Comp>
  );
});
