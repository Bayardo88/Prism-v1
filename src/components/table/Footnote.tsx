import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx.js';

export interface FootnoteProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** A currency marker such as `USD`, shown beside the reference. */
  currency?: string;
  /** Marks a figure a model produced. Takes Text/AI. */
  ai?: boolean;
  /** Adds the hover affordance for a footnote that reveals its source. */
  interactive?: boolean;
}

/**
 * Footnote — a superscript reference or currency marker on a figure.
 *
 * Type is Overline/S: the smallest role in the system and the only one licensed
 * for a marker this size. Never set it below the 12px floor (rule R10) — the
 * previous 8px treatment has been raised.
 */
export function Footnote({ children, currency, ai, interactive, className, ...rest }: FootnoteProps) {
  return (
    <sup
      className={cx('scalar-footnote', ai && 'scalar-footnote--ai', interactive && 'scalar-footnote--interactive', className)}
      {...rest}
    >
      {currency}
      {children}
    </sup>
  );
}
