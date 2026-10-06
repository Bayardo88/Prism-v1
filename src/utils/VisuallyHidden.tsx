import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from './cx.js';

/** Content for screen readers only. Uses the shared `.scalar-visually-hidden` utility. */
export const VisuallyHidden = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function VisuallyHidden(
  { className, ...rest },
  ref,
) {
  return <span ref={ref} className={cx('scalar-visually-hidden', className)} {...rest} />;
});
