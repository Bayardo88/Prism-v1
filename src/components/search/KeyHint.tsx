import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx.js';

export interface KeyHintProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * The key, as its real glyph — ↑↓ ↵ Tab ⌫ Esc. Never a spelled-out name.
   */
  keyGlyph: string;
  /** A lower-case verb phrase: "go", "set scope". */
  label?: string;
}

/**
 * Key Hint — a keycap paired with the action it performs.
 *
 * Accessibility: decorative, and hidden from assistive technology. The shortcut
 * it advertises must also exist somewhere the keyboard and a screen reader can
 * reach — a hint that renders only on hover is not documentation (rule R8).
 */
export const KeyHint = forwardRef<HTMLSpanElement, KeyHintProps>(function KeyHint(
  { keyGlyph, label, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx('scalar-key-hint', className)} aria-hidden {...rest}>
      <kbd className="scalar-key-hint__cap">{keyGlyph}</kbd>
      {label && <span className="scalar-key-hint__label">{label}</span>}
    </span>
  );
});
