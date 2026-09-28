/**
 * Intelligence → Summaries: the firm portfolio summary, one row per
 * company, as a saved, configurable view. Eleven Figma frames are states of
 * this one screen: scroll positions of the wide grid, a selected column, the
 * cell trend popover, the saved-view and page-action menus, the Create
 * Summary View modal, and the global User Menu opened over it.
 */
import { useMemo, useState } from 'react';
import {
  CellHistoryPopover, LineChart, Link, ModalStatus, Text, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { AppFrame, PageBody } from '../../shell/AppFrame.js';
import { href } from '../../router.js';
import { routes } from '../../routes.js';
import { PortfolioGrid, type GridRow } from './PortfolioGrid.js';
import { ExportMenuItems, PortfolioHeader, PublishedNote, SavedViewsBar } from './chrome.js';
import { CreateSummaryView } from './CreateSummaryView.js';
import { fixtureId, investedHistory, slug, summaryColumns, summaryRows, summaryTotal, type Status } from './data.js';

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

const statusCell = (s: Status) =>
  s === 'final' ? <ModalStatus state="final" /> : s === 'published' ? <ModalStatus state="complete">Published</ModalStatus> : <ModalStatus state="draft" />;

/** A company name, linked to its summary page when the company is in the shared fixtures. */
export function CompanyName({ name, to = routes.company.summary }: { name: string; to?: (id: string) => string }) {
  const id = fixtureId(name);
  return id ? <Link size="s" href={href(to(id))}>{name}</Link> : <>{name}</>;
}

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
      : afterTrend ? { row: 'future-4-liq-pref-eur', col: 'invested' } : undefined,
  );
  const [trendOpen, setTrendOpen] = useState(state === 'cell-trend');

  const rows: GridRow[] = useMemo(() => summaryRows.map((r) => ({
    id: slug(r.name),
    label: <CompanyName name={r.name} />,
    sortText: r.name,
    values: {
      ...r.v,
      total: r.v.total === 'DRAFT' ? <Text step="s" tone="tertiary">DRAFT</Text> : r.v.total,
      status: statusCell(r.status),
    },
  })), []);

  const onCellClick = (row: string, col: string) => {
    setSelectedCol(col);
    setFocused({ row, col });
    setTrendOpen(col === 'invested');
  };

  const focusedName = summaryRows.find((r) => slug(r.name) === focused?.row)?.name;

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
          total={summaryTotal}
          colPct={10}
          scrollTo={SCROLL[state]}
          selectedCol={selectedCol}
          focused={focused}
          onCellClick={onCellClick}
          onAddColumn={() => setModal('edit')}
          addColumnLabel=""
          rails
          popover={trendOpen && focused ? {
            row: focused.row,
            col: focused.col,
            content: (
              <CellHistoryPopover title="Invested Capital" subtitle={focusedName} onClose={() => setTrendOpen(false)}>
                <LineChart
                  title={`Invested Capital — ${focusedName ?? ''}`}
                  categoryLabel="Valuation date"
                  categories={investedHistory.categories}
                  series={[{ label: 'Invested capital', values: investedHistory.values }]}
                  format={(v) => `$${v.toLocaleString('en-US')}`}
                  height={200}
                />
              </CellHistoryPopover>
            ),
          } : undefined}
        />
        <PublishedNote />
      </PageBody>
    </AppFrame>
  );
}
