/**
 * Intelligence → Daily NAV: a daily mark for every company in the database
 * (a page at a time), set against its previous valuation, secondary-market
 * prices and public comps, with a report the team validates, previews,
 * finalizes and sends.
 */
import { useMemo, useRef, useState } from 'react';
import {
  Chip, ContextMenu, DataFreshness, FloatingLabelInput, Icon, MenuItem, Pagination, SplitButton,
  color, icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { routes } from '../../routes.js';
import { navigate } from '../../router.js';
import { PortfolioGrid, type GridRow } from './PortfolioGrid.js';
import { PortfolioHeader, useDismiss } from './chrome.js';
import { companyHref } from './cells.js';
import { NAV_FRAME, PAGE_SIZE, inFrameOrder, navColumns, navGroups, previousValuation } from './data.js';

const DASH = '—';
const ORDER = inFrameOrder(NAV_FRAME);

export function DailyNav({ state }: ScreenProps) {
  const [reportMenu, setReportMenu] = useState(state === 'report-menu');
  const [actions, setActions] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(menuRef, reportMenu, () => setReportMenu(false));

  const rows: GridRow[] = useMemo(() => ORDER.slice((page - 1) * perPage, page * perPage).map((c) => {
    const prev = previousValuation(c);
    return {
      id: c.id,
      label: c.name,
      href: companyHref(c, routes.company.dailyNavSettings),
      sortText: c.name,
      expandable: !!prev,
      values: {
        valDate: prev?.[0] ?? '', equity: prev?.[1] ?? '', pps: prev?.[2] ?? '',
        caplight: '', forge: '', zanbato: '', avg: '',
        vsMark: DASH, d1: DASH, d5: DASH, lastVal: DASH, closed: '',
        pc1: DASH, pc5: DASH, pcLast: DASH,
        status: (
          <Chip size="s" styleVariant="positive">
            <Icon size="xs" tone="positive"><icons.CheckCircle /></Icon> No Action Needed
          </Chip>
        ),
      },
    };
  }), [page, perPage]);

  return (
    <AppFrame area="intelligence">
      <PortfolioHeader
        title="Intelligence"
        tab="daily-nav"
        actionsOpen={actions}
        onActionsOpen={setActions}
        actions={
          <MenuItem icon={<Icon size="s"><icons.Settings /></Icon>} onClick={() => navigate(routes.firmSettings.dailyNav)}>Daily NAV settings</MenuItem>
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
          scrollTo={state === 'default' ? undefined : 'caplight'}
        />
        <Pagination
          page={page}
          pageCount={Math.ceil(ORDER.length / perPage)}
          onPageChange={setPage}
          rowsPerPage={perPage}
          onRowsPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        />
      </PageBody>
    </AppFrame>
  );
}
