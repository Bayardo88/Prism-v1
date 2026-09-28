/**
 * Breakpoint Analysis — the equity values at which each security starts to
 * participate. Calculated from the company's cap table by default
 * (`breakpointsFor`); switching on custom breakpoints turns the per-security
 * amounts into inputs and lets the analyst add breakpoints.
 *
 * States: calculated (default) · custom-3 · custom-4 (one breakpoint added).
 */
import { useEffect, useState } from 'react';
import {
  DataGrid, Fab, GridColumnHeader, GridValueCell, Row, RowLabelCell, Switch, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { breakpointsFor } from './data.js';

const LETTERS = 'ABCDEFGHIJ';

interface Table { range: string[]; price: string[]; bySecurity: string[][]; total: string[] }

/** Custom breakpoints are symbolic ($A, $B…) until the analyst fills them in. */
function custom(n: number, securities: number): Table {
  const last = (i: number) => i === n - 1;
  const amounts = Array.from({ length: n }, (_, i) => (last(i) ? '0.00%' : '$0'));
  return {
    range: Array.from({ length: n }, (_, i) =>
      `${i === 0 ? '$0' : `$${LETTERS[i - 1]}`} to ${last(i) ? 'Infinity' : `$${LETTERS[i]}`}`),
    price: Array.from({ length: n }, (_, i) => (last(i) ? '∞%' : '$0.000')),
    bySecurity: Array.from({ length: securities }, () => amounts),
    total: amounts,
  };
}

const countFor = (state: string) => (state === 'custom-4' ? 4 : 3);

export function Breakpoints({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [useCustom, setUseCustom] = useState(state !== 'calculated');
  const [count, setCount] = useState(countFor(state));
  useEffect(() => { setUseCustom(state !== 'calculated'); setCount(countFor(state)); }, [state]);

  const calc = breakpointsFor(company);
  const data: Table = useCustom
    ? custom(count, calc.securities.length)
    : {
      range: calc.points.map((p) => p.range),
      price: calc.points.map((p) => p.price),
      bySecurity: calc.securities.map((_, si) => calc.points.map((p) => p.bySecurity[si]!)),
      total: calc.points.map((p) => p.total),
    };
  const input: ValueKind = useCustom ? 'editable' : 'calculated';

  let stripe = 0;
  const row = (label: string, labelType: RowLabelType, kind: ValueKind, values: string[]) => {
    stripe += 1;
    return (
      <Row key={label} zebra={labelType === 'line-item' && stripe % 2 === 0} type={labelType === 'total' ? 'total' : undefined} aria-label={label}>
        <RowLabelCell type={labelType}>{label}</RowLabelCell>
        {values.map((val, i) => <GridValueCell key={i} kind={kind}>{val}</GridValueCell>)}
      </Row>
    );
  };

  return (
    <CapTableLayout company={company} page="breakpoints" save={useCustom}>
      <Switch size="s" checked={useCustom} onChange={(e) => setUseCustom(e.currentTarget.checked)}>
        Use custom breakpoints?
      </Switch>

      <DataGrid
        label={useCustom ? 'Custom breakpoints' : 'Calculated breakpoints'}
        style={{ width: `${Math.min(100, 22 + 13 * data.range.length)}%` }}
        head={
          <>
            <GridColumnHeader grow={2}>{useCustom ? 'Custom Breakpoints' : 'Calculated Breakpoints'}</GridColumnHeader>
            {data.range.map((_, i) => <GridColumnHeader key={i} numeric>{`Breakpoint ${i + 1}`}</GridColumnHeader>)}
          </>
        }
      >
        {row('Breakpoint Range', 'line-item', 'calculated', data.range)}
        {row('Breakpoint Price per Common Share', 'subtotal', 'total', data.price)}
        {calc.securities.map((s, si) => row(s, 'line-item', input, data.bySecurity[si]!))}
        {row('Total', 'total', 'total', data.total)}
      </DataGrid>

      {useCustom && <Fab onClick={() => setCount((c) => Math.min(c + 1, LETTERS.length))}>Add Breakpoint</Fab>}
    </CapTableLayout>
  );
}
