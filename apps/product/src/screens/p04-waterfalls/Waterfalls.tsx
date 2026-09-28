/**
 * Waterfalls (firm) — build an exit scenario for any portfolio company:
 * pick the company, its cap-table date and cap table, set the exit date and
 * enterprise value, and read the firm's total exit proceeds.
 *
 * Figma: 04 · Waterfalls (Firm) → Firm Waterfall Scenario (4 frames).
 */
import { useCallback, useRef, useState } from 'react';
import {
  Button, ComboboxPanel, CurrencySelector, Link, TertiaryMenu, ViewTab, ViewTabBar, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { companies, companyById } from '../../data/fixtures.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { PageHeader } from '../../shell/PageHeader.js';
import { WorkspaceDock } from '../../shell/WorkspaceDock.js';
import { ScenarioGrid, type ScenarioColumn } from './ScenarioGrid.js';
import { CreateViewModal, WATERFALL_DOCK, WorkspaceDocuments } from './shared.js';
import { useDismiss } from './useDismiss.js';

const PICKER_PAGE = 8;
const EXIT_DATE = '09/22/2026';

/** The demo scenario: Backside Blocks reports in NIO, displayed in EUR. */
function scenarioFor(companyId: string | undefined): { columns: ScenarioColumn[]; band?: { rate: string; unit: string } } {
  if (!companyId) {
    return {
      columns: [{
        key: 'input', currency: 'USD', symbol: '$', editable: true, exitDate: EXIT_DATE,
        fxRate: 0, exitEnterpriseValue: 0, cash: 0, debt: 0,
      }],
    };
  }
  const c = companyById(companyId);
  const base = { company: c.name, capTableDate: '03/31/2025', capTable: 'Primary Captable', exitDate: EXIT_DATE, exitEnterpriseValue: 0, cash: 0, debt: 0 };
  return {
    band: { rate: '1 NIO → 0.02 EUR', unit: '(€) Millions' },
    columns: [
      { key: 'input', currency: 'NIO', symbol: 'NIO ', editable: true, fxRate: 1, ...base },
      { key: 'display', currency: 'EUR', symbol: '€', editable: false, fxRate: 0.02, ...base },
    ],
  };
}

export function Waterfalls({ state }: ScreenProps) {
  const [companyId, setCompanyId] = useState<string | undefined>(state === 'default' ? undefined : 'backside-blocks');
  const [pickerOpen, setPickerOpen] = useState(state === 'company-picker');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [views, setViews] = useState<string[]>(['Current']);
  const [view, setView] = useState('Current');
  const [creating, setCreating] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  useDismiss(pickerRef, pickerOpen, closePicker);

  const company = companyId ? companyById(companyId) : undefined;
  const { columns, band } = scenarioFor(companyId);

  const filtered = companies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const shown = showAll || query ? filtered : filtered.slice(0, PICKER_PAGE);
  const hidden = filtered.length - shown.length;

  const picker = (
    <div ref={pickerRef}>
      <ComboboxPanel
        label="Companies"
        searchPlaceholder="Find a Company"
        items={shown.map((c) => ({ value: c.id, label: c.name }))}
        value={companyId}
        query={query}
        onQueryChange={setQuery}
        onSelect={(id) => { setCompanyId(id); setPickerOpen(false); setQuery(''); }}
        showMore={hidden > 0 ? { label: `Show ${hidden} more companies`, onClick: () => setShowAll(true) } : undefined}
      />
    </div>
  );

  return (
    <AppFrame
      area="waterfalls"
      date={company ? '03/31/2025' : undefined}
      overlay={
        <CreateViewModal
          open={creating}
          onClose={() => setCreating(false)}
          onCreate={(name) => { setViews((v) => [...v, name]); setView(name); setCreating(false); }}
        />
      }
    >
      <PageHeader
        title="Waterfalls"
        actions={<Button variant="primary" tone="positive" disabled={state !== 'workspace-documents'}>Save Notes &amp; Documents</Button>}
      />
      <TertiaryMenu>
        <ViewTabBar label="Waterfall views" addLabel="Create waterfall view" onAdd={() => setCreating(true)}>
          {views.map((v) => (
            <ViewTab key={v} selected={v === view} onSelect={() => setView(v)} onMenu={v === 'Current' ? undefined : () => {}}>{v}</ViewTab>
          ))}
        </ViewTabBar>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: space.s, alignItems: 'center' }}>
          <CurrencySelector>{company ? '1 NIO → 0.02 EUR · (€) Millions' : 'USD · ($) Millions'}</CurrencySelector>
        </div>
      </TertiaryMenu>

      <PageBody>
        <div style={{ display: 'flex', gap: space.m, alignItems: 'flex-start' }}>
          <ScenarioGrid
            label="Firm waterfall scenario"
            withCompany
            columns={columns}
            band={band}
            companyOpen={pickerOpen}
            onCompanyClick={() => setPickerOpen((o) => !o)}
            companyPicker={picker}
          />
          {company && (
            <div style={{ paddingTop: space.l }}>
              <Link href={href(routes.company.waterfall(company.id))}>Go to {company.name}</Link>
            </div>
          )}
        </div>
      </PageBody>

      {company && (
        <WorkspaceDock tabs={WATERFALL_DOCK} open={state === 'workspace-documents' ? 'documents' : undefined}>
          <WorkspaceDocuments companyId={company.id} />
        </WorkspaceDock>
      )}
    </AppFrame>
  );
}
