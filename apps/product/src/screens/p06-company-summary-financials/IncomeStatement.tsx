import { useEffect, useState } from 'react';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { FinancialsPage } from './FinancialsPage.js';
import { FinancialGrid, fy, type GridColumn } from './FinancialGrid.js';
import { incomeStatementRows, performanceMetricRows } from './data.js';

/** Historical FY 2022–24 (actuals, FY 2024 footnoted), Projections, then LTM / NTM. */
function columns(projYears: number[], editableTrail: boolean): GridColumn[] {
  return [
    fy(2022, 'hist'), fy(2023, 'hist'), { ...fy(2024, 'hist'), footnote: editableTrail ? '1' : undefined },
    ...projYears.map((y) => fy(y, 'proj')),
    { key: 'ltm', label: '12/31/2024', zone: 'trail', group: 'LTM', editableDate: editableTrail },
    { key: 'ntm', label: '12/31/2025', zone: 'trail', group: 'NTM', editableDate: editableTrail },
  ];
}

/** Insert empty projection cells so row values stay aligned when a year is added. */
function widen<T extends { values?: unknown[] }>(rows: T[], extra: number): T[] {
  if (!extra) return rows;
  return rows.map((r) => {
    if (!r.values) return r;
    const v = [...r.values];
    v.splice(6, 0, ...Array.from({ length: extra }, () => undefined));
    return { ...r, values: v };
  });
}

export function IncomeStatement({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [projYears, setProjYears] = useState([2025, 2026, 2027]);
  const extra = projYears.length - 3;

  // The Workspace drawer docks under the page; bring it into view for the Notes frame.
  useEffect(() => {
    if (state !== 'notes-drawer') return;
    const t = window.setTimeout(() => window.scrollTo(0, document.documentElement.scrollHeight), 0);
    return () => window.clearTimeout(t);
  }, [state]);

  return (
    <FinancialsPage
      company={company}
      tab="income-statement"
      versionMenuOpen={state === 'version-menu'}
      actionsMenuOpen={state === 'actions-menu'}
      notesOpen={state === 'notes-drawer'}
      onAddProjectionYear={() => setProjYears((ys) => [...ys, ys[ys.length - 1]! + 1])}
    >
      <FinancialGrid title="Income Statement" columns={columns(projYears, true)} rows={widen(incomeStatementRows, extra)} />
      <FinancialGrid title="Performance Metrics" columns={columns(projYears, false)} rows={widen(performanceMetricRows, extra)} />
    </FinancialsPage>
  );
}
