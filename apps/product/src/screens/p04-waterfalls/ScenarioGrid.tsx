/**
 * Waterfall scenario sheet — the assumptions grid shared by the firm-level
 * Waterfalls page (p04) and the company Waterfall page (p09).
 *
 * One label column, then one value column per currency: the first column is
 * the scenario's own inputs (in-cell pickers, editable figures); a second,
 * converted column appears when the company reports in a currency other than
 * the display currency. Built on DataGrid: the subtle ColumnHeader band sizes
 * the tracks, RowLabelCell / GridValueCell / InCellControl sit directly in Row.
 * Blue = editable, green = sourced (AI-GUIDE §5).
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  Chip, ColumnHeader, DataGrid, GridValueCell, InCellControl, Row, RowLabelCell, space, zIndex,
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
  /** Figures in millions of `currency`. */
  exitEnterpriseValue: number;
  cash: number;
  debt: number;
  /** Firm's share of exit equity, %. */
  ownershipPct: number;
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

const money = (col: ScenarioColumn, v: number, digits = 1) =>
  `${col.symbol}${v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export function ScenarioGrid({
  columns, withCompany, band, companyOpen, onCompanyClick, companyPicker, label = 'Waterfall scenario',
}: ScenarioGridProps) {
  const pick = (col: ScenarioColumn, name: string, value: string | undefined, type: 'select' | 'date' = 'select') =>
    col.editable
      ? <InCellControl key={col.key} type={type} label={name}>{value}</InCellControl>
      : <GridValueCell key={col.key}>{value ?? '—'}</GridValueCell>;

  // The DataGrid clips overflow (it scrolls sideways), so the company picker is
  // drawn outside it, anchored to the Company cell's measured position.
  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  useLayoutEffect(() => {
    if (!companyOpen || !wrapRef.current || !anchorRef.current) { setAnchor(null); return; }
    const w = wrapRef.current.getBoundingClientRect();
    const a = anchorRef.current.getBoundingClientRect();
    setAnchor({ top: a.bottom - w.top, left: a.left - w.left });
  }, [companyOpen]);

  let n = 0;
  const row = (name: string, render: (col: ScenarioColumn) => ReactNode, kind: 'line-item' | 'child' | 'total' = 'line-item') => (
    <Row key={name} zebra={kind !== 'total' && n++ % 2 === 1}>
      <RowLabelCell type={kind}>{name}</RowLabelCell>
      {columns.map(render)}
    </Row>
  );

  const equity = (c: ScenarioColumn) => c.exitEnterpriseValue + c.cash - c.debt;

  const companyRow = () => (
    <Row key="Company" zebra={n++ % 2 === 1}>
      <RowLabelCell>Company</RowLabelCell>
      {columns.map((c, i) => (i === 0 && c.editable ? (
        // Anchor for the picker: the one cell that owns a popover needs a measurable wrapper.
        <div key={c.key} ref={anchorRef} data-popover-trigger="" style={{ display: 'grid' }}>
          <InCellControl type="select" label="Company" open={companyOpen} onClick={onCompanyClick}>{c.company}</InCellControl>
        </div>
      ) : <GridValueCell key={c.key}>{c.company ?? '—'}</GridValueCell>))}
    </Row>
  );

  return (
    // Width of the sheet on the page; the DataGrid sizes its own columns.
    <div ref={wrapRef} style={{ position: 'relative', width: columns.length > 1 ? '42%' : '28%', minWidth: 0 }}>
      <DataGrid
        label={label}
        head={
          <>
            <ColumnHeader tone="subtle" grow={2}>
              {band && <span style={{ display: 'inline-flex', gap: space.xs }}><Chip styleVariant="positive">{band.rate}</Chip><Chip styleVariant="default">{band.unit}</Chip></span>}
            </ColumnHeader>
            {columns.map((c) => (
              <ColumnHeader key={c.key} tone="subtle" numeric grow={2}>{columns.length > 1 ? c.currency : ''}</ColumnHeader>
            ))}
          </>
        }
      >
        {row('Currency', (c) => <InCellControl key={c.key} type="currency" label={`${c.currency} currency`}>{c.currency}</InCellControl>)}
        {withCompany && companyRow()}
        {withCompany && row('Cap Table Date', (c) => pick(c, 'Cap table date', c.capTableDate))}
        {row('Cap Table', (c) => pick(c, 'Cap table', c.capTable))}
        {row('Exit Date', (c) => pick(c, 'Exit date', c.exitDate, 'date'))}
        {row('Foreign Exchange Rate', (c) => <GridValueCell key={c.key} kind="sourced">{money(c, c.fxRate, 2)}</GridValueCell>)}
        {row('Exit Enterprise Value', (c) => <GridValueCell key={c.key} kind="editable">{money(c, c.exitEnterpriseValue)}</GridValueCell>)}
        {row('Plus Cash', (c) => <GridValueCell key={c.key} kind="sourced">{money(c, c.cash)}</GridValueCell>, 'child')}
        {row('Less Debt', (c) => <GridValueCell key={c.key} kind="sourced">{money(c, c.debt)}</GridValueCell>, 'child')}
        {row('Exit Equity Value', (c) => <GridValueCell key={c.key} kind="editable">{money(c, equity(c))}</GridValueCell>)}
        {row('Firm Total Exit Proceeds', (c) => <GridValueCell key={c.key} kind="total">{money(c, (Math.max(0, equity(c)) * c.ownershipPct) / 100)}</GridValueCell>, 'total')}
      </DataGrid>
      {companyOpen && companyPicker && anchor && (
        <div style={{ position: 'absolute', top: anchor.top, left: anchor.left, zIndex: zIndex.overlay }}>{companyPicker}</div>
      )}
    </div>
  );
}
