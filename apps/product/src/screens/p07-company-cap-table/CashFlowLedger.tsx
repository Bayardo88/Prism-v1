/**
 * Cash Flow Ledger — every investment, distribution and sale for the
 * company's positions, and the per-fund summary (investments, proceeds, net
 * cost basis, gross IRR) it rolls up to.
 *
 * States: default · new-row ("Add Transaction" appends an editable row).
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  Button, ButtonIcon, ContextMenu, GridColumnHeader, GridValueCell, Heading, Icon, InCellControl,
  MenuItem, RowLabelCell, Tooltip, color, glyphs,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, usd } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { Anchor, Sheet, SheetRow } from './Sheet.js';
import {
  CASH_FLOW_SUMMARY, ENTITIES, FUNDS, POSITION_SECURITIES, TRANSACTIONS, TRANSACTION_TYPES, type Transaction,
} from './data.js';

const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const draft = (): Transaction => ({ id: `new-${Math.random().toString(36).slice(2, 7)}`, amount: 0, type: 'Investment', draft: true });
const initial = (state: string) => (state === 'new-row' ? [...TRANSACTIONS, draft()] : TRANSACTIONS);

type Field = 'type' | 'owner' | 'entity' | 'security';
const OPTIONS: Record<Field, readonly string[]> = {
  type: TRANSACTION_TYPES, owner: FUNDS, entity: ENTITIES, security: POSITION_SECURITIES,
};

const TX_COLUMNS = 'minmax(0, 1.1fr) auto repeat(6, minmax(0, 1fr))';
const SUMMARY_COLUMNS = 'repeat(5, minmax(0, 1fr))';

export function CashFlowLedger({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [rows, setRows] = useState<Transaction[]>(() => initial(state));
  const [menu, setMenu] = useState<{ id: string; field: Field } | null>(null);
  useEffect(() => setRows(initial(state)), [state]);

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
          <ContextMenu label={label}>
            {OPTIONS[field].map((o) => <MenuItem key={o} selected={o === r[field]} onClick={() => set(r.id, field, o)}>{o}</MenuItem>)}
          </ContextMenu>
        )}
      >
        <InCellControl type="select" label={label} open={open}
          onClick={() => setMenu(open ? null : { id: r.id, field })}>
          {r[field]}
        </InCellControl>
      </Anchor>
    );
  };

  const totals = CASH_FLOW_SUMMARY.reduce(
    (a, s) => ({ investments: a.investments + s.investments, proceeds: a.proceeds + s.proceeds, net: a.net + s.netCostBasis }),
    { investments: 0, proceeds: 0, net: 0 },
  );
  const signed = (v: number) => (v < 0 ? `-${usd.format(-v)}` : usd.format(v));

  return (
    <CapTableLayout company={company} page="cash-flow-ledger">
      <Sheet label="Transactions" columns={TX_COLUMNS} width="72%">
        <SheetRow label="Columns">
          <GridColumnHeader numeric>Date of Transaction</GridColumnHeader>
          <GridColumnHeader>{''}</GridColumnHeader>
          <GridColumnHeader numeric>Amount</GridColumnHeader>
          <GridColumnHeader numeric>Description</GridColumnHeader>
          <div style={{ display: 'flex', alignItems: 'center', background: color.bg.surface, borderBottom: `1px solid ${color.stroke.default}` }}>
            <div style={{ flex: 1, minWidth: 0 }}><GridColumnHeader numeric>Type</GridColumnHeader></div>
            <Tooltip content="Investment, distribution or sale of shares — it sets how the amount enters the IRR.">
              <ButtonIcon variant="tertiary" size="s" label="About transaction types" icon={<Icon size="s" tone="inherit"><glyphs.Info /></Icon>} />
            </Tooltip>
          </div>
          <GridColumnHeader numeric>Owner</GridColumnHeader>
          <GridColumnHeader numeric>Entity</GridColumnHeader>
          <GridColumnHeader numeric>Security</GridColumnHeader>
        </SheetRow>
        {rows.map((r) => (
          <SheetRow key={r.id} label={r.draft ? 'New transaction' : `Transaction ${r.date} ${r.security}`}>
            {r.draft
              ? <InCellControl type="date" label="Date of transaction">{r.date}</InCellControl>
              : <GridValueCell kind="sourced">{r.date}</GridValueCell>}
            <InCellControl type="currency" label="Transaction currency">USD</InCellControl>
            <GridValueCell kind={r.draft ? 'editable' : 'sourced'}>{money2.format(r.amount)}</GridValueCell>
            <GridValueCell kind={r.draft ? 'editable' : 'sourced'}>{r.description?.toUpperCase()}</GridValueCell>
            {pick(r, 'type', 'Transaction type')}
            {pick(r, 'owner', 'Owner')}
            {pick(r, 'entity', 'Entity')}
            {pick(r, 'security', 'Security')}
          </SheetRow>
        ))}
      </Sheet>

      <div>
        <Button onClick={addRow}>Add Transaction</Button>
      </div>

      <Heading level={2} step="m">Cash Flow Summary</Heading>
      <Sheet label="Cash flow summary" columns={SUMMARY_COLUMNS} width="50%">
        <SheetRow label="Columns">
          {['Fund', 'Total Investments', 'Total Proceeds', 'Net Cost Basis', 'Gross IRR'].map((h) => (
            <GridColumnHeader key={h} numeric>{h}</GridColumnHeader>
          ))}
        </SheetRow>
        {CASH_FLOW_SUMMARY.map((s) => (
          <SheetRow key={s.fund} label={s.fund}>
            <GridValueCell>{s.fund}</GridValueCell>
            <GridValueCell>{usd.format(s.investments)}</GridValueCell>
            <GridValueCell>{usd.format(s.proceeds)}</GridValueCell>
            <GridValueCell>{signed(s.netCostBasis)}</GridValueCell>
            <GridValueCell>{s.irr}</GridValueCell>
          </SheetRow>
        ))}
        <SheetRow label={`${company.name} total`}>
          <RowLabelCell type="total">{company.name}</RowLabelCell>
          <GridValueCell kind="total">{usd.format(totals.investments)}</GridValueCell>
          <GridValueCell kind="total">{usd.format(totals.proceeds)}</GridValueCell>
          <GridValueCell kind="total">{signed(totals.net)}</GridValueCell>
          <GridValueCell kind="total">N/A</GridValueCell>
        </SheetRow>
      </Sheet>
    </CapTableLayout>
  );
}
