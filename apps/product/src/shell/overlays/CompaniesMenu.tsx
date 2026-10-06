/**
 * Companies menu — the company switcher under "Companies" in the Primary Menu
 * (Figma 01 · Home: "Home — Companies dropdown open", "Portfolio Home —
 * Companies dropdown (Add New Company)").
 *
 * A searchable Combobox Panel: type to filter, "Show N more companies" pages
 * the list, and "Add New Company" opens the Add Company modal on Portfolio
 * Home. Picking a company opens its Summary. Both menu keys ('companies',
 * 'companies-add') draw the same panel — both Figma frames carry the Add New
 * Company action; 'companies-add' is the Portfolio Home entry point.
 */
import { useMemo, useState } from 'react';
import { Button, ComboboxPanel, Icon, icons } from '@scalar/design-system';
import { navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { db } from '../../data/db.js';
import { MENU_PAGE } from './data.js';

const MENU_FIRST_PAGE = [
  'abc-co', 'backside-blocks', 'captable', 'cohesity', 'company-31',
  'comps', 'databricks', 'debt-only', 'dec-30-md', 'empty-company',
].map((id) => db.companies.byId(id)).filter((c) => c !== undefined);
import { Popover } from './Popover.js';
import type { OverlayProps } from './index.js';

export function CompaniesMenu({ company, onClose }: OverlayProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  // Every match, ranked by the db (name-prefix first); the panel shows a page of them.
  const matches = useMemo(() => db.companies.search(query, db.companies.count), [query]);
  // With no query the first page is the set drawn in Figma (the frame's companies, in its order).
  const firstPage = query.trim() ? matches.slice(0, MENU_PAGE) : MENU_FIRST_PAGE;
  const visible = expanded ? matches : firstPage;
  const hidden = matches.length - visible.length;

  const addCompany = () => {
    onClose();
    navigate(routes.portfolioHome, 'add-company');
  };

  return (
    <Popover onClose={onClose} placement={{ left: '23%' }} label="Companies">
      <ComboboxPanel
        autoFocus
        label="Companies"
        searchPlaceholder="Find a Company"
        query={query}
        onQueryChange={setQuery}
        items={visible.map((c) => ({ value: c.id, label: c.name }))}
        value={company?.id}
        onSelect={(id) => {
          onClose();
          navigate(routes.company.summary(id));
        }}
        showMore={hidden > 0 ? { label: `Show ${hidden} more companies`, onClick: () => setExpanded(true) } : undefined}
        footer={
          <Button
            variant="secondary"
            leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>}
            onClick={addCompany}
            style={{ width: '100%' }}
          >
            Add New Company
          </Button>
        }
      />
    </Popover>
  );
}
