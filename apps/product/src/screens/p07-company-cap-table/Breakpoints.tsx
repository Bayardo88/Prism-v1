/**
 * Breakpoint Analysis — the equity values at which each security starts to
 * participate. Calculated from the cap table by default; switching on custom
 * breakpoints turns the per-security amounts into inputs and lets the analyst
 * add breakpoints.
 *
 * States: calculated (default) · custom-3 · custom-4 (one breakpoint added).
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  Fab, GridColumnHeader, GridValueCell, RowLabelCell, Switch, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { Sheet, SheetRow, columnsFor, widthFor } from './Sheet.js';

const CALCULATED = {
  range: ['$0 to $1,112,233', '$1,112,233 to $90,001,121', '$90,001,121 to Infinity'],
  price: ['$0.000', '$1.000', 'Infinity'],
  common: ['$0', '$88,888,888', 'Pro Rata'],
  seriesA: ['$1,112,233', '$1,112,233', 'Pro Rata'],
  total: ['$1,112,233', '$90,001,121', 'Infinity'],
};

const LETTERS = 'ABCDEFGHIJ';
/** Custom breakpoints are symbolic ($A, $B…) until the analyst fills them in. */
function custom(n: number) {
  const last = (i: number) => i === n - 1;
  return {
    range: Array.from({ length: n }, (_, i) =>
      `${i === 0 ? '$0' : `$${LETTERS[i - 1]}`} to ${last(i) ? 'Infinity' : `$${LETTERS[i]}`}`),
    price: Array.from({ length: n }, (_, i) => (last(i) ? '∞%' : '$0.000')),
    common: Array.from({ length: n }, (_, i) => (last(i) ? '0.00%' : '$0')),
    seriesA: Array.from({ length: n }, (_, i) => (last(i) ? '0.00%' : '$0')),
    total: Array.from({ length: n }, (_, i) => (last(i) ? '0.00%' : '$0')),
  };
}

const countFor = (state: string) => (state === 'custom-4' ? 4 : 3);

export function Breakpoints({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [useCustom, setUseCustom] = useState(state !== 'calculated');
  const [count, setCount] = useState(countFor(state));
  useEffect(() => { setUseCustom(state !== 'calculated'); setCount(countFor(state)); }, [state]);

  const data = useCustom ? custom(count) : CALCULATED;
  const n = data.range.length;
  const input: ValueKind = useCustom ? 'editable' : 'calculated';

  const row = (label: string, labelType: 'line-item' | 'subtotal' | 'total', kind: ValueKind, values: string[]) => (
    <SheetRow key={label} label={label}>
      <RowLabelCell type={labelType}>{label}</RowLabelCell>
      {values.map((val, i) => <GridValueCell key={i} kind={kind}>{val}</GridValueCell>)}
    </SheetRow>
  );

  const header: ReactNode = (
    <SheetRow label="Breakpoints">
      <GridColumnHeader>{useCustom ? 'Custom Breakpoints' : 'Calculated Breakpoints'}</GridColumnHeader>
      {data.range.map((_, i) => <GridColumnHeader key={i} numeric>{`Breakpoint ${i + 1}`}</GridColumnHeader>)}
    </SheetRow>
  );

  return (
    <CapTableLayout company={company} page="breakpoints" save={useCustom}>
      <Switch size="s" checked={useCustom} onChange={(e) => setUseCustom(e.currentTarget.checked)}>
        Use custom breakpoints?
      </Switch>

      <Sheet label={useCustom ? 'Custom breakpoints' : 'Calculated breakpoints'} columns={columnsFor(n)} width={widthFor(n, 20, 12)}>
        {header}
        {row('Breakpoint Range', 'line-item', 'calculated', data.range)}
        {row('Breakpoint Price per Common Share', 'subtotal', 'total', data.price)}
        {row('Common', 'line-item', input, data.common)}
        {row('Series A', 'line-item', input, data.seriesA)}
        {row('Total', 'total', 'total', data.total)}
      </Sheet>

      {useCustom && <Fab onClick={() => setCount((c) => Math.min(c + 1, LETTERS.length))}>Add Breakpoint</Fab>}
    </CapTableLayout>
  );
}
