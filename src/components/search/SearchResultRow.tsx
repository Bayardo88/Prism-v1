import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { prismBadgeLabel, type PrismType } from './prism.js';

export interface SearchResultRowProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title' | 'type'> {
  /**
   * The PRISM contract. Moves as one piece: it sets the tile fill, the glyph
   * tint and the badge together. Never mix them — a row tinted Entity/Company
   * carrying a DOCUMENT badge tells the user something false.
   */
  type: PrismType;
  title: ReactNode;
  subtitle?: ReactNode;
  /** The glyph inside the tile. Swap it freely; the type keeps the colour. */
  icon?: ReactNode;
  selected?: boolean;
  /** Key hints shown on the selected row. */
  hints?: ReactNode;
  /** Hides the type badge. The badge is what keeps the colour honest. */
  hideBadge?: boolean;
}

/**
 * Search Result Row — one hit inside Global Search.
 *
 * Semantic colour states what the result is. It never states whether the user
 * may open it.
 *
 * Accessibility: the row is 62px and clears Target/Minimum. Selection is
 * carried by the 2px Stroke/Brand edge and the visible key hints as well as the
 * fill, so it survives greyscale and colour-vision deficiency (rule R8).
 */
export const SearchResultRow = forwardRef<HTMLButtonElement, SearchResultRowProps>(function SearchResultRow(
  { type, title, subtitle, icon, selected, hints, hideBadge, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected}
      data-prism={type}
      className={cx('scalar-search-result', className)}
      {...rest}
    >
      <span className="scalar-search-result__tile">{icon}</span>
      <span className="scalar-search-result__body">
        <span className="scalar-search-result__title">{title}</span>
        {subtitle && <span className="scalar-search-result__subtitle">{subtitle}</span>}
      </span>
      {!hideBadge && <span className="scalar-search-result__badge">{prismBadgeLabel[type]}</span>}
      {selected && hints && <span className="scalar-search-result__hints">{hints}</span>}
    </button>
  );
});
