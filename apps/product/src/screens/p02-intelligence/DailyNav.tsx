/**
 * Intelligence → Daily NAV: a daily mark for every company, set against its
 * previous valuation, secondary-market prices and public comps, with a
 * report the team validates, previews, finalizes and sends.
 */
import { useMemo, useRef, useState } from 'react';
import {
  Chip, ContextMenu, DataFreshness, FloatingLabelInput, Icon, MenuItem, SplitButton, color, glyphs, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { routes } from '../../routes.js';
import { href } from '../../router.js';
import { PortfolioGrid, type GridRow } from './PortfolioGrid.js';
import { PortfolioHeader, useDismiss } from './chrome.js';
import { CompanyName } from './Summaries.js';
import { navColumns, navCompanies, navGroups, slug } from './data.js';

const DASH = '—';

export function DailyNav({ state }: ScreenProps) {
  const [reportMenu, setReportMenu] = useState(state === 'report-menu');
  const [actions, setActions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(menuRef, reportMenu, () => setReportMenu(false));

  const rows: GridRow[] = useMemo(() => navCompanies.map((c) => ({
    id: slug(c.name),
    label: <CompanyName name={c.name} to={routes.company.dailyNavSettings} />,
    sortText: c.name,
    expandable: !!c.prev,
    values: {
      valDate: c.prev?.[0] ?? '', equity: c.prev?.[1] ?? '', pps: c.prev?.[2] ?? '',
      caplight: '', forge: '', zanbato: '', avg: '',
      vsMark: DASH, d1: DASH, d5: DASH, lastVal: DASH, closed: '',
      pc1: DASH, pc5: DASH, pcLast: DASH,
      status: (
        <Chip size="s" styleVariant="positive">
          <Icon size="xs" tone="positive"><glyphs.Check /></Icon> No Action Needed
        </Chip>
      ),
    },
  })), []);

  return (
    <AppFrame area="intelligence">
      <PortfolioHeader
        title="Intelligence"
        tab="daily-nav"
        actionsOpen={actions}
        onActionsOpen={setActions}
        actions={
          <MenuItem icon={<Icon size="s"><glyphs.Settings /></Icon>} href={href(routes.firmSettings.dailyNav)}>Daily NAV settings</MenuItem>
        }
      />
      <PageBody gap={space.m}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: space.l, padding: `${space.xs} ${space.s}`,
            background: color.bg.subtle,
          }}
        >
          <FloatingLabelInput label="Report date" defaultValue="09/22/2026" />
          <DataFreshness onRefresh={() => undefined}>Market data as of Sep 22, 2026, 2:00 PM CST</DataFreshness>
          <div ref={menuRef} style={{ marginLeft: 'auto' }}>
            <SplitButton
              menuLabel="More report actions"
              menuOpen={reportMenu}
              onMenuToggle={() => setReportMenu((o) => !o)}
              menu={
                <ContextMenu label="Report actions">
                  <MenuItem onClick={() => setReportMenu(false)}>Validate Report</MenuItem>
                  <MenuItem onClick={() => setReportMenu(false)}>Preview Report</MenuItem>
                  <MenuItem onClick={() => setReportMenu(false)}>Finalize Report</MenuItem>
                  <MenuItem onClick={() => setReportMenu(false)}>Send Report</MenuItem>
                </ContextMenu>
              }
            >
              Report
            </SplitButton>
          </div>
        </div>
        <PortfolioGrid
          label="Daily NAV"
          firstColumn="Company"
          columns={navColumns}
          groups={navGroups}
          rows={rows}
          colPct={6}
          scrollTo={state === 'default' ? undefined : 'caplight'}
        />
      </PageBody>
    </AppFrame>
  );
}
