/**
 * Breakpoint Analysis — the equity values at which each security starts to
 * participate. Calculated from the company's cap table by default
 * (`breakpointsFor`); switching on custom breakpoints turns the per-security
 * amounts into inputs and lets the analyst add breakpoints.
 *
 * States: calculated (default) · custom-3 · custom-4 (one breakpoint added).
 */
import { useCallback } from 'react';
import {
  Banner, DataGrid, Fab, Text, GridColumnHeader, GridValueCell, Row, RowLabelCell, Switch, type RowLabelType, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { breakpointsFor } from './data.js';
import { useValuationContext, valuation } from '../../domain/context.js';
import { useEditor } from '../../domain/useEditor.js';
import { descendingAt, parseNumber } from '../../domain/validation.js';
import { ABSENCE_LABEL } from '../../domain/display.js';
import { EditCell } from '../../shell/EditCell.js';

const LETTERS = 'ABCDEFGHIJ';
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

interface Table { range: string[]; price: string[]; bySecurity: string[][]; total: string[] }

/**
 * Custom breakpoints are symbolic ($A, $B…) until the analyst enters the equity
 * value where each one ends; the last always runs to Infinity.
 */
function custom(bounds: ReadonlyArray<number | undefined>, securities: number): Table {
  const n = bounds.length + 1;
  const last = (i: number) => i === n - 1;
  const at = (i: number) => (i < 0 ? '$0' /* lint-allow: real-zero (the first range starts at zero) */ : bounds[i] !== undefined ? usd0.format(bounds[i]!) : `$${LETTERS[i]}`);
  // Amounts are not calculated for a custom schedule in the prototype (P5, P6).
  const amounts = Array.from({ length: n }, () => ABSENCE_LABEL['not-calculated']);
  return {
    range: Array.from({ length: n }, (_, i) => `${at(i - 1)} to ${last(i) ? 'Infinity' : at(i)}`),
    price: Array.from({ length: n }, (_, i) => (last(i) ? 'Infinity' : ABSENCE_LABEL['not-calculated'])),
    bySecurity: Array.from({ length: securities }, () => amounts),
    total: amounts,
  };
}

const countFor = (state: string) => (state === 'custom-4' ? 4 : 3);

export function Breakpoints({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const ctx = useValuationContext(company);
  const { capTable } = ctx;
  // The mode is part of the valuation context, so Waterfall can say which set it uses (UX-01).
  const useCustom = state === 'calculated' ? ctx.ctx.breakpointMode === 'custom' : true;
  const setUseCustom = (on: boolean) => valuation.setContext(company, { breakpointMode: on ? 'custom' : 'calculated' });

  // P7: custom breakpoints ascend (DOC). Reported on Save, never reordered.
  const validate = useCallback((bounds: Array<number | undefined>) =>
    descendingAt(bounds).map((i) => ({ label: `Breakpoint ${i + 1} must end above Breakpoint ${i}.` })), []);
  const ed = useEditor<Array<number | undefined>>(() => Array.from({ length: countFor(state) - 1 }, () => undefined), { validate, readOnly: ctx.readOnly });
  const bad = new Set(ed.showErrors ? descendingAt(ed.data) : []);

  const calc = breakpointsFor(company, capTable.scenario);
  const data: Table = useCustom
    ? custom(ed.data, calc.securities.length)
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
    <CapTableLayout company={company} page="breakpoints" save={useCustom} onSave={ed.save} saveState={ed.saveState} overlay={ed.guard.dialog}>
      <Switch size="s" checked={useCustom} onChange={(e) => setUseCustom(e.currentTarget.checked)}>
        Use custom breakpoints?
      </Switch>
      <Text step="s" tone="secondary">
        {useCustom
          ? `Waterfall uses these custom breakpoints for ${capTable.name}.`
          : `Waterfall uses the breakpoints calculated from ${capTable.name}.`}
      </Text>
      {ed.showErrors && <Banner tone="negative" title="To save, enter breakpoints in ascending order." issues={ed.issues} />}

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
        {useCustom && (
          <Row aria-label="Ends at equity value">
            <RowLabelCell>Ends at Equity Value</RowLabelCell>
            {ed.data.map((b, i) => (
              <EditCell
                key={i}
                label={`Breakpoint ${i + 1} ends at`}
                value={b === undefined ? '' : usd0.format(b)}
                onCommit={(t) => ed.update((cur) => cur.map((x, j) => (j === i ? parseNumber(t) : x)))}
                error={bad.has(i) ? `Must be above Breakpoint ${i}` : null}
                readOnly={ctx.readOnly}
              />
            ))}
            <GridValueCell state="not-applicable">Infinity</GridValueCell>
          </Row>
        )}
        {row('Breakpoint Price per Common Share', 'subtotal', 'total', data.price)}
        {calc.securities.map((s, si) => row(s, 'line-item', input, data.bySecurity[si]!))}
        {row('Total', 'total', 'total', data.total)}
      </DataGrid>

      {useCustom && <Fab onClick={() => ed.update((cur) => (cur.length + 1 < LETTERS.length ? [...cur, undefined] : cur))}>Add Breakpoint</Fab>}
    </CapTableLayout>
  );
}
