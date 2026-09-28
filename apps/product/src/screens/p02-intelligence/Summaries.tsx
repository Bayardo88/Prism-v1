/**
 * Intelligence → Summaries: the firm portfolio summary, one row per
 * company (all 200 in the database, a page at a time), as a saved,
 * configurable view. Eleven Figma frames are states of this one screen:
 * scroll positions of the wide grid, a selected column, the cell trend
 * popover, the saved-view and page-action menus, the Create Summary View
 * modal, and the global User Menu opened over it.
 */
import { useMemo, useState } from 'react';
import { CellHistoryPopover, LineChart, Pagination, Text, space } from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { companyById } from '../../data/fixtures.js';
import { PortfolioGrid, type GridRow } from './PortfolioGrid.js';
import { ExportMenuItems, PortfolioHeader, PublishedNote, SavedViewsBar } from './chrome.js';
import { CreateSummaryView } from './CreateSummaryView.js';
import { CompanyLink, StatusCell } from './cells.js';
import { PAGE_SIZE, SUMMARY_FRAME, inFrameOrder, investedHistory, summaryColumns, summaryTotal, summaryValues } from './data.js';

const SCROLL: Record<string, string | undefined> = {
  'scrolled-value-metrics': 'total',
  'scrolled-preferences': 'tip',
  'scrolled-status-end': 'end',
  'column-selected': 'fdo',
  'cell-trend': 'fdo',
  'saved-view-menu': 'fdo',
  'create-view': 'fdo',
  'page-actions': 'fdo',
  'user-menu': 'fdo',
  'user-menu-firm-settings': 'fdo',
};

const ORDER = inFrameOrder(SUMMARY_FRAME);

export function Summaries({ state }: ScreenProps) {
  const afterTrend = ['cell-trend', 'saved-view-menu', 'create-view', 'page-actions', 'user-menu', 'user-menu-firm-settings'].includes(state);

  const [view, setView] = useState('Firm Summary');
  const [viewMenu, setViewMenu] = useState<string | undefined>(state === 'saved-view-menu' ? 'Firm Summary' : undefined);
  const [modal, setModal] = useState<'create' | 'edit' | undefined>(state === 'create-view' ? 'create' : undefined);
  const [actions, setActions] = useState(state === 'page-actions');
  const [selectedCol, setSelectedCol] = useState<string | undefined>(
    state === 'column-selected' ? 'fdo' : afterTrend ? 'invested' : undefined,
  );
  const [focused, setFocused] = useState<{ row: string; col: string } | undefined>(
    state === 'column-selected' ? { row: 'fund-owns-preferred-notes', col: 'fdo' }
      : afterTrend ? { row: 'future-4-liq-pref', col: 'invested' } : undefined,
  );
  const [trendOpen, setTrendOpen] = useState(state === 'cell-trend');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PAGE_SIZE);

  const rows: GridRow[] = useMemo(() => ORDER.slice((page - 1) * perPage, page * perPage).map((c) => {
    const v = summaryValues(c);
    return {
      id: c.id,
      label: <CompanyLink company={c} />,
      sortText: c.name,
      values: {
        ...v,
        total: v.total === 'DRAFT' ? <Text step="s" tone="tertiary">DRAFT</Text> : v.total,
        status: <StatusCell company={c} />,
      },
    };
  }), [page, perPage]);
  const total = useMemo(summaryTotal, []);

  const onCellClick = (row: string, col: string) => {
    setSelectedCol(col);
    setFocused({ row, col });
    setTrendOpen(col === 'invested');
  };

  const focusedCo = focused ? companyById(focused.row) : undefined;
  const history = focusedCo ? investedHistory(focusedCo) : undefined;

  return (
    <AppFrame
      area="intelligence"
      openMenu={state === 'user-menu' ? 'user' : state === 'user-menu-firm-settings' ? 'user-firm-settings' : undefined}
      overlay={
        <CreateSummaryView
          open={!!modal}
          onClose={() => setModal(undefined)}
          title={modal === 'edit' ? 'Edit Summary View' : 'Create Summary View'}
          name={modal === 'edit' ? view : 'New View (Copy 2)'}
          confirm={modal === 'edit' ? 'Save' : 'Create'}
        />
      }
    >
      <PortfolioHeader
        title="Intelligence"
        tab="summaries"
        actionsOpen={actions}
        onActionsOpen={setActions}
        actions={<ExportMenuItems />}
      />
      <PageBody gap={space.m}>
        <SavedViewsBar
          views={['Firm Summary', 'New View (Copy)']}
          current={view}
          onSelect={setView}
          menuFor={viewMenu}
          onMenuFor={setViewMenu}
          onAdd={() => setModal('create')}
          onEdit={() => setModal('edit')}
        />
        <PortfolioGrid
          label="Firm portfolio summary"
          firstColumn="Firm Portfolio Summary"
          columns={summaryColumns}
          rows={rows}
          total={total}
          scrollTo={SCROLL[state]}
          selectedCol={selectedCol}
          focused={focused}
          onCellClick={onCellClick}
          onAddColumn={() => setModal('edit')}
          addColumnLabel=""
          rails
          popover={trendOpen && focusedCo && history ? {
            row: focusedCo.id,
            col: 'invested',
            content: (
              <CellHistoryPopover title="Invested Capital" subtitle={focusedCo.name} onClose={() => setTrendOpen(false)}>
                <LineChart
                  title={`Invested Capital — ${focusedCo.name}`}
                  categoryLabel="Date"
                  categories={history.categories}
                  series={[{ label: 'Invested capital', values: history.values }]}
                  format={(v) => `$${v.toLocaleString('en-US')}`}
                  height={200}
                />
              </CellHistoryPopover>
            ),
          } : undefined}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: space.l }}>
          <Pagination
            page={page}
            pageCount={Math.ceil(ORDER.length / perPage)}
            onPageChange={setPage}
            rowsPerPage={perPage}
            onRowsPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          />
          <div style={{ marginLeft: 'auto' }}><PublishedNote /></div>
        </div>
      </PageBody>
    </AppFrame>
  );
}
