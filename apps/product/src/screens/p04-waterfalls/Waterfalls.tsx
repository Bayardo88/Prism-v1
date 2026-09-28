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
import { companyById, db } from '../../data/fixtures.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { PageHeader } from '../../shell/PageHeader.js';
import { WorkspaceDock } from '../../shell/WorkspaceDock.js';
import { ScenarioGrid } from './ScenarioGrid.js';
import { CreateViewModal, WATERFALL_DOCK, scenarioFor, waterfallDockPanels } from './shared.js';
import { useDismiss } from './useDismiss.js';

/** The picker's first page, as drawn in the frame; "Show N more" reveals the rest of the database. */
const FRAME_PICKER = ['abc-co', 'backside-blocks', 'captable', 'cohesity', 'company-31', 'comps', 'databricks', 'debt-only'];

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
  const { columns, band, rateLabel } = scenarioFor(company);

  const shown = query
    ? db.companies.search(query, 20)
    : showAll ? db.companies.all() : FRAME_PICKER.map((id) => db.companies.byId(id)!).filter(Boolean);
  const hidden = query ? 0 : db.companies.count - shown.length;

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
      date={company?.asOf}
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
          <CurrencySelector>{rateLabel}</CurrencySelector>
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
        <WorkspaceDock
          tabs={WATERFALL_DOCK}
          open={state === 'workspace-documents' ? 'documents' : undefined}
          panels={waterfallDockPanels(company.id)}
        />
      )}
    </AppFrame>
  );
}
