import {
  Children, cloneElement, forwardRef, isValidElement, useId,
  type HTMLAttributes, type ReactElement, type ReactNode,
} from 'react';
import { Slot, VisuallyHidden, cx, type AsChildProps } from '../../utils/index.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, ArrowUp } from '../icon/glyphs.js';
import { Typography } from '../typography/Typography.js';

export interface CardItemProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /**
   * Direction of change. Colour never carries the direction on its own — the
   * arrow glyph and the sign do (rule R8). The arrow is decorative; the
   * direction is also announced as visually hidden text (`trendLabel`).
   */
  trend?: 'up' | 'down';
  /** Spoken direction. Defaults to "Increase" / "Decrease" — override to localise. */
  trendLabel?: string;
  className?: string;
}

/** Card_item — one label-and-value row inside Card. */
export const CardItem = forwardRef<HTMLDivElement, CardItemProps>(function CardItem(
  { label, value, trend, trendLabel, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      data-trend={trend}
      className={cx('scalar-card-item', trend && `scalar-card-item--${trend}`, className)}
      {...rest}
    >
      <span className="scalar-card-item__label">{label}</span>
      <span className="scalar-card-item__value">
        {trend && (
          <>
            <Icon size="xs" tone="inherit">
              {trend === 'up' ? <ArrowUp /> : <ArrowDown />}
            </Icon>
            <VisuallyHidden>{trendLabel ?? (trend === 'up' ? 'Increase' : 'Decrease')}: </VisuallyHidden>
          </>
        )}
        {value}
      </span>
    </div>
  );
});

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'>, AsChildProps {
  title?: ReactNode;
  /** The title's heading level (`h1`–`h6`). Default 3. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** A Chip or Badge sitting beside the title. */
  tag?: ReactNode;
  /** The named action. A card is a surface, not a button. */
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Card — a summary panel for one company or fund.
 *
 * The card is a surface, not a button. If the whole card is clickable, the
 * affordance still needs a named action inside it. With a `title` the card is
 * a named region (`aria-labelledby` the heading). `asChild` renders the single
 * child element (e.g. an `<article>` or `<li>`) as the card root, with the
 * header and item list placed inside it.
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { title, headingLevel = 3, tag, action, children, className, asChild = false, ...rest },
  ref,
) {
  const titleId = useId();
  const header = (title || tag || action) && (
    <header className="scalar-card__header">
      {title && (
        <Typography variant="heading" step="l" weight="semiBold" as={`h${headingLevel}`} id={titleId}>
          {title}
        </Typography>
      )}
      {tag}
      {action}
    </header>
  );
  const classes = cx('scalar-card', className);
  const labelled = title ? titleId : undefined;

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;
    const element = child as ReactElement<{ children?: ReactNode }>;
    return (
      <Slot ref={ref} className={classes} aria-labelledby={labelled} {...rest}>
        {cloneElement(element, undefined, header, <div className="scalar-card__items">{element.props.children}</div>)}
      </Slot>
    );
  }

  return (
    <section ref={ref} className={classes} aria-labelledby={labelled} {...rest}>
      {header}
      <div className="scalar-card__items">{children}</div>
    </section>
  );
});
