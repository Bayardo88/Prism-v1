import { useState } from 'react';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { FinancialsPage } from './FinancialsPage.js';
import { FinancialGrid, fy, range, yearEnd, type GridColumn, type GridRow } from './FinancialGrid.js';
import { balanceSheetSections, periods, type BalanceSection } from './data.js';

type SectionKey = BalanceSection['key'];
const ALL: SectionKey[] = balanceSheetSections.map((s) => s.key);

export function BalanceSheet({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const p = periods(company);
  const historicalAdded = state === 'historical-added' || state === 'projection-added';

  const [expanded, setExpanded] = useState<SectionKey[]>(state === 'default' ? [] : ALL);
  const [firstYear, setFirstYear] = useState(p.year - (historicalAdded ? 3 : 2));
  const [lastProj, setLastProj] = useState(p.year + (state === 'projection-added' ? 4 : 3));
  // Once a historical year is added the periods are shown as fiscal years and
  // the trailing column becomes LTM — as drawn in the Figma frames.
  const fiscal = firstYear < p.year - 2;
  const col = (y: number, zone: GridColumn['zone']) => (fiscal ? fy(y, zone) : yearEnd(y, zone, '12/31'));

  const columns: GridColumn[] = [
    ...range(firstYear, p.year).map((y) => col(y, 'hist')),
    ...range(p.year + 1, lastProj).map((y) => col(y, 'proj')),
    { key: 'as-of', label: p.ltm, zone: 'trail', group: fiscal ? 'LTM' : 'As Of', editableDate: true },
  ];

  const toggle = (k: SectionKey) => setExpanded((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));
  const rows: GridRow[] = balanceSheetSections.flatMap((s) => {
    const open = expanded.includes(s.key);
    const lead: GridRow = { key: s.key, label: s.lead, expanded: open, onToggle: () => toggle(s.key) };
    return open ? [lead, ...s.rows] : [lead];
  });

  return (
    <FinancialsPage
      company={company}
      tab="balance-sheet"
      addYearMenuOpen={state === 'add-year-menu'}
      onAddProjectionYear={() => setLastProj((y) => y + 1)}
      onAddHistoricalYear={() => setFirstYear((y) => y - 1)}
    >
      <FinancialGrid title="Balance Sheet" columns={columns} rows={rows} />
    </FinancialsPage>
  );
}
