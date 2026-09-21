import { forwardRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Button, type ButtonProps } from './Button.js';

export interface ButtonIconProps extends Omit<ButtonProps, 'children' | 'leadingIcon' | 'trailingIcon'> {
  /** The glyph. Wrap it in `Icon` so it is tinted and sized from the ramp. */
  icon: ReactNode;
  /**
   * The accessible name. Required: the glyph is not the name, and an icon-only
   * control with no label is unusable with a screen reader.
   */
  label: string;
}

/**
 * Button_Icon — Button with an icon and no label.
 *
 * The same token contract as Button; only the label is gone. Use it only where
 * the icon is unambiguous on its own — close, more, expand. Everything else
 * takes a label.
 *
 * Accessibility: the visible box is the icon, not the target. The tap target
 * stays at Semantic: Sizing/Target/Minimum (44px) even when the drawn control
 * is smaller.
 */
export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(function ButtonIcon(
  { icon, label, className, ...rest },
  ref,
) {
  return (
    <Button ref={ref} aria-label={label} className={cx('scalar-button--icon-only', className)} {...rest}>
      {icon}
    </Button>
  );
});
