/**
 * Home — the firm's landing page (Figma 01 · Home & Global Navigation).
 *
 * Firm Switcher strip → four Product Tiles (Intelligence, Valuations,
 * Waterfalls, Documents) → a company search → the A–Z portfolio directory.
 * Every global menu state (Companies, Date, Search, Notifications) is the
 * same page with a Primary Menu overlay open, so the states just pass
 * `openMenu`. Portfolio Home adds the Add Company modal.
 */
import { useMemo, useState } from 'react';
import {
  DirectoryGroup, FirmSwitcherTile, FormField, Heading, Icon, Input, ProductTile, Text, EmptyState,
  icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import type { GlobalMenu } from '../../shell/overlays/index.js';
import { directoryByLetter } from '../../shell/overlays/data.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { db, firm, firms } from '../../data/fixtures.js';
import { AddCompanyModal } from './AddCompanyModal.js';

const MENU_FOR_STATE: Record<string, GlobalMenu | undefined> = {
  'companies-menu': 'companies',
  'date-menu': 'date',
  search: 'search',
  notifications: 'notifications',
  'notification-settings': 'notification-settings',
  'companies-add': 'companies-add',
};

const PRODUCTS = [
  {
    product: 'intelligence' as const, title: 'Intelligence', to: routes.intelligence.summaries,
    description: 'Customizable summaries of the entire portfolio.', glyph: <icons.QueryStats />,
  },
  {
    product: 'valuations' as const, title: 'Valuations', to: routes.valuations,
    description: 'Find the details and bulk actions on all of the latest valuations.', glyph: <icons.Paid />,
  },
  {
    product: 'waterfalls' as const, title: 'Waterfalls', to: routes.waterfalls,
    description: "Run a waterfall on any company's cap table to quickly find the distributions.", glyph: <icons.WaterfallChart />,
  },
  {
    product: 'documents' as const, title: 'Documents', to: routes.documents,
    description: 'Quickly find the documents that were used for each valuation.', glyph: <icons.Description />,
  },
];

export function Home({ state }: ScreenProps) {
  const [firmId, setFirmId] = useState(firm.id);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(state === 'add-company');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return directoryByLetter((q ? db.companies.search(q, db.companies.count) : db.companies.all())
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name)));
  }, [query]);

  return (
    <AppFrame
      area="home"
      openMenu={MENU_FOR_STATE[state]}
      overlay={<AddCompanyModal open={adding} onClose={() => setAdding(false)} />}
    >
      <PageBody gap={space.xl}>
        <div role="group" aria-label="Firms" style={{ display: 'flex', gap: space.s }}>
          {firms.map((f) => (
            <FirmSwitcherTile
              key={f.id}
              name={f.name}
              initials={f.initials}
              selected={f.id === firmId}
              onClick={() => setFirmId(f.id)}
            />
          ))}
        </div>

        <nav aria-label="Products" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: space.m }}>
          {PRODUCTS.map((p) => (
            <ProductTile
              key={p.product}
              product={p.product}
              title={p.title}
              description={p.description}
              href={href(p.to)}
              icon={<Icon size="m" tone="inherit">{p.glyph}</Icon>}
            />
          ))}
        </nav>

        <FormField>
          <Input
            aria-label="Search companies"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies…"
            leadingIcon={<Icon size="s"><icons.Search /></Icon>}
          />
        </FormField>

        <section aria-labelledby="directory-title" style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: space.s }}>
            <Heading level={2} step="m" id="directory-title">{firm.name}</Heading>
            <Text step="s" tone="secondary">Portfolio Companies</Text>
          </div>
          {groups.length === 0 ? (
            <EmptyState
              type="no-results"
              title={`No companies match “${query}”`}
              body="Check the spelling, or clear the search to see every portfolio company."
            />
          ) : (
            groups.map((g) => (
              <DirectoryGroup
                key={g.letter}
                letter={g.letter}
                entries={g.items.map((c) => ({ label: c.name, href: href(routes.company.summary(c.id)) }))}
              />
            ))
          )}
        </section>
      </PageBody>
    </AppFrame>
  );
}
