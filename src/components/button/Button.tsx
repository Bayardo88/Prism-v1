import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Spinner } from '../icon/glyphs.js';

/** Style carries weight: how much attention the action deserves. */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

/**
 * Type carries meaning: what kind of action this is.
 *
 * A destructive action is `tone="negative"` at whatever variant its prominence
 * deserves. It is never a primary button recoloured by hand.
 */
export type ButtonTone = 'main' | 'positive' | 'warning' | 'negative';

/** S is dense table furniture only — never a primary action. */
export type ButtonSize = 's' | 'm' | 'l';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /** Swaps the label for a spinner and blocks interaction. */
  loading?: boolean;
  /** Persistent toggle state. Renders as `aria-pressed`. */
  selected?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Forces a visual state. For documentation and visual tests only. */
  forcedState?: 'hover' | 'pressed';
}

/**
 * Button — the primary action control.
 *
 * The Figma set is 225 variants: Style × Size × State × Type. In code, Style is
 * `variant`, Type is `tone`, Size is `size`, and the interaction states are CSS
 * pseudo-classes rather than props — which is why there is no `state`.
 *
 * Disabled is modelled as a Type in Figma, not a State, because a disabled
 * control has no hover, pressed, selected or focus. Here it is the native
 * `disabled` attribute, which has the same effect.
 *
 * Accessibility: `tone="warning"` pairs Background/Warning with Text/On Warning
 * (near-black) — white can never clear AA on yellow (rule R4). Minimum target
 * is 44px.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children, variant = 'primary', tone = 'main', size = 'm',
    loading = false, selected, leadingIcon, trailingIcon, forcedState,
    className, disabled, type = 'button', ...rest
  },
  ref,
) {
  const iconSize = size === 'l' ? 'm' : 's';
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-pressed={selected}
      data-state={forcedState}
      className={cx(
        'scalar-button',
        `scalar-button--${variant}`,
        `scalar-button--${tone}`,
        `scalar-button--${size}`,
        loading && 'scalar-button--loading',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon size={iconSize} tone="inherit" className="scalar-button__spinner">
          <Spinner />
        </Icon>
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});
