/**
 * The frame every Financials sub-page shares: company header with Financials
 * Date / Version and the ⋮ actions, the Income Statement · Balance Sheet · KPIs
 * sub-nav with currency + Save, the "Add Projection Year" split button in the
 * footer and the Workspace dock (Notes opens the drawer).
 */
import { useState, type ReactNode } from 'react';
import { Button, ContextMenu, Icon, MenuItem, SplitButton, glyphs, space, zIndex } from '@scalar/design-system';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import type { Company } from '../../data/fixtures.js';
import {
  CompanyActions, CurrencyUnit, FinancialsSelectors, FinancialsSubNav, NotesPanel, type FinancialsTab,
} from './CompanyChrome.js';

export interface FinancialsPageProps {
  company: Company;
  tab: FinancialsTab;
  versionMenuOpen?: boolean;
  actionsMenuOpen?: boolean;
  notesOpen?: boolean;
  addYearMenuOpen?: boolean;
  onAddProjectionYear?: () => void;
  onAddHistoricalYear?: () => void;
  children?: ReactNode;
}

/** "+ Add Projection Year ▾" → Add Historical Year. The menu opens upward, clear of the dock. */
function AddYearButton({ initialOpen, onProjection, onHistorical }: {
  initialOpen: boolean;
  onProjection?: () => void;
  onHistorical?: () => void;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <SplitButton
        variant="secondary"
        leadingIcon={<Icon size="s" tone="inherit"><glyphs.Plus /></Icon>}
        onClick={onProjection}
        menuOpen={open}
        onMenuToggle={() => setOpen((o) => !o)}
        menuLabel="More ways to add a year"
      >
        Add Projection Year
      </SplitButton>
      {open && (
        <span style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: space.xs, zIndex: zIndex.overlay }}>
          <ContextMenu label="Add year">
            <MenuItem
              icon={<Icon tone="inherit"><glyphs.Plus /></Icon>}
              onClick={() => { onHistorical?.(); setOpen(false); }}
            >
              Add Historical Year
            </MenuItem>
          </ContextMenu>
        </span>
      )}
    </span>
  );
}

export function FinancialsPage({
  company, tab, versionMenuOpen = false, actionsMenuOpen = false, notesOpen = false, addYearMenuOpen = false,
  onAddProjectionYear, onAddHistoricalYear, children,
}: FinancialsPageProps) {
  return (
    <CompanyLayout
      company={company}
      section="financials"
      headerEnd={
        <>
          <FinancialsSelectors initialVersionOpen={versionMenuOpen} />
          <CompanyActions company={company} initialOpen={actionsMenuOpen} />
        </>
      }
      subNav={<FinancialsSubNav company={company} current={tab} />}
      subNavEnd={
        <>
          <CurrencyUnit />
          <Button variant="primary" tone="positive">Save</Button>
        </>
      }
      footer={
        <AddYearButton initialOpen={addYearMenuOpen} onProjection={onAddProjectionYear} onHistorical={onAddHistoricalYear} />
      }
      dockOpen={notesOpen ? 'notes' : undefined}
      dockContent={<NotesPanel />}
    >
      {children}
    </CompanyLayout>
  );
}
