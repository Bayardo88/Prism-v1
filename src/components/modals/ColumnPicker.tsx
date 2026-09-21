import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Search as SearchGlyph } from '../icon/glyphs.js';

export interface ColumnTitleProps {
  title: ReactNode;
  /** e.g. "15 items". */
  count?: ReactNode;
  className?: string;
}

/** Column Title — the header cell of a selectable column list. */
export function ColumnTitle({ title, count, className }: ColumnTitleProps) {
  return (
    <div className={cx('scalar-column-title', className)}>
      <span className="scalar-column-title__title">{title}</span>
      {count && <span className="scalar-column-title__count">{count}</span>}
    </div>
  );
}

export interface ColumnItemProps {
  label: ReactNode;
  /** The unit or type, e.g. "Currency". */
  subText?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/** Column Item — a selectable column in the Add Column modal. */
export function ColumnItem({ label, subText, selected, onClick, className }: ColumnItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cx('scalar-column-item', className)}
    >
      <span className="scalar-column-item__label">{label}</span>
      {subText && <span className="scalar-column-item__sub">{subText}</span>}
    </button>
  );
}

export interface ModalSearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

/**
 * Search — the search field inside a modal.
 *
 * Search filters in place; it does not submit. If a query needs submitting,
 * pair it with a Button.
 */
export function ModalSearch({ className, ...rest }: ModalSearchProps) {
  return (
    <div className={cx('scalar-modal-search', className)}>
      <Icon size="s" tone="secondary"><SearchGlyph /></Icon>
      <input type="search" className="scalar-modal-search__input" placeholder="Search…" {...rest} />
    </div>
  );
}
