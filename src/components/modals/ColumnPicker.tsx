import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Search as SearchGlyph } from '../icon/glyphs.js';

export interface ColumnTitleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  /** e.g. "15 items". */
  count?: ReactNode;
}

/** Column Title — the header cell of a selectable column list (a group of `ColumnItem` toggles). */
export const ColumnTitle = forwardRef<HTMLDivElement, ColumnTitleProps>(function ColumnTitle(
  { title, count, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} {...rest} className={cx('scalar-column-title', className)}>
      <span className="scalar-column-title__title">{title}</span>
      {count && <span className="scalar-column-title__count">{count}</span>}
    </div>
  );
});

export interface ColumnItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode;
  /** The unit or type, e.g. "Currency". */
  subText?: ReactNode;
  /** Whether the column is picked. Exposed as `aria-pressed`. */
  selected?: boolean;
}

/**
 * Column Item — a selectable column in the Add Column modal.
 *
 * It is a toggle button (`aria-pressed`), not a listbox option: several can be
 * picked at once and each is its own tab stop, so no arrow-key model is owed.
 */
export const ColumnItem = forwardRef<HTMLButtonElement, ColumnItemProps>(function ColumnItem(
  { label, subText, selected, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      {...rest}
      aria-pressed={!!selected}
      className={cx('scalar-column-item', className)}
    >
      <span className="scalar-column-item__label">{label}</span>
      {subText && <span className="scalar-column-item__sub">{subText}</span>}
    </button>
  );
});

export interface ModalSearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Class for the wrapper. */
  className?: string;
}

/**
 * Search — the search field inside a modal.
 *
 * Search filters in place; it does not submit. If a query needs submitting,
 * pair it with a Button. The input is named "Search" unless you pass an
 * `aria-label` / `aria-labelledby`; `ref` points at the input.
 */
export const ModalSearch = forwardRef<HTMLInputElement, ModalSearchProps>(function ModalSearch(
  { className, ...rest },
  ref,
) {
  const named = rest['aria-label'] || rest['aria-labelledby'];
  return (
    <div role="search" className={cx('scalar-modal-search', className)}>
      <Icon size="s" tone="secondary"><SearchGlyph /></Icon>
      <input
        ref={ref}
        type="search"
        className="scalar-modal-search__input"
        placeholder="Search…"
        aria-label={named ? undefined : 'Search'}
        {...rest}
      />
    </div>
  );
});
