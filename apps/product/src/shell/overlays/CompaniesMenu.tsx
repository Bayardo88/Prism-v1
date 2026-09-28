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
import { Button, ComboboxPanel, Icon, glyphs } from '@scalar/design-system';
import { navigate } from '../../router.js';
import { routes } from '../../routes.js';
import { directory, MENU_PAGE } from './data.js';
import { Popover } from './Popover.js';
import type { OverlayProps } from './index.js';

export function CompaniesMenu({ company, onClose }: OverlayProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const matches = useMemo(
    () => directory.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );
  const visible = expanded || query ? matches : matches.slice(0, MENU_PAGE);
  const hidden = matches.length - visible.length;

  const addCompany = () => {
    onClose();
    navigate(routes.portfolioHome, 'add-company');
  };

  return (
    <Popover onClose={onClose} placement={{ left: '23%' }} label="Companies">
      <ComboboxPanel
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
            leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}
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
