import { useState } from 'react';
import {
  DataGrid, GridColumnHeader, GridValueCell, Row, RowLabelCell, type SortDirection,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { ToolbarAi } from '../../shell/Toolbar.js';
import { CompanyActions, CurrencyUnit, SummarySubNav } from './CompanyChrome.js';
import { holdings, holdingsColumns, type HoldingRow } from './data.js';

const NEXT: Record<SortDirection, SortDirection> = { none: 'ascending', ascending: 'descending', descending: 'none' };

/** "$23,433" / "0.8%" / "08/07/2023" → a comparable number. */
function sortValue(v: string | undefined): number {
  if (!v) return -Infinity;
  const date = v.match(/^(\d\d)\/(\d\d)\/(\d{4})$/);
  if (date) return Date.UTC(+date[3]!, +date[1]! - 1, +date[2]!);
  const n = Number(v.replace(/[$,%]/g, ''));
  return Number.isNaN(n) ? -Infinity : n;
}

export function SummaryHoldings({ params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [sort, setSort] = useState<{ col: number; dir: SortDirection }>({ col: -1, dir: 'none' });
  const all = holdings(company);

  // Only the positions inside the fund reorder; the band and totals stay put.
  const lines = all.filter((h) => h.type === 'line-item');
  if (sort.dir !== 'none') {
    const sign = sort.dir === 'ascending' ? 1 : -1;
    lines.sort((a, b) => sign * (sortValue(a.values[sort.col]) - sortValue(b.values[sort.col])));
  }
  const rows: HoldingRow[] = [
    ...all.filter((h) => h.type === 'group-header'),
    ...lines,
    ...all.filter((h) => h.type === 'subtotal' || h.type === 'total'),
  ];

  const cycle = (col: number) => setSort((s) => ({ col, dir: s.col === col ? NEXT[s.dir] : 'ascending' }));

  return (
    <CompanyLayout
      company={company}
      section="summary"
      headerEnd={<CompanyActions company={company} />}
      subNav={<SummarySubNav company={company} current="holdings" />}
      subNavEnd={<><ToolbarAi /><CurrencyUnit /></>}
    >
      <DataGrid
        label="Summary holdings"
        head={
          <>
            <GridColumnHeader grow={1.8}>Type of Security</GridColumnHeader>
            {holdingsColumns.map((h, i) => (
              <GridColumnHeader key={h} numeric sort={sort.col === i ? sort.dir : 'none'} onSort={() => cycle(i)}>{h}</GridColumnHeader>
            ))}
          </>
        }
      >
        {rows.map((r, ri) => (
          <Row key={r.label} type={r.type === 'total' ? 'total' : undefined} zebra={r.type === 'line-item' && ri % 2 === 0}>
            {r.type === 'group-header' ? (
              <RowLabelCell type="group-header" span={holdingsColumns.length + 1}>{r.label}</RowLabelCell>
            ) : (
              <>
                <RowLabelCell type={r.type}>{r.label}</RowLabelCell>
                {holdingsColumns.map((h, i) => (
                  <GridValueCell key={h} kind={r.type === 'total' ? 'total' : 'calculated'}>{r.values[i]}</GridValueCell>
                ))}
              </>
            )}
          </Row>
        ))}
      </DataGrid>
    </CompanyLayout>
  );
}
