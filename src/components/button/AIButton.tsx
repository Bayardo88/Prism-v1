import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Sparkle } from '../icon/glyphs.js';

export interface AIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  /** Shows the AI mark. On by default — it is what makes the purple legible. */
  showIcon?: boolean;
}

/**
 * AI-Button — the entry point to an AI action.
 *
 * Reserved for genuinely generative actions. It is not a decorative treatment
 * for ordinary buttons: the purple always means "a model produced this".
 *
 * Tokens: Background/AI with Text/On AI and Icon/On AI. The gradient stroke in
 * Figma is the one intentional exception in the set and has no Dark-mode
 * counterpart — verify on Background/Page in Dark before shipping.
 */
export const AIButton = forwardRef<HTMLButtonElement, AIButtonProps>(function AIButton(
  { children, showIcon = true, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cx('scalar-ai-button', className)} {...rest}>
      {showIcon && (
        <Icon size="s" tone="inherit">
          <Sparkle />
        </Icon>
      )}
      {children}
    </button>
  );
});
