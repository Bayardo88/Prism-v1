import { forwardRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Button, type ButtonProps } from './Button.js';

/**
 * The accessible name, required by the compiler: `label` (mapped to
 * `aria-label`) or `aria-labelledby`. A bare `aria-label` is accepted too.
 */
export type ButtonIconName =
  | { label: string; 'aria-labelledby'?: string; 'aria-label'?: never }
  | { label?: never; 'aria-labelledby': string; 'aria-label'?: string }
  | { label?: never; 'aria-labelledby'?: never; 'aria-label': string };

export type ButtonIconProps = Omit<ButtonProps, 'children' | 'leadingIcon' | 'trailingIcon' | 'aria-label' | 'aria-labelledby'> &
  ButtonIconName & {
    /** The glyph. Wrap it in `Icon` so it is tinted and sized from the ramp. */
    icon: ReactNode;
  };

/**
 * Button_Icon — Button with an icon and no label.
 *
 * The same token contract as Button (including `asChild`); only the label is
 * gone. Use it only where the icon is unambiguous on its own — close, more,
 * expand. Everything else takes a visible label.
 *
 * Accessibility: an accessible name is required by the type (`label`,
 * `aria-label` or `aria-labelledby`); `label` is the primary form and becomes
 * `aria-label`. The drawn control is the target: 24px (`xs`), 32px (`s`),
 * 40px (`m`), 48px (`l`). WCAG 2.5.8 needs 24px, so every size passes; the
 * 44px target token is not applied here — use `m` or `l` for touch-first
 * surfaces. Pair with `Tooltip` where the icon alone may be unclear.
 */
export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(function ButtonIcon(
  { icon, label, className, ...rest },
  ref,
) {
  return (
    <Button ref={ref} {...rest} aria-label={label ?? rest['aria-label']} className={cx('scalar-button--icon-only', className)}>
      {icon}
    </Button>
  );
});
