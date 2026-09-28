import { useState } from 'react';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { FinancialsPage } from './FinancialsPage.js';
import { FinancialGrid, fy, range, type GridColumn } from './FinancialGrid.js';
import { incomeStatementRows, performanceMetricRows, periods } from './data.js';

type Periods = ReturnType<typeof periods>;

/** Three actual years (the latest footnoted), the projection years, then LTM / NTM. */
function columns(p: Periods, projYears: number[], editableTrail: boolean): GridColumn[] {
  return [
    fy(p.year - 2, 'hist'), fy(p.year - 1, 'hist'), { ...fy(p.year, 'hist'), footnote: editableTrail ? '1' : undefined },
    ...projYears.map((y) => fy(y, 'proj')),
    { key: 'ltm', label: p.ltm, zone: 'trail', group: 'LTM', editableDate: editableTrail },
    { key: 'ntm', label: p.ntm, zone: 'trail', group: 'NTM', editableDate: editableTrail },
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
  const p = periods(company);
  const [projYears, setProjYears] = useState(() => range(p.year + 1, p.year + 3));
  const extra = projYears.length - 3;

  return (
    <FinancialsPage
      company={company}
      tab="income-statement"
      versionMenuOpen={state === 'version-menu'}
      actionsMenuOpen={state === 'actions-menu'}
      notesOpen={state === 'notes-drawer'}
      onAddProjectionYear={() => setProjYears((ys) => [...ys, ys[ys.length - 1]! + 1])}
    >
      <FinancialGrid title="Income Statement" columns={columns(p, projYears, true)} rows={widen(incomeStatementRows(company), extra)} />
      <FinancialGrid title="Performance Metrics" columns={columns(p, projYears, false)} rows={widen(performanceMetricRows, extra)} />
    </FinancialsPage>
  );
}
