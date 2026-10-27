/**
 * Cash Flow Ledger — every investment, distribution and sale for the
 * company's positions, and the per-fund summary (investments, proceeds, net
 * cost basis, gross IRR) it rolls up to. Rows come from the company record
 * (`transactionsFor` / `cashFlowSummaryFor`).
 *
 * States: default · new-row ("Add Transaction" appends an editable row).
 */
import { useCallback, useState, type ReactNode } from 'react';
import {
  Banner, Button, ButtonIcon, DataGrid, GridColumnHeader, GridValueCell, Heading, Icon, InCellControl,
  Row, RowLabelCell, SelectMenu, SelectMenuOption, Tooltip, icons,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, usd, type Company } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { Anchor } from './Anchor.js';
import {
  TRANSACTION_TYPES, cashFlowSummaryFor, entitiesFor, fundsFor, positionSecuritiesFor, transactionsFor, type Transaction,
} from './data.js';
import { useValuationContext } from '../../domain/context.js';
import { useEditor } from '../../domain/useEditor.js';
import { parseNumber, transactionDateIssue } from '../../domain/validation.js';
import { EditCell } from '../../shell/EditCell.js';

const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const draft = (): Transaction => ({ id: `new-${Math.random().toString(36).slice(2, 7)}`, amount: 0, type: 'Investment', draft: true });
const initial = (state: string, company: Company) =>
  (state === 'new-row' ? [...transactionsFor(company), draft()] : transactionsFor(company));

type Field = 'type' | 'owner' | 'entity' | 'security';

export function CashFlowLedger({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const ctx = useValuationContext(company);
  const measurementIso = ctx.measurement.date;
  // P7: a transaction cannot be dated after the measurement (DOC). Only the new row is editable.
  const validate = useCallback((rs: Transaction[]) => rs.filter((r) => r.draft).flatMap((r) => {
    const issue = r.date ? transactionDateIssue(r.date, measurementIso) : 'Enter the transaction date.';
    return issue ? [{ label: `New transaction · Date: ${issue}` }] : [];
  }), [measurementIso]);
  const ed = useEditor(() => initial(state, company), { validate, readOnly: ctx.readOnly, initiallyDirty: state === 'new-row' });
  const rows = ed.data;
  const setRows = ed.update;
  const [menu, setMenu] = useState<{ id: string; field: Field } | null>(null);
  const edit = (id: string, patch: Partial<Transaction>) => setRows((cur) => cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const dateError = (r: Transaction) => (ed.showErrors ? (r.date ? transactionDateIssue(r.date, measurementIso) : 'Enter the transaction date.') : null);

  const options: Record<Field, readonly string[]> = {
    type: TRANSACTION_TYPES, owner: fundsFor(company), entity: entitiesFor(company), security: positionSecuritiesFor(company),
  };
  const set = (id: string, field: Field, value: string) => {
    setRows((cur) => cur.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setMenu(null);
  };
  const addRow = () => { if (!rows.some((r) => r.draft)) setRows((cur) => [...cur, draft()]); };

  /** Sourced rows are read-only (green); a draft row is picked cell by cell. */
  const pick = (r: Transaction, field: Field, label: string): ReactNode => {
    if (!r.draft) return <GridValueCell kind="sourced">{r[field]}</GridValueCell>;
    const open = menu?.id === r.id && menu.field === field;
    return (
      <Anchor
        menu={open && (
          <SelectMenu label={label}>
            {options[field].map((o) => (
              <SelectMenuOption key={o} selected={o === r[field]} onSelect={() => set(r.id, field, o)}>{o}</SelectMenuOption>
            ))}
          </SelectMenu>
        )}
      >
        <InCellControl type="select" label={label} open={open} onClick={() => setMenu(open ? null : { id: r.id, field })}>
          {r[field]}
        </InCellControl>
      </Anchor>
    );
  };

  const summary = cashFlowSummaryFor(company);
  const totals = summary.reduce(
    (a, s) => ({ investments: a.investments + s.investments, proceeds: a.proceeds + s.proceeds, net: a.net + s.netCostBasis }),
    { investments: 0, proceeds: 0, net: 0 },
  );
  const signed = (v: number) => (v < 0 ? `-${usd.format(-v)}` : usd.format(v));

  return (
    <CapTableLayout company={company} page="cash-flow-ledger" onSave={ed.save} saveState={ed.saveState} overlay={ed.guard.dialog}>
      {ed.showErrors && <Banner tone="negative" title="To save, correct the new transaction. A transaction cannot be dated after the measurement date." issues={ed.issues} />}
      <DataGrid
        label="Transactions"
        style={{ width: '72%', overflow: 'visible' }}
        head={
          <>
            <GridColumnHeader numeric grow={1.4}>Date of Transaction</GridColumnHeader>
            <GridColumnHeader grow={0.4}>{''}</GridColumnHeader>
            <GridColumnHeader numeric>Amount</GridColumnHeader>
            <GridColumnHeader numeric>Description</GridColumnHeader>
            <GridColumnHeader
              numeric
              trailing={
                <Tooltip content="Investment, distribution or sale of shares — it sets how the amount enters the IRR.">
                  <ButtonIcon variant="tertiary" size="s" label="About transaction types" icon={<Icon size="s" tone="inherit"><icons.Help /></Icon>} />
                </Tooltip>
              }
            >
              Type
            </GridColumnHeader>
            <GridColumnHeader numeric>Owner</GridColumnHeader>
            <GridColumnHeader numeric>Entity</GridColumnHeader>
            <GridColumnHeader numeric>Security</GridColumnHeader>
          </>
        }
      >
        {rows.map((r, i) => (
          <Row key={r.id} zebra={i % 2 === 1} aria-label={r.draft ? 'New transaction' : `Transaction ${r.date} ${r.security}`}>
            {r.draft
              ? <EditCell label="Date of transaction" placeholder="MM/DD/YYYY" value={r.date ?? ''} onCommit={(t) => edit(r.id, { date: t.trim() || undefined })} error={dateError(r)} readOnly={ctx.readOnly} />
              : <GridValueCell kind="sourced">{r.date}</GridValueCell>}
            <InCellControl type="currency" label="Transaction currency">USD</InCellControl>
            {r.draft
              ? <EditCell label="Transaction amount" value={money2.format(r.amount)} onCommit={(t) => edit(r.id, { amount: parseNumber(t) ?? 0 })} readOnly={ctx.readOnly} />
              : <GridValueCell kind="sourced">{money2.format(r.amount)}</GridValueCell>}
            <GridValueCell kind={r.draft ? 'editable' : 'sourced'}>{r.description?.toUpperCase()}</GridValueCell>
            {pick(r, 'type', 'Transaction type')}
            {pick(r, 'owner', 'Owner')}
            {pick(r, 'entity', 'Entity')}
            {pick(r, 'security', 'Security')}
          </Row>
        ))}
      </DataGrid>

      <div>
        <Button onClick={addRow}>Add Transaction</Button>
      </div>

      <Heading level={2} step="m">Cash Flow Summary</Heading>
      <DataGrid
        label="Cash flow summary"
        style={{ width: '50%' }}
        head={['Fund', 'Total Investments', 'Total Proceeds', 'Net Cost Basis', 'Gross IRR'].map((h) => (
          <GridColumnHeader key={h} numeric>{h}</GridColumnHeader>
        ))}
      >
        {summary.map((s, i) => (
          <Row key={s.fund} zebra={i % 2 === 1} aria-label={s.fund}>
            <GridValueCell>{s.fund}</GridValueCell>
            <GridValueCell>{usd.format(s.investments)}</GridValueCell>
            <GridValueCell>{usd.format(s.proceeds)}</GridValueCell>
            <GridValueCell>{signed(s.netCostBasis)}</GridValueCell>
            <GridValueCell>{s.irr}</GridValueCell>
          </Row>
        ))}
        <Row type="total" aria-label={`${company.name} total`}>
          <RowLabelCell type="total">{company.name}</RowLabelCell>
          <GridValueCell kind="total">{usd.format(totals.investments)}</GridValueCell>
          <GridValueCell kind="total">{usd.format(totals.proceeds)}</GridValueCell>
          <GridValueCell kind="total">{signed(totals.net)}</GridValueCell>
          <GridValueCell kind="total">N/A</GridValueCell>
        </Row>
      </DataGrid>
    </CapTableLayout>
  );
}
