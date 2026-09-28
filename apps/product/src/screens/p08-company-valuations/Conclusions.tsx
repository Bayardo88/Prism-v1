/**
 * Valuations — Conclusions. The concluded value of every fund position: one
 * table per entity (ABC Co, Holding Co.), grouped by fund, with invested
 * capital, weighted value per share, shares, value and MOIC.
 */
import { Fragment } from 'react';
import {
  GridColumnHeader, GridValueCell, RowLabelCell, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, num, usd } from '../../data/fixtures.js';
import { Sheet, SheetRow } from '../p07-company-cap-table/Sheet.js';
import { ValuationsLayout } from './ValuationsLayout.js';
import { CONCLUSIONS } from './data.js';

const COLUMNS = 'minmax(0, 1.6fr) repeat(5, minmax(0, 1fr))';
const HEADERS = ['Invested Capital', 'Weighted Value per Share', '# of Shares', 'Value', 'MOIC'];
const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const moic = (value: number, invested: number) => `${(invested ? value / invested : 0).toFixed(2)}x`;

export function Conclusions({ params }: ScreenProps) {
  const company = companyById(params.companyId);
  return (
    <ValuationsLayout company={company} tab="conclusions">
      <div style={{ display: 'flex', flexDirection: 'column', gap: space['2xl'] }}>
        {CONCLUSIONS.map((c) => (
          <Sheet key={c.entity} label={`${c.entity} conclusions`} columns={COLUMNS} width="68%">
            <SheetRow label="Columns">
              <GridColumnHeader>{c.entity}</GridColumnHeader>
              {HEADERS.map((h) => <GridColumnHeader key={h} numeric>{h}</GridColumnHeader>)}
            </SheetRow>
            {c.funds.map((f) => {
              const invested = f.positions.reduce((a, p) => a + p.invested, 0);
              const shares = f.positions.reduce((a, p) => a + p.shares, 0);
              const value = f.positions.reduce((a, p) => a + p.value, 0);
              return (
                <Fragment key={f.fund}>
                  <SheetRow label={f.fund}>
                    <RowLabelCell type="group-header">{f.fund}</RowLabelCell>
                  </SheetRow>
                  {f.positions.map((p) => (
                    <SheetRow key={p.security} label={p.security}>
                      <RowLabelCell type="child">{p.security}</RowLabelCell>
                      <GridValueCell>{usd.format(p.invested)}</GridValueCell>
                      <GridValueCell>{money2.format(p.valuePerShare)}</GridValueCell>
                      <GridValueCell>{num.format(p.shares)}</GridValueCell>
                      <GridValueCell>{usd.format(p.value)}</GridValueCell>
                      <GridValueCell>{moic(p.value, p.invested)}</GridValueCell>
                    </SheetRow>
                  ))}
                  <SheetRow label={`${f.fund} Total`}>
                    <RowLabelCell type="total">{`${f.fund} Total`}</RowLabelCell>
                    <GridValueCell kind="total">{usd.format(invested)}</GridValueCell>
                    <GridValueCell kind="total" />
                    <GridValueCell kind="total">{num.format(shares)}</GridValueCell>
                    <GridValueCell kind="total">{usd.format(value)}</GridValueCell>
                    <GridValueCell kind="total">{moic(value, invested)}</GridValueCell>
                  </SheetRow>
                </Fragment>
              );
            })}
          </Sheet>
        ))}
      </div>
    </ValuationsLayout>
  );
}
