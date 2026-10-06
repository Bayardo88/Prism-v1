import { createRef, useState } from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { checkA11y, renderWithProvider } from '../../test/render.js';
import {
  GlobalSearch, KeyHint, SearchResultRow, SearchScopeChip, SearchSectionHeader,
  type SearchResult, type SearchScope,
} from './index.js';

const RESULTS: SearchResult[] = [
  { id: 'c/1', type: 'company', title: 'Acme', subtitle: 'Company' },
  { id: 'c 2', type: 'company', title: 'Beta' },
  { id: 'p1', type: 'page', title: 'Valuations' },
];

describe('leaf components', () => {
  it('KeyHint renders a kbd, hidden from AT, forwards ref/className/data-testid', () => {
    const ref = createRef<HTMLSpanElement>();
    renderWithProvider(<KeyHint ref={ref} keyGlyph="↵" label="go" className="x" data-testid="k" />);
    expect(ref.current).toBe(screen.getByTestId('k'));
    expect(ref.current).toHaveClass('scalar-key-hint', 'x');
    expect(ref.current).toHaveAttribute('aria-hidden', 'true');
    expect(ref.current!.querySelector('kbd')).toHaveTextContent('↵');
  });

  it('SearchScopeChip announces the scope', async () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = renderWithProvider(
      <SearchScopeChip ref={ref} type="company" className="x" data-testid="s">Acme</SearchScopeChip>,
    );
    expect((await checkA11y(container)).violations).toEqual([]);
    expect(ref.current).toBe(screen.getByTestId('s'));
    expect(ref.current).toHaveClass('scalar-scope-chip', 'x');
    expect(ref.current).toHaveTextContent('Scoped to Company: Acme');
  });

  it('SearchSectionHeader forwards ref and has no presentation role', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithProvider(<SearchSectionHeader ref={ref} type="company" id="h" className="x" data-testid="h" />);
    expect(ref.current).toBe(screen.getByTestId('h'));
    expect(ref.current).toHaveClass('x');
    expect(ref.current).not.toHaveAttribute('role');
    expect(ref.current).toHaveTextContent('Companies');
  });

  it('SearchResultRow is an option, not a tab stop, with aria-selected always set', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithProvider(
      <div role="listbox" aria-label="r"><SearchResultRow ref={ref} type="firm" title="T" className="x" data-testid="r" /></div>,
    );
    expect(ref.current).toBe(screen.getByTestId('r'));
    expect(ref.current).toHaveClass('x');
    expect(ref.current).toHaveAttribute('role', 'option');
    expect(ref.current).toHaveAttribute('aria-selected', 'false');
    expect(ref.current).toHaveAttribute('tabindex', '-1');
  });
});

function Harness({ onSelect, results = RESULTS }: { onSelect?: (r: SearchResult) => void; results?: SearchResult[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scopes, setScopes] = useState<SearchScope[]>([]);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open search</button>
      <GlobalSearch
        open={open}
        onClose={() => setOpen(false)}
        query={query}
        onQueryChange={setQuery}
        results={results}
        scopes={scopes}
        onScopesChange={setScopes}
        onSelect={onSelect}
        data-testid="gs"
        className="x"
      />
    </>
  );
}

describe('GlobalSearch', () => {
  it('has no axe violations, forwards ref, className and data-testid', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithProvider(
      <GlobalSearch ref={ref} open onClose={() => {}} query="a" onQueryChange={() => {}} results={RESULTS} className="x" data-testid="gs" />,
    );
    expect((await checkA11y(container)).violations).toEqual([]);
    expect(ref.current).toBe(screen.getByTestId('gs'));
    expect(ref.current).toHaveClass('scalar-global-search', 'x');
  });

  it('labels the input, names groups by their header and exposes a live count', () => {
    renderWithProvider(<GlobalSearch open onClose={() => {}} query="" onQueryChange={() => {}} results={RESULTS} />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('group', { name: 'Companies' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Pages' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('3 results');
    const options = screen.getAllByRole('option');
    expect(options.every((o) => o.getAttribute('tabindex') === '-1')).toBe(true);
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0]!.id);
    expect(options[0]!.id).toMatch(/^[^\s/]+$/);
  });

  it('collapses the combobox and announces when there are no results', () => {
    renderWithProvider(<GlobalSearch open onClose={() => {}} query="zz" onQueryChange={() => {}} results={[]} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('No results');
  });

  it('moves focus to the input on open, navigates with arrows, selects with Enter, Esc closes and returns focus', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProvider(<Harness onSelect={onSelect} />);
    const opener = screen.getByRole('button', { name: 'Open search' });
    await user.click(opener);
    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[1]!.id);
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(options[2]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(RESULTS[2]);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(opener).toHaveFocus();
  });

  it('does not steal focus back while typing and keeps Tab inside the dialog', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open search' }));
    const input = screen.getByRole('combobox');
    await user.keyboard('abc');
    expect(input).toHaveValue('abc');
    expect(input).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(screen.getByRole('dialog')).getByRole('combobox')).toHaveFocus();
  });

  it('Tab pushes a scopable result as a scope and Backspace pops it', async () => {
    const user = userEvent.setup();
    renderWithProvider(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open search' }));
    await user.keyboard('{Tab}');
    expect(document.querySelector('.scalar-scope-chip')).toHaveTextContent('Scoped to Company: Acme');
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(screen.getByRole('combobox', { name: 'Search in Acme' })).toBeInTheDocument();
    await user.keyboard('{Backspace}');
    expect(screen.queryByText(/Scoped to Company:/)).toBeNull();
  });

  it('click on a row selects it; renderResult can replace rows', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProvider(<Harness onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Open search' }));
    await user.click(screen.getAllByRole('option')[1]!);
    expect(onSelect).toHaveBeenCalledWith(RESULTS[1]);

    renderWithProvider(
      <GlobalSearch
        open onClose={() => {}} query="" onQueryChange={() => {}} results={[RESULTS[0]!]}
        renderResult={(r, s) => <SearchResultRow id={s.id} type={r.type} title={`custom ${String(r.title)}`} selected={s.selected} />}
      />,
    );
    expect(screen.getByRole('option', { name: /custom Acme/ })).toBeInTheDocument();
  });
});
