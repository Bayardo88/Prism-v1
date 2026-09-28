/**
 * Waterfall scenario sheet — the assumptions grid shared by the firm-level
 * Waterfalls page (p04) and the company Waterfall page (p09).
 *
 * One label column, then one value column per currency: the first column is
 * the scenario's own inputs (in-cell pickers, editable figures); a second,
 * converted column appears when the company reports in a currency other than
 * the display currency. Row hierarchy comes from RowLabelCell, figures from
 * GridValueCell — blue = editable, green = sourced (AI-GUIDE §5).
 */
import type { ReactNode } from 'react';
import {
  Chip, DataGrid, GridValueCell, InCellControl, Row, RowLabelCell, Text, color, size, space, zIndex,
} from '@scalar/design-system';

export interface ScenarioColumn {
  key: string;
  currency: string;
  /** Prefix for money figures: "$", "€", "NIO ". */
  symbol: string;
  /** The scenario's input column (pickers). The converted column is read-only. */
  editable: boolean;
  company?: string;
  capTableDate?: string;
  capTable?: string;
  exitDate: string;
  fxRate: number;
  exitEnterpriseValue: number;
  cash: number;
  debt: number;
}

export interface ScenarioGridProps {
  columns: ScenarioColumn[];
  /** Firm-level scenarios pick the company and cap-table date; company pages do not. */
  withCompany?: boolean;
  /** Head band chips, e.g. { rate: '1 NIO → 0.02 EUR', unit: '(€) Millions' }. */
  band?: { rate: string; unit: string };
  companyOpen?: boolean;
  onCompanyClick?: () => void;
  /** Popover drawn under the Company cell (a ComboboxPanel). */
  companyPicker?: ReactNode;
  label?: string;
}

const LABEL_COL = { flex: '2 1 0', minWidth: 0, display: 'grid' } as const;
const VALUE_COL = { flex: '2 1 0', minWidth: 0, display: 'grid' } as const;

const money = (col: ScenarioColumn, v: number, digits = 0) =>
  `${col.symbol}${v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export function ScenarioGrid({
  columns, withCompany, band, companyOpen, onCompanyClick, companyPicker, label = 'Waterfall scenario',
}: ScenarioGridProps) {
  const pick = (col: ScenarioColumn, name: string, value: string | undefined, type: 'select' | 'date' = 'select', open?: boolean, onClick?: () => void) =>
    col.editable
      ? <InCellControl type={type} label={name} open={open} onClick={onClick}>{value}</InCellControl>
      : <GridValueCell>{value ?? '—'}</GridValueCell>;

  const row = (name: string, render: (col: ScenarioColumn) => ReactNode, opts: { child?: boolean; total?: boolean; extra?: ReactNode } = {}) => (
    <Row key={name}>
      <div style={LABEL_COL}>
        <RowLabelCell type={opts.total ? 'total' : opts.child ? 'child' : 'line-item'}>{name}</RowLabelCell>
      </div>
      {columns.map((col, i) => (
        <div key={col.key} data-popover-trigger={i === 0 && opts.extra !== undefined ? '' : undefined} style={{ ...VALUE_COL, position: 'relative' }}>
          {render(col)}
          {i === 0 && opts.extra}
        </div>
      ))}
    </Row>
  );

  const equity = (c: ScenarioColumn) => c.exitEnterpriseValue + c.cash - c.debt;

  return (
    <div style={{ width: columns.length > 1 ? '42%' : '28%', minWidth: 0 }}>
      <DataGrid
        label={label}
        head={
          <div style={{ display: 'flex', flex: 1, minHeight: size.row.compact, borderBottom: `2px solid ${color.stroke.strong}`, background: color.bg.subtle }}>
            <div role="columnheader" style={{ ...LABEL_COL, display: 'flex', gap: space.xs, alignItems: 'center', padding: `0 ${space.xs}` }}>
              {band && <><Chip styleVariant="positive">{band.rate}</Chip><Chip styleVariant="default">{band.unit}</Chip></>}
            </div>
            {columns.map((c) => (
              <div key={c.key} role="columnheader" style={{ ...VALUE_COL, alignItems: 'center', justifyItems: 'end', padding: `0 ${space.s}` }}>
                {columns.length > 1 && <Text step="s" weight="semiBold" tone="secondary">{c.currency}</Text>}
              </div>
            ))}
          </div>
        }
      >
        {row('Currency', (c) => <InCellControl type="currency" label={`${c.currency} currency`}>{c.currency}</InCellControl>)}
        {withCompany && row('Company', (c) => pick(c, 'Company', c.company, 'select', companyOpen, onCompanyClick), {
          extra: companyOpen && companyPicker ? (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: zIndex.overlay }}>{companyPicker}</div>
          ) : null,
        })}
        {withCompany && row('Cap Table Date', (c) => pick(c, 'Cap table date', c.capTableDate))}
        {row('Cap Table', (c) => pick(c, 'Cap table', c.capTable))}
        {row('Exit Date', (c) => pick(c, 'Exit date', c.exitDate, 'date'))}
        {row('Foreign Exchange Rate', (c) => <GridValueCell kind="sourced">{money(c, c.fxRate, 2)}</GridValueCell>)}
        {row('Exit Enterprise Value', (c) => <GridValueCell kind="editable">{money(c, c.exitEnterpriseValue)}</GridValueCell>)}
        {row('Plus Cash', (c) => <GridValueCell kind="sourced">{money(c, c.cash)}</GridValueCell>, { child: true })}
        {row('Less Debt', (c) => <GridValueCell kind="sourced">{money(c, c.debt)}</GridValueCell>, { child: true })}
        {row('Exit Equity Value', (c) => <GridValueCell kind="editable">{money(c, equity(c))}</GridValueCell>)}
        {row('Firm Total Exit Proceeds', (c) => <GridValueCell kind="total">{money(c, 0)}</GridValueCell>, { total: true })}
      </DataGrid>
    </div>
  );
}
