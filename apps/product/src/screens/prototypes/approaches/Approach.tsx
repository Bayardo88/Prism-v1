/**
 * Approach prototypes — the four approach tabs with no Figma frame yet:
 * External Valuation, Specified Share Value, Public Comps and Transaction Comps
 * (training C09–C11, domain-logic.md §2, §5–§7).
 *
 * What they show, per the contract:
 * - The context they read: measurement, market date, Cap Table / valuation version (P1, P2).
 * - Provenance: provider-fetched rows (green, with the market date) apart from
 *   manual ones (blue), and missing provider data as "—", never 0 (C10, P5).
 * - Weights that must total 100%, reported not rescaled (C11, P7).
 * - Specified Share Value reads the Cap Table version in view, so switching
 *   version never shows the other version's shares (BUG-04).
 *
 * No approach result is computed: multiples, statistics and enterprise →
 * equity bridges are P0 open questions. Results read "Not calculated".
 */
import { useCallback, useMemo, useState, type ReactElement } from 'react';
import {
  Banner, Button, DataFreshness, DataGrid, ColumnHeader, GridValueCell, Heading, Icon, Row, RowLabelCell,
  SegmentedControl, Text, icons, space,
} from '@scalar/design-system';
import type { ScreenProps } from '../../../types.js';
import { companyById, num, type Company } from '../../../data/fixtures.js';
import { useValuationContext } from '../../../domain/context.js';
import { ABSENCE_LABEL, displayValue, pct1 } from '../../../domain/display.js';
import { usFromIso } from '../../../domain/model.js';
import { useEditor } from '../../../domain/useEditor.js';
import { parseNumber, weightIssue } from '../../../domain/validation.js';
import { EditCell } from '../../../shell/EditCell.js';
import { ValuationsLayout } from '../../p08-company-valuations/ValuationsLayout.js';
import { securitiesFor } from '../../p07-company-cap-table/data.js';
import { APPROACH_TITLES, PUBLIC_COMPS, TRANSACTION_COMPS, type ApproachKey, type Comparable } from './data.js';

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const m$ = (v: number) => `${usd0.format(v)}M`;

/** One screen component per approach, for the registry. */
export const approachScreen = (key: ApproachKey) => function ApproachScreen(props: ScreenProps) {
  return <Approach {...props} approach={key} />;
};

export function Approach({ params, approach: key }: ScreenProps & { approach: ApproachKey }) {
  const company = companyById(params.companyId);
  const v = useValuationContext(company);

  const body = key === 'external-valuation' ? <ExternalValuation company={company} />
    : key === 'specified-share-value' ? <SpecifiedShareValue company={company} />
      : <Comparables company={company} kind={key === 'public-comps' ? 'public' : 'transaction'} />;

  return (
    <ValuationsLayout company={company} tab={key}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.l }}>
        <Heading level={1} step="m">{APPROACH_TITLES[key]}</Heading>
        <Text step="s" tone="secondary">
          {`${v.valuation?.name ?? 'No valuation version'} · measurement ${usFromIso(v.measurement.date)} · market date ${usFromIso(v.measurement.marketDate)}`}
        </Text>
        {body}
      </div>
    </ValuationsLayout>
  );
}

/* ---------------------------------------------------------- External Valuation */

interface External { source: string; date: string; ev?: number; equity?: number }

function ExternalValuation({ company }: { company: Company }) {
  const { readOnly } = useValuationContext(company);
  const ed = useEditor<External>(() => ({ source: '', date: '' }), { readOnly });
  const set = (patch: Partial<External>) => ed.update((cur) => ({ ...cur, ...patch }));
  return (
    <>
      <Text step="m">An appraisal prepared outside Scalar. Every figure here is entered by the analyst and keeps its source.</Text>
      <DataGrid label="External valuation" style={{ width: '50%' }} head={<><ColumnHeader grow={2}>Input</ColumnHeader><ColumnHeader numeric>Value</ColumnHeader></>}>
        <Row aria-label="Source"><RowLabelCell>Source (appraiser or document)</RowLabelCell>
          <EditCell label="Source" value={ed.data.source} onCommit={(t) => set({ source: t })} readOnly={readOnly} /></Row>
        <Row aria-label="Appraisal date" zebra><RowLabelCell>Appraisal date</RowLabelCell>
          <EditCell label="Appraisal date" placeholder="MM/DD/YYYY" value={ed.data.date} onCommit={(t) => set({ date: t })} readOnly={readOnly} /></Row>
        <Row aria-label="Enterprise value"><RowLabelCell>Enterprise Value</RowLabelCell>
          <EditCell label="Enterprise value" value={ed.data.ev === undefined ? '' : usd0.format(ed.data.ev)} onCommit={(t) => set({ ev: parseNumber(t) })} readOnly={readOnly} /></Row>
        <Row aria-label="Equity value" zebra><RowLabelCell>Equity Value</RowLabelCell>
          <EditCell label="Equity value" value={ed.data.equity === undefined ? '' : usd0.format(ed.data.equity)} onCommit={(t) => set({ equity: parseNumber(t) })} readOnly={readOnly} /></Row>
      </DataGrid>
      <SaveRow ed={ed} />
    </>
  );
}

/* -------------------------------------------------------- Specified Share Value */

function SpecifiedShareValue({ company }: { company: Company }) {
  const { capTable, readOnly } = useValuationContext(company);
  // The securities of the Cap Table version in view — never another version's (BUG-04).
  const securities = securitiesFor(company, capTable.scenario);
  const ed = useEditor<Record<string, number | undefined>>(() => ({}), { readOnly });
  return (
    <>
      <Text step="m">{`The analyst specifies a price per share for each series of ${capTable.name}. Share counts come from that Cap Table version.`}</Text>
      <DataGrid
        label="Specified share values"
        style={{ width: '70%' }}
        head={<><ColumnHeader grow={2}>Security</ColumnHeader><ColumnHeader numeric>Shares</ColumnHeader><ColumnHeader numeric>Price per Share</ColumnHeader><ColumnHeader numeric>Value</ColumnHeader></>}
      >
        {securities.map((s, i) => (
          <Row key={s.id} aria-label={s.name} zebra={i % 2 === 1}>
            <RowLabelCell>{s.name}</RowLabelCell>
            <GridValueCell kind="sourced">{num.format(s.sharesOutstanding ?? 0)}</GridValueCell>
            <EditCell
              label={`Price per share of ${s.name}`}
              value={ed.data[s.id] === undefined ? '' : usd2.format(ed.data[s.id]!)}
              onCommit={(t) => ed.update((cur) => ({ ...cur, [s.id]: parseNumber(t) }))}
              readOnly={readOnly}
            />
            <GridValueCell>{ABSENCE_LABEL['not-calculated']}</GridValueCell>
          </Row>
        ))}
        <Row type="total" aria-label="Specified share value total">
          <RowLabelCell type="total">Total</RowLabelCell>
          <GridValueCell kind="total">{num.format(securities.reduce((a, s) => a + (s.sharesOutstanding ?? 0), 0))}</GridValueCell>
          <GridValueCell kind="total" />
          <GridValueCell kind="total">{ABSENCE_LABEL['not-calculated']}</GridValueCell>
        </Row>
      </DataGrid>
      <Text step="s" tone="secondary">Values are not calculated in the prototype: how series aggregate and dilute is not yet specified.</Text>
      <SaveRow ed={ed} />
    </>
  );
}

/* ------------------------------------------------- Public / Transaction Comps */

type Stat = 'mean' | 'median' | 'p25' | 'p75';

function Comparables({ company, kind }: { company: Company; kind: 'public' | 'transaction' }) {
  const { measurement, readOnly } = useValuationContext(company);
  const [stat, setStat] = useState<Stat>('median');
  const validate = useCallback((d: { rows: Comparable[]; weights: { revenue: number; ebitda: number } }) => {
    const issue = weightIssue([d.weights.revenue, d.weights.ebitda], 'Metric weights');
    return issue ? [{ label: issue.message }] : [];
  }, []);
  const ed = useEditor(
    () => ({ rows: kind === 'public' ? PUBLIC_COMPS : TRANSACTION_COMPS, weights: { revenue: 50, ebitda: 50 } }),
    { validate, readOnly },
  );
  const rows = ed.data.rows;
  const metricIssue = weightIssue([ed.data.weights.revenue, ed.data.weights.ebitda], 'Metric weights');
  const addManual = () => ed.update((cur) => ({
    ...cur,
    rows: [...cur.rows, { id: `m${cur.rows.length + 1}`, name: '', ref: '', source: 'manual' }],
  }));
  const setRow = (id: string, patch: Partial<Comparable>) =>
    ed.update((cur) => ({ ...cur, rows: cur.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  const setWeight = (k: 'revenue' | 'ebitda', w: number) => ed.update((cur) => ({ ...cur, weights: { ...cur.weights, [k]: w } }));
  const money = (r: Comparable, field: 'ev' | 'revenueLtm' | 'ebitdaLtm', label: string) => (r.source === 'manual'
    ? <EditCell label={`${label} of ${r.name || 'manual comparable'}`} value={r[field] === undefined ? '' : m$(r[field]!)} onCommit={(t) => setRow(r.id, { [field]: parseNumber(t) })} readOnly={readOnly} />
    : <GridValueCell kind="sourced">{displayValue(r[field], m$)}</GridValueCell>);

  const freshness = useMemo(() => `Market data as of ${usFromIso(measurement.marketDate)}`, [measurement.marketDate]);

  return (
    <>
      <div style={{ display: 'flex', gap: space.l, alignItems: 'center', flexWrap: 'wrap' }}>
        <DataFreshness state="current">{freshness}</DataFreshness>
        <Text step="s" tone="secondary">Change the Market Date in the header to refresh provider figures. The measurement date does not change.</Text>
      </div>
      {ed.showErrors && <Banner tone="negative" title="To save, make the metric weights total 100%." issues={ed.issues} />}
      <DataGrid
        label={kind === 'public' ? 'Public comparables' : 'Transaction comparables'}
        head={
          <>
            <ColumnHeader grow={2}>{kind === 'public' ? 'Company' : 'Transaction'}</ColumnHeader>
            <ColumnHeader>{kind === 'public' ? 'Ticker' : 'Transaction ID'}</ColumnHeader>
            <ColumnHeader>Source</ColumnHeader>
            <ColumnHeader numeric>Enterprise Value</ColumnHeader>
            <ColumnHeader numeric>Revenue (LTM)</ColumnHeader>
            <ColumnHeader numeric>EBITDA (LTM)</ColumnHeader>
          </>
        }
      >
        {rows.map((r, i) => (
          <Row key={r.id} aria-label={r.name || 'Manual comparable'} zebra={i % 2 === 1}>
            {r.source === 'manual'
              ? <EditCell label="Comparable name" value={r.name} onCommit={(t) => setRow(r.id, { name: t })} readOnly={readOnly} />
              : <RowLabelCell>{r.name}</RowLabelCell>}
            <GridValueCell kind={r.source === 'manual' ? 'editable' : 'sourced'}>{r.ref || '—'}</GridValueCell>
            <GridValueCell>{r.source === 'manual' ? 'Manual entry' : `Provider · ${usFromIso(measurement.marketDate)}`}</GridValueCell>
            {money(r, 'ev', 'Enterprise value')}
            {money(r, 'revenueLtm', 'Revenue')}
            {money(r, 'ebitdaLtm', 'EBITDA')}
          </Row>
        ))}
      </DataGrid>
      <div>
        <Button variant="secondary" leadingIcon={<Icon size="s" tone="inherit"><icons.Add /></Icon>} onClick={addManual} disabled={readOnly}>
          {kind === 'public' ? 'Add manual comparable' : 'Add manual transaction'}
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: space.s }}>
        <SegmentedControl
          label="Statistic"
          value={stat}
          onChange={setStat}
          options={[{ value: 'mean', label: 'Mean' }, { value: 'median', label: 'Median' }, { value: 'p25', label: '25th percentile' }, { value: 'p75', label: '75th percentile' }]}
        />
        <DataGrid label="Metric weights" style={{ width: '50%' }} head={<><ColumnHeader grow={2}>Multiple</ColumnHeader><ColumnHeader numeric>Weight</ColumnHeader><ColumnHeader numeric>Selected Multiple</ColumnHeader></>}>
          <Row aria-label="EV / Revenue (LTM)"><RowLabelCell>EV / Revenue (LTM)</RowLabelCell>
            <EditCell label="EV / Revenue weight" value={pct1(ed.data.weights.revenue)} onCommit={(t) => setWeight('revenue', parseNumber(t) ?? 0)} error={ed.showErrors && metricIssue ? metricIssue.message : null} readOnly={readOnly} />
            <GridValueCell>{ABSENCE_LABEL['not-calculated']}</GridValueCell></Row>
          <Row aria-label="EV / EBITDA (LTM)" zebra><RowLabelCell>EV / EBITDA (LTM)</RowLabelCell>
            <EditCell label="EV / EBITDA weight" value={pct1(ed.data.weights.ebitda)} onCommit={(t) => setWeight('ebitda', parseNumber(t) ?? 0)} error={ed.showErrors && metricIssue ? metricIssue.message : null} readOnly={readOnly} />
            <GridValueCell>{ABSENCE_LABEL['not-calculated']}</GridValueCell></Row>
          <Row type="total" aria-label="Weights total"><RowLabelCell type="total">Total</RowLabelCell>
            <GridValueCell kind="total">{pct1(ed.data.weights.revenue + ed.data.weights.ebitda)}</GridValueCell><GridValueCell kind="total" /></Row>
        </DataGrid>
        <Text step="s" tone="secondary">Multiples are not calculated in the prototype: the statistic and outlier rules are not yet specified.</Text>
      </div>
      <SaveRow ed={ed} />
    </>
  );
}

/* --------------------------------------------------------------- Save row */

function SaveRow({ ed }: { ed: { save: () => boolean; dirty: boolean; guard: { dialog: ReactElement } } }) {
  return (
    <div>
      <Button onClick={ed.save} disabled={!ed.dirty}>Save approach</Button>
      {ed.guard.dialog}
    </div>
  );
}
