import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Close } from '../icon/glyphs.js';

export type ChipStyle = 'default' | 'info' | 'positive' | 'negative' | 'warning' | 'ai';
export type ChipSize = 's' | 'm' | 'l';

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  children?: ReactNode;
  /** `ai` marks a count or label a model produced. Like every style it is a tint. */
  styleVariant?: ChipStyle;
  size?: ChipSize;
  /** Fires when the remove control is pressed. Omit it to hide the control. */
  onRemove?: () => void;
  /** Accessible name for the remove control. */
  removeLabel?: string;
}

/**
 * Chip — a compact, removable label that states a fact about the item it sits on.
 *
 * A chip is not a button: if the whole thing triggers an action, use Button.
 *
 * For the scope stack in Global Search use `SearchScopeChip` instead — that one
 * carries the PRISM type colours, which this component deliberately does not.
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  { children, styleVariant = 'info', size = 's', onRemove, removeLabel, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx('scalar-chip', `scalar-chip--${styleVariant}`, `scalar-chip--${size}`, className)}
      {...rest}
    >
      <span className="scalar-chip__label">{children}</span>
      {onRemove && (
        <button
          type="button"
          className="scalar-chip__close"
          onClick={onRemove}
          aria-label={removeLabel ?? `Remove ${typeof children === 'string' ? children : 'item'}`}
        >
          <Icon size="xs" tone="inherit">
            <Close />
          </Icon>
        </button>
      )}
    </span>
  );
});
