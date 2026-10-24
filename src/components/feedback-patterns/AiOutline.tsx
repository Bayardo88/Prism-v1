import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Slot, cx, type AsChildProps } from '../../utils/index.js';

export interface AiOutlineProps extends HTMLAttributes<HTMLDivElement>, AsChildProps {
  /**
   * The colour travels round the outline while AI works on the item. `false`
   * holds the outline still (the item is AI-made but nothing is running).
   * Default `true`.
   */
  active?: boolean;
  children?: ReactNode;
}

/**
 * AI Outline — a 2px outline painted with the AI gradient (violet → blue →
 * teal → pink, `color.gradient.ai.*`). While `active`, the colours orbit the
 * outline once every 6s, following the corners, and a full turn ends where it
 * began. Reduced motion holds it still.
 *
 * It wraps a surface (a card, a notification) and paints that surface's fill
 * inside the outline; set `--ai-outline-fill` to change it from
 * `bg.surface`. Use `asChild` to put the outline on your own element.
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
