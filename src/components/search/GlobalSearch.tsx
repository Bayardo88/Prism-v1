import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { Icon } from '../icon/Icon.js';
import { Search as SearchGlyph } from '../icon/glyphs.js';
import { Scrim } from '../core/Scrim.js';
import { KeyHint } from './KeyHint.js';
import { SearchResultRow } from './SearchResultRow.js';
import { SearchScopeChip } from './SearchScopeChip.js';
import { SearchSectionHeader } from './SearchSectionHeader.js';
import { prismScopeTypes, type PrismScopeType, type PrismType } from './prism.js';

export interface SearchResult {
  id: string;
  type: PrismType;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
}

export interface SearchScope {
  type: PrismScopeType;
  label: string;
  id?: string;
}

export interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  /**
   * Results in relevance order. They are grouped into contiguous runs by type
   * in the order they arrive — never re-sorted alphabetically.
   */
  results: SearchResult[];
  /** The scope stack, outermost first. */
  scopes?: SearchScope[];
  onScopesChange?: (scopes: SearchScope[]) => void;
  onSelect?: (result: SearchResult) => void;
  /** Shown in the footer, e.g. the current firm. */
  footer?: ReactNode;
  className?: string;
}

/** Groups results into contiguous runs of one type, preserving relevance order. */
function groupByRun(results: SearchResult[]): Array<{ type: PrismType; items: SearchResult[] }> {
  const runs: Array<{ type: PrismType; items: SearchResult[] }> = [];
  for (const r of results) {
    const last = runs[runs.length - 1];
    if (last && last.type === r.type) last.items.push(r);
    else runs.push({ type: r.type, items: [r] });
  }
  return runs;
}

/**
 * Global Search — the command palette for the whole product.
 *
 * One overlay, opened from anywhere with ⌘K, that searches every entity the
 * user can reach and runs commands against them. It is not a filter and not a
 * page search: it crosses firms, companies, documents, versions and settings in
 * a single list.
 *
 * Scope is a stack, not a filter. Tab pushes the highlighted result onto the
 * scope, Backspace pops it. The chips in the bar are that stack, outermost
 * first. Do not show more than three: past Firm → Company → Document the user
 * has lost the thread.
 *
 * Accessibility: the overlay takes focus on open and hands it back to the
 * trigger on close. ↑↓ move the highlight without moving focus out of the input
 * (`aria-activedescendant`). Escape closes from any scope depth.
 */
export function GlobalSearch({
  open, onClose, query, onQueryChange, results,
  scopes = [], onScopesChange, onSelect, footer, className,
}: GlobalSearchProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const runs = useMemo(() => groupByRun(results), [results]);

  useEffect(() => setActiveIndex(0), [query, results.length]);

  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement;
    inputRef.current?.focus();

    // Escape is bound at the document, not the input: the user can click or Tab
    // onto a result row, and the overlay still has to close from there.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      // Hand focus back to whatever opened the palette.
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const active = results[activeIndex];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Escape is handled by the document-level listener above, so it closes the
    // overlay wherever focus happens to be.
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
      return;
    }
    if (e.key === 'Enter' && active) {
      e.preventDefault();
      onSelect?.(active);
      return;
    }
    // Tab pushes the highlighted result onto the scope stack, but only for the
    // five scopable types — a Page or an Action is somewhere you land.
    if (e.key === 'Tab' && active && !e.shiftKey) {
      if (prismScopeTypes.includes(active.type as PrismScopeType)) {
        e.preventDefault();
        onScopesChange?.([
          ...scopes,
          { type: active.type as PrismScopeType, label: String(active.title), id: active.id },
        ]);
        onQueryChange('');
      }
      return;
    }
    // Backspace pops the innermost scope, but only from an empty query.
    if (e.key === 'Backspace' && query === '' && scopes.length) {
      e.preventDefault();
      onScopesChange?.(scopes.slice(0, -1));
    }
  };

  const deepest = scopes[scopes.length - 1];
  const placeholder = deepest ? `Search in ${deepest.label}…` : 'Search everything…';

  let index = -1;

  return (
    <>
      <Scrim onDismiss={onClose} />
      <div className="scalar-global-search__layer">
        <div className={cx('scalar-global-search', className)} role="dialog" aria-modal="true" aria-label="Global search">
          <div className="scalar-global-search__bar">
            <Icon size="m" tone="secondary"><SearchGlyph /></Icon>
            {scopes.length > 0 && (
              <span className="scalar-global-search__scopes">
                {scopes.map((s, i) => (
                  <SearchScopeChip key={s.id ?? `${s.type}-${i}`} type={s.type}>
                    {s.label}
                  </SearchScopeChip>
                ))}
              </span>
            )}
            <input
              ref={inputRef}
              className="scalar-global-search__input"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
              aria-autocomplete="list"
            />
          </div>

          <div className="scalar-global-search__results" id={listId} role="listbox" aria-label="Search results">
            {results.length === 0 ? (
              <div className="scalar-global-search__empty">No results for “{query}”.</div>
            ) : (
              runs.map((run, ri) => (
                <div key={`${run.type}-${ri}`} role="group" aria-label={run.type}>
                  <SearchSectionHeader type={run.type} />
                  {run.items.map((item) => {
                    index += 1;
                    const isActive = index === activeIndex;
                    return (
                      <SearchResultRow
                        key={item.id}
                        id={`${listId}-${item.id}`}
                        type={item.type}
                        title={item.title}
                        subtitle={item.subtitle}
                        icon={item.icon}
                        selected={isActive}
                        onClick={() => onSelect?.(item)}
                        hints={
                          <>
                            <KeyHint keyGlyph="↵" label="go" />
                            {prismScopeTypes.includes(item.type as PrismScopeType) && (
                              <KeyHint keyGlyph="Tab" label="set scope" />
                            )}
                          </>
                        }
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>

          <div className="scalar-global-search__footer">
            <span className="scalar-search-result__hints">
              <KeyHint keyGlyph="↑↓" label="navigate" />
              <KeyHint keyGlyph="↵" label="go" />
              <KeyHint keyGlyph="Tab" label="set scope" />
              <KeyHint keyGlyph="Esc" label="close" />
            </span>
            {footer}
          </div>
        </div>
      </div>
    </>
  );
}
