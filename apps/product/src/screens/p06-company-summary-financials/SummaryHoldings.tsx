import { useState, type CSSProperties } from 'react';
import {
  GridColumnHeader, GridValueCell, RowLabelCell, color, type SortDirection,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { CompanyLayout } from '../../shell/CompanyLayout.js';
import { CompanyActions, CurrencyUnit, SummarySubNav } from './CompanyChrome.js';
import { holdings, holdingsColumns, type HoldingRow } from './data.js';

const labelBox: CSSProperties = { flex: '1.8 1 0', minWidth: 0, display: 'grid' };
const valueBox: CSSProperties = { flex: '1 1 0', minWidth: 0, display: 'grid' };

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

  // Only the positions inside the fund reorder; the band and totals stay put.
  const lines = holdings.filter((h) => h.type === 'line-item');
  if (sort.dir !== 'none') {
    const sign = sort.dir === 'ascending' ? 1 : -1;
    lines.sort((a, b) => sign * (sortValue(a.values[sort.col]) - sortValue(b.values[sort.col])));
  }
  const rows: HoldingRow[] = [
    ...holdings.filter((h) => h.type === 'group-header'),
    ...lines,
    ...holdings.filter((h) => h.type === 'subtotal' || h.type === 'total'),
  ];

  const cycle = (col: number) => setSort((s) => ({ col, dir: s.col === col ? NEXT[s.dir] : 'ascending' }));

  return (
    <CompanyLayout
      company={company}
      section="summary"
      headerEnd={<CompanyActions company={company} />}
      subNav={<SummarySubNav company={company} current="holdings" />}
      subNavEnd={<CurrencyUnit />}
    >
      <div role="grid" aria-label="Summary holdings" style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto', background: color.bg.surface }}>
        <div role="row" style={{ display: 'flex' }}>
          <div style={labelBox}><GridColumnHeader>Type of Security</GridColumnHeader></div>
          {holdingsColumns.map((h, i) => (
            <div key={h} style={valueBox}>
              <GridColumnHeader numeric sort={sort.col === i ? sort.dir : 'none'} onSort={() => cycle(i)}>{h}</GridColumnHeader>
            </div>
          ))}
        </div>

        {rows.map((r) => (
          <div role="row" key={r.label} style={{ display: 'flex' }}>
            {r.type === 'group-header' ? (
              <div style={{ flex: 1, display: 'grid' }}><RowLabelCell type="group-header">{r.label}</RowLabelCell></div>
            ) : (
              <>
                <div style={labelBox}><RowLabelCell type={r.type}>{r.label}</RowLabelCell></div>
                {holdingsColumns.map((h, i) => (
                  <div key={h} style={valueBox}>
                    <GridValueCell kind={r.type === 'total' ? 'total' : 'calculated'}>{r.values[i]}</GridValueCell>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </CompanyLayout>
  );
}
