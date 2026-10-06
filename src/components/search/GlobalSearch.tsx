import { forwardRef, useEffect, useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx.js';
import { composeRefs } from '../../utils/refs.js';
import { useOverlay } from '../../utils/useOverlay.js';
import { VisuallyHidden } from '../../utils/VisuallyHidden.js';
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

export interface GlobalSearchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'results'> {
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
  /**
   * Replaces the default result row. Render a `SearchResultRow` (or your own
   * option) and spread `id` onto it so `aria-activedescendant` can find it.
   */
  renderResult?: (result: SearchResult, state: { id: string; selected: boolean; select: () => void }) => ReactNode;
  /** Accessible name of the dialog. Default "Global search". */
  'aria-label'?: string;
}

function isScopeType(type: PrismType): type is PrismScopeType {
  return (prismScopeTypes as readonly PrismType[]).includes(type);
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
 * Accessibility: a modal `dialog` (focus is trapped, the page does not scroll).
 * Focus moves to the search input on open and returns to whatever opened the
 * palette on close. The input is a labelled `combobox`; ↑↓ move the highlight
 * without moving focus out of it (`aria-activedescendant`), and the highlighted
 * row scrolls into view. Result count is announced through a polite live region.
 * Escape closes from any scope depth. `open` and `query` are controlled.
 */
export const GlobalSearch = forwardRef<HTMLDivElement, GlobalSearchProps>(function GlobalSearch(
  {
    open, onClose, query, onQueryChange, results,
    scopes = [], onScopesChange, onSelect, footer, renderResult, className,
    'aria-label': ariaLabel = 'Global search', ...rest
  },
  ref,
) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset the highlight when the list changes — during render, not in an effect,
  // so there is never a frame with a stale index.
  const resetKey = `${query}\u0000${results.length}`;
  const [seenKey, setSeenKey] = useState(resetKey);
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setActiveIndex(0);
  }

  const runs = useMemo(() => groupByRun(results), [results]);
  useOverlay({ open, onClose, containerRef: dialogRef, modal: true, initialFocus: inputRef });

  const activeIdx = results.length ? Math.min(activeIndex, results.length - 1) : -1;
  const active = results[activeIdx];
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const activeId = active ? optionId(activeIdx) : undefined;

  useEffect(() => {
    if (!open || !activeId) return;
    document.getElementById(activeId)?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeId]);

  if (!open) return null;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Escape and Tab-trapping belong to useOverlay (document level), so Escape
    // closes the palette wherever focus is.
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(results.length ? (activeIdx + 1) % results.length : 0);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(results.length ? (activeIdx - 1 + results.length) % results.length : 0);
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
      if (isScopeType(active.type)) {
        e.preventDefault();
        onScopesChange?.([...scopes, { type: active.type, label: String(active.title), id: active.id }]);
        onQueryChange('');
        setActiveIndex(0);
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
  const hasResults = results.length > 0;

  let index = -1;

  return (
    <>
      <Scrim onDismiss={onClose} />
      <div className="scalar-global-search__layer">
        <div
          {...rest}
          ref={composeRefs(ref, dialogRef)}
          className={cx('scalar-global-search', className)}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
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
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label={deepest ? `Search in ${deepest.label}` : 'Search'}
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={hasResults}
              aria-controls={hasResults ? listId : undefined}
              aria-activedescendant={activeId}
              aria-autocomplete="list"
            />
          </div>

          <VisuallyHidden role="status" aria-live="polite">
            {hasResults ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'No results'}
          </VisuallyHidden>

          {hasResults ? (
            <div className="scalar-global-search__results" id={listId} role="listbox" aria-label="Search results">
              {runs.map((run, ri) => {
                const headerId = `${listId}-group-${ri}`;
                return (
                  <div key={`${run.type}-${ri}`} role="group" aria-labelledby={headerId}>
                    <SearchSectionHeader id={headerId} type={run.type} />
                    {run.items.map((item) => {
                      index += 1;
                      const id = optionId(index);
                      const selected = index === activeIdx;
                      const select = () => onSelect?.(item);
                      if (renderResult) return <span key={item.id}>{renderResult(item, { id, selected, select })}</span>;
                      return (
                        <SearchResultRow
                          key={item.id}
                          id={id}
                          type={item.type}
                          title={item.title}
                          subtitle={item.subtitle}
                          icon={item.icon}
                          selected={selected}
                          onClick={select}
                          hints={
                            <>
                              <KeyHint keyGlyph="↵" label="go" />
                              {isScopeType(item.type) && <KeyHint keyGlyph="Tab" label="set scope" />}
                            </>
                          }
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="scalar-global-search__results">
              <div className="scalar-global-search__empty">No results for “{query}”.</div>
            </div>
          )}

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
});
