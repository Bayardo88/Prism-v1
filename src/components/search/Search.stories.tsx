import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { GlobalSearch, KeyHint, SearchResultRow, SearchScopeChip, SearchSectionHeader } from './index.js';
import type { SearchResult, SearchScope } from './index.js';
import { Button } from '../button/Button.js';

const meta = {
  title: 'Navigation/GlobalSearch',
  component: GlobalSearch,
  tags: ['autodocs'],
  args: { open: true, onClose: () => undefined, query: '', onQueryChange: () => undefined, results: [] },
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 480 } } },
} satisfies Meta<typeof GlobalSearch>;
export default meta;
type Story = StoryObj<typeof meta>;

const ALL: SearchResult[] = [
  { id: 'c1', type: 'company', title: 'Acme Holdings', subtitle: 'Software · Series C' },
  { id: 'c2', type: 'company', title: 'Acme Robotics', subtitle: 'Hardware · Series A' },
  { id: 'f1', type: 'firm', title: 'Northbridge Capital', subtitle: '12 companies' },
  { id: 'd1', type: 'document', title: 'Acme Q3 financials.xlsx', subtitle: 'Uploaded 2 days ago' },
  { id: 'p1', type: 'page', title: 'Valuations', subtitle: 'Go to page' },
];

/** Up/Down move the active result, Enter opens it, Tab sets it as scope, Backspace on an empty query removes a scope, Esc closes. */
export const Interactive: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    const [query, setQuery] = useState('acme');
    const [scopes, setScopes] = useState<SearchScope[]>([]);
    const results = ALL.filter((r) => String(r.title).toLowerCase().includes(query.toLowerCase()));
    return (
      <div style={{ padding: 'var(--space-l)' }}>
        <Button onClick={() => setOpen(true)}>Open search</Button>
        <GlobalSearch
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          query={query}
          onQueryChange={setQuery}
          results={results}
          scopes={scopes}
          onScopesChange={setScopes}
          onSelect={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const WithResults: Story = { args: { query: 'acme', results: ALL.slice(0, 4) } };
export const Scoped: Story = {
  args: { query: '', results: ALL.slice(3, 4), scopes: [{ type: 'company', label: 'Acme Holdings', id: 'c1' }] },
};
export const NoResults: Story = { args: { query: 'zzzz', results: [] } };

export const ScopeChips: StoryObj<typeof SearchScopeChip> = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-s)' }}>
      <SearchScopeChip type="firm">Northbridge</SearchScopeChip>
      <SearchScopeChip type="company">Acme Holdings</SearchScopeChip>
      <SearchScopeChip type="document">Q3 financials</SearchScopeChip>
      <SearchScopeChip type="version">v2</SearchScopeChip>
      <SearchScopeChip type="measurement-date">30 Sep 2026</SearchScopeChip>
    </div>
  ),
};

export const ResultRows: StoryObj<typeof SearchResultRow> = {
  render: () => (
    <div role="listbox" aria-label="Results" style={{ width: 480 }}>
      <SearchSectionHeader type="company" />
      <SearchResultRow type="company" title="Acme Holdings" subtitle="Software · Series C" />
      <SearchResultRow type="company" title="Acme Robotics" subtitle="Hardware" selected hints={<KeyHint keyGlyph="↵" label="go" />} />
      <SearchSectionHeader type="page" />
      <SearchResultRow type="page" title="Valuations" hideBadge />
    </div>
  ),
};

export const KeyHints: StoryObj<typeof KeyHint> = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-m)' }}>
      <KeyHint keyGlyph="↑↓" label="navigate" />
      <KeyHint keyGlyph="↵" label="go" />
      <KeyHint keyGlyph="Esc" />
    </div>
  ),
};
