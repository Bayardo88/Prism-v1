import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type MouseEventHandler, type Ref } from 'react';
import { Slot } from '../../utils/Slot.js';
import type { AsChildProps } from '../../utils/types.js';

/**
 * Props shared by every navigation / menu row that is a link when it has an
 * `href` and a button otherwise. Anchor attributes (`target`, `rel`, …) and
 * button attributes (`type`, `disabled`) are both accepted.
 */
export interface LinkOrButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLElement>, 'onClick' | 'type'>,
    Pick<ButtonHTMLAttributes<HTMLElement>, 'type' | 'disabled' | 'form' | 'name' | 'value'>,
    AsChildProps {
  onClick?: MouseEventHandler<HTMLElement>;
}

/** @internal Renders `<a>` (with `href`), `<button>` (without), or the child via `asChild`. */
export const LinkOrButton = forwardRef<HTMLElement, LinkOrButtonProps>(function LinkOrButton(
  { asChild, href, type, disabled, children, ...rest },
  ref,
) {
  if (asChild) {
    return <Slot ref={ref} {...rest}>{children}</Slot>;
  }
  if (href && !disabled) {
    return <a ref={ref as Ref<HTMLAnchorElement>} href={href} {...rest}>{children}</a>;
  }
  const { target: _t, rel: _r, download: _d, hrefLang: _h, ...buttonRest } = rest;
  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={type ?? 'button'}
      disabled={disabled}
      {...(buttonRest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
});
