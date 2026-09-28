import { useState } from 'react';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { FinancialsPage } from './FinancialsPage.js';
import { FinancialGrid, fy, yearEnd, type GridColumn, type GridRow } from './FinancialGrid.js';
import { balanceSheetSections, type BalanceSection } from './data.js';

type SectionKey = BalanceSection['key'];
const ALL: SectionKey[] = balanceSheetSections.map((s) => s.key);

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export function BalanceSheet({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const historicalAdded = state === 'historical-added' || state === 'projection-added';

  const [expanded, setExpanded] = useState<SectionKey[]>(state === 'default' ? [] : ALL);
  const [firstYear, setFirstYear] = useState(historicalAdded ? 2021 : 2022);
  const [lastProj, setLastProj] = useState(state === 'projection-added' ? 2028 : 2027);
  // Once a historical year is added the periods are shown as fiscal years and
  // the trailing column becomes LTM — as drawn in the Figma frames.
  const fiscal = firstYear < 2022;
  const col = fiscal ? fy : yearEnd;

  const columns: GridColumn[] = [
    ...range(firstYear, 2024).map((y) => col(y, 'hist')),
    ...range(2025, lastProj).map((y) => col(y, 'proj')),
    { key: 'as-of', label: '12/31/2024', zone: 'trail', group: fiscal ? 'LTM' : 'As Of', editableDate: true },
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
