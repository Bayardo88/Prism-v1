import {
  Children, cloneElement, forwardRef, isValidElement,
  type ButtonHTMLAttributes, type MouseEvent, type ReactElement, type ReactNode,
} from 'react';
import { Slot, VisuallyHidden, cx, type AsChildProps } from '../../utils/index.js';
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
export type ButtonSize = 'xs' | 's' | 'm' | 'l';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>, AsChildProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  /**
   * Swaps the leading icon for a spinner and blocks interaction. The button
   * stays focusable (`aria-disabled`, not `disabled`), is marked `aria-busy`
   * and announces "Loading" through a status region.
   */
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
 * `asChild` renders the single child element (an `<a>`, a router Link) with the
 * button classes, props and ref merged on. `leadingIcon`, `trailingIcon` and the
 * loading spinner are inserted inside that child.
 *
 * Accessibility: `tone="warning"` pairs Background/Warning with Text/On Warning
 * (near-black) — white can never clear AA on yellow (rule R4). The drawn
 * control is 24/32/40/48px (xs/s/m/l); only `xs` falls below the 32px dense
 * floor, and all sizes meet WCAG 2.5.8 (24px minimum).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children, variant = 'primary', tone = 'main', size = 'm',
    loading = false, selected, leadingIcon, trailingIcon, forcedState, asChild = false,
    className, disabled, type, onClick, ...rest
  },
  ref,
) {
  const iconSize = size === 'l' ? 'm' : 's';
  const spinner = (
    <Icon size={iconSize} tone="inherit" className="scalar-button__spinner">
      <Spinner />
    </Icon>
  );
  const status = loading ? <VisuallyHidden role="status">Loading</VisuallyHidden> : null;
  const inner = (content: ReactNode) => (
    <>
      {loading ? spinner : leadingIcon}
      {content}
      {!loading && trailingIcon}
      {status}
    </>
  );

  const common = {
    'aria-busy': loading || undefined,
    'aria-pressed': selected,
    'data-state': forcedState,
    className: cx(
      'scalar-button',
      `scalar-button--${variant}`,
      `scalar-button--${tone}`,
      `scalar-button--${size}`,
      loading && 'scalar-button--loading',
      className,
    ),
    ...rest,
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;
    const element = child as ReactElement<{ children?: ReactNode }>;
    const blocked = disabled || loading;
    return (
      <Slot
        ref={ref as never}
        {...common}
        aria-disabled={blocked || undefined}
        onClick={(event: MouseEvent<HTMLElement>) => {
          if (blocked) event.preventDefault();
          else (onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
        }}
      >
        {cloneElement(element, undefined, inner(element.props.children))}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      disabled={disabled}
      aria-disabled={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      {...common}
    >
      {inner(children)}
    </button>
  );
});
