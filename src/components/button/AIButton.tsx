import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactElement, type ReactNode, Children, cloneElement, isValidElement } from 'react';
import { Slot, VisuallyHidden, cx, type AsChildProps } from '../../utils/index.js';
import { Icon } from '../icon/Icon.js';
import { Sparkle, Spinner } from '../icon/glyphs.js';

interface AIButtonBase extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>, AsChildProps {
  /** Shows the AI mark. On by default — it is what makes the purple legible. */
  showIcon?: boolean;
  /** Blocks interaction and announces "Loading"; the button stays focusable. */
  loading?: boolean;
  /** Extra glyph after the label. */
  trailingIcon?: ReactNode;
}

/** A visible label, or an explicit accessible name — the AI mark alone is not a name. */
export type AIButtonProps = AIButtonBase &
  (
    | { children: ReactNode }
    | { children?: ReactNode; 'aria-label': string }
    | { children?: ReactNode; 'aria-labelledby': string }
  );

/**
 * AI-Button — the entry point to an AI action.
 *
 * Reserved for genuinely generative actions. It is not a decorative treatment
 * for ordinary buttons: the purple always means "a model produced this".
 * Supports `loading`, `trailingIcon` and `asChild` like Button; it has no
 * variant/size axes by design (one AI treatment).
 *
 * Tokens: Background/AI with Text/On AI and Icon/On AI. The gradient stroke in
 * Figma is the one intentional exception in the set and has no Dark-mode
 * counterpart — verify on Background/Page in Dark before shipping.
 */
export const AIButton = forwardRef<HTMLButtonElement, AIButtonProps>(function AIButton(
  { children, showIcon = true, loading = false, trailingIcon, asChild = false, className, type, disabled, onClick, ...rest },
  ref,
) {
  const lead = loading ? (
    <Icon size="s" tone="inherit" className="scalar-button__spinner"><Spinner /></Icon>
  ) : showIcon ? (
    <Icon size="s" tone="inherit"><Sparkle /></Icon>
  ) : null;
  const inner = (content: ReactNode) => (
    <>
      {lead}
      {content}
      {!loading && trailingIcon}
      {loading && <VisuallyHidden role="status">Loading</VisuallyHidden>}
    </>
  );
  const common = { 'aria-busy': loading || undefined, className: cx('scalar-ai-button', className), ...rest };

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
