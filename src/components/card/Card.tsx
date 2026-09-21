import type { ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { ArrowDown, ArrowUp } from '../icon/glyphs.js';
import { Typography } from '../typography/Typography.js';

export interface CardItemProps {
  label: ReactNode;
  value: ReactNode;
  /**
   * Direction of change. Colour never carries the direction on its own — the
   * arrow glyph and the sign do (rule R8).
   */
  trend?: 'up' | 'down';
  className?: string;
}

/** Card_item — one label-and-value row inside Card. */
export function CardItem({ label, value, trend, className }: CardItemProps) {
  return (
    <div className={cx('scalar-card-item', trend && `scalar-card-item--${trend}`, className)}>
      <span className="scalar-card-item__label">{label}</span>
      <span className="scalar-card-item__value">
        {trend && (
          <Icon size="xs" tone="inherit">
            {trend === 'up' ? <ArrowUp /> : <ArrowDown />}
          </Icon>
        )}
        {value}
      </span>
    </div>
  );
}

export interface CardProps {
  title?: ReactNode;
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
 * affordance still needs a named action inside it.
 */
export function Card({ title, tag, action, children, className }: CardProps) {
  return (
    <section className={cx('scalar-card', className)}>
      {(title || tag || action) && (
        <header className="scalar-card__header">
          <Typography variant="heading" step="l" weight="semiBold" as="h3">
            {title}
          </Typography>
          {tag}
          {action}
        </header>
      )}
      <div className="scalar-card__items">{children}</div>
    </section>
  );
}
