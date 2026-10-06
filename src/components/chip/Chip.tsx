import {
  Children, cloneElement, forwardRef, isValidElement, useId,
  type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode,
} from 'react';
import { Slot, cx, type AsChildProps } from '../../utils/index.js';
import { Icon } from '../icon/Icon.js';
import { Close } from '../icon/glyphs.js';

export type ChipStyle = 'default' | 'info' | 'positive' | 'negative' | 'warning' | 'ai';
export type ChipSize = 's' | 'm' | 'l';

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'>, AsChildProps {
  children?: ReactNode;
  /** `ai` marks a count or label a model produced. Like every style it is a tint. */
  styleVariant?: ChipStyle;
  size?: ChipSize;
  /** A glyph or Avatar shown before the label (decorative — wrap glyphs in `Icon`). */
  leadingIcon?: ReactNode;
  /**
   * Makes the label a toggle button (`aria-pressed`) so the chip can act as a
   * filter. `onClick` is typed on the label button, not the root span, which is
   * why the root's own `onClick` is omitted: an unfocusable span with a click
   * handler is not keyboard reachable.
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Toggle state; passing it (or `onClick`) makes the label a `<button aria-pressed>`. */
  selected?: boolean;
  /**
   * Fires when the remove control is pressed, or Backspace/Delete is pressed on
   * the focused label button. Omit it to hide the control.
   */
  onRemove?: () => void;
  /**
   * Accessible name for the remove control. Without it the name is "Remove" plus
   * the chip's own text (also for non-string children), so it is always unique.
   */
  removeLabel?: string;
}

/**
 * Chip — a compact, removable label that states a fact about the item it sits on.
 *
 * Static by default (a `span`). Pass `onClick` or `selected` and the label
 * becomes a toggle button (Enter/Space, `aria-pressed`); pass `onRemove` and a
 * separate remove button (24px target) is added. `asChild` renders the single
 * child (e.g. a link) as the chip; the remove control is not rendered then.
 *
 * For the scope stack in Global Search use `SearchScopeChip` instead — that one
 * carries the PRISM type colours, which this component deliberately does not.
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  {
    children, styleVariant = 'info', size = 's', leadingIcon, onClick, selected, onRemove, removeLabel,
    asChild = false, className, ...rest
  },
  ref,
) {
  const uid = useId();
  const labelId = `${uid}-label`;
  const closeId = `${uid}-close`;
  const classes = cx('scalar-chip', `scalar-chip--${styleVariant}`, `scalar-chip--${size}`, className);
  const interactive = onClick !== undefined || selected !== undefined;

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;
    const element = child as ReactElement<{ children?: ReactNode }>;
    return (
      <Slot ref={ref as never} className={classes} {...rest}>
        {cloneElement(element, undefined, leadingIcon, <span className="scalar-chip__label">{element.props.children}</span>)}
      </Slot>
    );
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (onRemove && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      onRemove();
    }
  };

  return (
    <span ref={ref} className={classes} {...rest}>
      {leadingIcon}
      {interactive ? (
        <button
          type="button"
          id={labelId}
          className="scalar-chip__label scalar-chip__label--action"
          aria-pressed={selected}
          onClick={onClick}
          onKeyDown={onKeyDown}
        >
          {children}
        </button>
      ) : (
        <span id={labelId} className="scalar-chip__label">{children}</span>
      )}
      {onRemove && (
        <button
          type="button"
          id={closeId}
          className="scalar-chip__close scalar-target scalar-target--dense"
          onClick={onRemove}
          {...(removeLabel
            ? { 'aria-label': removeLabel }
            : { 'aria-label': 'Remove', 'aria-labelledby': `${closeId} ${labelId}` })}
        >
          <Icon size="xs" tone="inherit">
            <Close />
          </Icon>
        </button>
      )}
    </span>
  );
});
