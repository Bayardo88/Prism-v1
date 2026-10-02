/**
 * Company · Waterfall — the exit scenario for one company. Same sheet as the
 * firm Waterfalls page, minus the company and cap-table-date pickers (the
 * company is fixed by the page). Saved views sit as View Tabs beside Current.
 *
 * Figma: 09 · Company · Waterfall → Waterfall Views (3 frames).
 */
import { useCallback, useRef, useState } from 'react';
import {
  ContextMenu, Icon, MenuDivider, MenuItem, TertiaryMenuItem, icons, space, zIndex,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { ToolbarAi, ToolbarCurrency, ToolbarSave, ToolbarTableTools } from '../../shell/Toolbar.js';
import { CompanyActions } from '../p06-company-summary-financials/CompanyChrome.js';
import { ScenarioGrid } from '../p04-waterfalls/ScenarioGrid.js';
import { CreateViewModal, WATERFALL_DOCK, scenarioFor, waterfallDockPanels } from '../p04-waterfalls/shared.js';
import { useDismiss } from '../p04-waterfalls/useDismiss.js';

export function CompanyWaterfall({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [views, setViews] = useState<string[]>(state === 'saved-view' ? ['Current', 'test'] : ['Current']);
  const [view, setView] = useState(state === 'saved-view' ? 'test' : 'Current');
  const [creating, setCreating] = useState(state === 'create-view');
  const [menuFor, setMenuFor] = useState<string | undefined>();
  const { columns, band } = scenarioFor(company);

  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuFor(undefined), []);
  useDismiss(menuRef, !!menuFor, closeMenu);

  const remove = (v: string) => {
    setViews((all) => all.filter((x) => x !== v));
    if (view === v) setView('Current');
    setMenuFor(undefined);
  };

  return (
    <CompanyLayout
      company={company}
      section="waterfall"
      date={company.asOf}
      headerEnd={<CompanyActions company={company} />}
      subNav={
        <div style={{ position: 'relative', display: 'flex' }} data-popover-trigger="">
          {views.map((v) => (
            <TertiaryMenuItem
              key={v}
              current={v === view}
              menu={v === 'Current' ? false : undefined}
              onClick={() => (v === view && v !== 'Current' ? setMenuFor((m) => (m === v ? undefined : v)) : setView(v))}
            >
              {v}
            </TertiaryMenuItem>
          ))}
          {menuFor && (
            <div ref={menuRef} style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay }}>
              <ContextMenu label={`${menuFor} view actions`}>
                <MenuItem icon={<Icon size="s" tone="inherit"><icons.ContentCopy /></Icon>} onClick={() => { setViews((all) => [...all, `${menuFor} (copy)`]); setMenuFor(undefined); }}>Duplicate</MenuItem>
                <MenuDivider />
                <MenuItem tone="destructive" icon={<Icon size="s" tone="inherit"><icons.Delete /></Icon>} onClick={() => remove(menuFor)}>Delete view</MenuItem>
              </ContextMenu>
            </div>
          )}
        </div>
      }
      subNavAdd={() => setCreating(true)}
      subNavEnd={
        <>
          <ToolbarAi />
          {band && <ToolbarCurrency currency={band.rate} unit={band.unit} />}
          <ToolbarTableTools />
          <ToolbarSave disabled>Save Notes &amp; Documents</ToolbarSave>
        </>
      }
      dock={WATERFALL_DOCK}
      dockPanels={waterfallDockPanels(company.id)}
      overlay={
        <CreateViewModal
          open={creating}
          onClose={() => setCreating(false)}
          onCreate={(name) => { setViews((v) => [...v, name]); setView(name); setCreating(false); }}
        />
      }
    >
      <div style={{ display: 'flex', gap: space.m }}>
        <ScenarioGrid
          key={view}
          label={`${company.name} waterfall — ${view}`}
          band={band}
          columns={columns.map(({ company: _c, capTableDate: _d, ...c }) => c)}
        />
      </div>
    </CompanyLayout>
  );
}
