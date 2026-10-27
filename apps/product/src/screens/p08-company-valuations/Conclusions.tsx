/**
 * Valuations — Conclusions. The concluded value of every fund position: one
 * table per entity (ABC Co, Holding Co.), grouped by fund, with invested
 * capital, weighted value per share, shares, value and MOIC.
 */
import { Fragment } from 'react';
import {
  DataGrid, GridColumnHeader, GridValueCell, Row, RowLabelCell, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, num, usd } from '../../data/fixtures.js';
import { ValuationsLayout } from './ValuationsLayout.js';
import { conclusionsFor } from './data.js';
import { displayValue, type Absence } from '../../domain/display.js';
import { moic } from '../../domain/illustrative-calcs.js';

const HEADERS = ['Invested Capital', 'Weighted Value per Share', '# of Shares', 'Value', 'MOIC'];
const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const x2 = (v: number) => `${v.toFixed(2)}x`;

export function Conclusions({ params }: ScreenProps) {
  const company = companyById(params.companyId);
  return (
    <ValuationsLayout company={company} tab="conclusions">
      <div style={{ display: 'flex', flexDirection: 'column', gap: space['2xl'] }}>
        {conclusionsFor(company).map((c) => {
          // Until an approach concludes, value, per-share value and MOIC do not exist yet (P5).
          const absent: Absence | undefined = c.concluded ? undefined : 'not-calculated';
          const show = (v: number | undefined, f: (n: number) => string) => displayValue(v, f, absent);
          return (
          <DataGrid
            key={c.entity}
            label={`${c.entity} conclusions`}
            style={{ width: '70%' }}
            head={
              <>
                <GridColumnHeader grow={1.6}>{c.entity}</GridColumnHeader>
                {HEADERS.map((h) => <GridColumnHeader key={h} numeric>{h}</GridColumnHeader>)}
              </>
            }
          >
            {c.funds.map((f) => {
              const invested = f.positions.reduce((a, p) => a + p.invested, 0);
              const shares = f.positions.reduce((a, p) => a + p.shares, 0);
              const value = f.positions.reduce((a, p) => a + p.value, 0);
              return (
                <Fragment key={f.fund}>
                  <Row aria-label={f.fund}>
                    <RowLabelCell type="group-header">{f.fund}</RowLabelCell>
                  </Row>
                  {f.positions.map((p, i) => (
                    <Row key={p.security} aria-label={p.security} zebra={i % 2 === 1}>
                      <RowLabelCell type="child">{p.security}</RowLabelCell>
                      <GridValueCell>{usd.format(p.invested)}</GridValueCell>
                      <GridValueCell>{show(p.valuePerShare, money2.format)}</GridValueCell>
                      <GridValueCell>{num.format(p.shares)}</GridValueCell>
                      <GridValueCell>{show(p.value, usd.format)}</GridValueCell>
                      <GridValueCell>{show(moic(p.value, p.invested), x2)}</GridValueCell>
                    </Row>
                  ))}
                  <Row type="total" aria-label={`${f.fund} Total`}>
                    <RowLabelCell type="total">{`${f.fund} Total`}</RowLabelCell>
                    <GridValueCell kind="total">{usd.format(invested)}</GridValueCell>
                    <GridValueCell kind="total" />
                    <GridValueCell kind="total">{num.format(shares)}</GridValueCell>
                    <GridValueCell kind="total">{show(value, usd.format)}</GridValueCell>
                    <GridValueCell kind="total">{show(moic(value, invested), x2)}</GridValueCell>
                  </Row>
                </Fragment>
              );
            })}
          </DataGrid>
          );
        })}
      </div>
    </ValuationsLayout>
  );
}
