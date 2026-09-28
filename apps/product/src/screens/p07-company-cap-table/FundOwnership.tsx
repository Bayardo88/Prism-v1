/**
 * Fund Ownership — what each fund holds in each security of the company:
 * entity, fund, investment date, capital, shares and the derived preference
 * and proceeds. Filtered by fund (VIP Fund) and by security.
 *
 * States: default · new-column ("Add Fund Ownership" appends a blank position).
 */
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import {
  Chip, ContextMenu, GridColumnDivider, GridColumnHeader, GridValueCell, InCellControl,
  MenuItem, RowLabelCell, SplitButton, color, space, type ValueKind,
} from '@scalar/design-system';
import type { ScreenProps } from '../../types.js';
import { companyById, num, usd } from '../../data/fixtures.js';
import { CapTableLayout } from './CapTableLayout.js';
import { Anchor, Sheet, SheetRow, columnsFor, widthFor } from './Sheet.js';
import { ENTITIES, FUNDS, POSITIONS, POSITION_SECURITIES, type Position } from './data.js';

const blank = (): Position => ({
  id: `new-${Math.random().toString(36).slice(2, 7)}`, security: '', entity: 'ABC Co',
  investedCapital: 0, shares: 0, sharesAsConverted: 0, initialLiquidationPreference: 0,
});
const initial = (state: string) => (state === 'new-column' ? [...POSITIONS, blank()] : POSITIONS);
type Field = 'security' | 'entity' | 'fund';

function FilterBand({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex', gap: space.s, flexWrap: 'wrap', padding: space.s,
        background: color.bg.surface, border: `1px solid ${color.stroke.divider}`,
      }}
    >
      {children}
    </div>
  );
}

export function FundOwnership({ state, params }: ScreenProps) {
  const company = companyById(params.companyId);
  const [positions, setPositions] = useState<Position[]>(() => initial(state));
  const [menu, setMenu] = useState<{ id: string; field: Field } | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  useEffect(() => setPositions(initial(state)), [state]);

  const add = () => {
    setAddMenuOpen(false);
    if (!positions.some((p) => !p.security)) setPositions((cur) => [...cur, blank()]);
  };
  const choose = (id: string, field: Field, value: string) => {
    setPositions((cur) => cur.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    setMenu(null);
  };

  const n = positions.length;
  const columns = columnsFor(n, { pinnedTotal: true });
  const sum = (f: (p: Position) => number) => positions.reduce((a, p) => a + f(p), 0);
  const v = (kind: ValueKind, value?: ReactNode) => <GridValueCell kind={kind}>{value}</GridValueCell>;

  const picker = (p: Position, field: Field, options: readonly string[], label: string) => (
    <Anchor
      menu={menu?.id === p.id && menu.field === field && (
        <ContextMenu label={label}>
          {options.map((o) => <MenuItem key={o} selected={o === p[field]} onClick={() => choose(p.id, field, o)}>{o}</MenuItem>)}
        </ContextMenu>
      )}
    >
      <InCellControl
        type="select"
        label={label}
        open={menu?.id === p.id && menu.field === field}
        onClick={() => setMenu((cur) => (cur?.id === p.id && cur.field === field ? null : { id: p.id, field }))}
      >
        {p[field] || undefined}
      </InCellControl>
    </Anchor>
  );

  const row = (label: string, cell: (p: Position) => ReactNode, total: ReactNode) => (
    <SheetRow key={label} label={label}>
      <RowLabelCell>{label}</RowLabelCell>
      {positions.map((p) => <Anchor key={p.id}>{cell(p)}</Anchor>)}
      <GridColumnDivider type="pinned" />
      {total}
    </SheetRow>
  );

  return (
    <CapTableLayout
      company={company}
      page="fund-ownership"
      currency
      footer={
        <SplitButton
          variant="secondary"
          menuLabel="More ways to add fund ownership"
          onClick={add}
          menuOpen={addMenuOpen}
          onMenuToggle={() => setAddMenuOpen((o) => !o)}
          menu={addMenuOpen && (
            <ContextMenu label="Add fund ownership">
              <MenuItem onClick={add}>Add fund ownership column</MenuItem>
            </ContextMenu>
          )}
        >
          Add Fund Ownership
        </SplitButton>
      }
    >
      <FilterBand><Chip styleVariant="info" size="l">VIP Fund</Chip></FilterBand>
      <FilterBand>
        {POSITION_SECURITIES.map((s) => <Chip key={s} styleVariant="info" size="l">{s}</Chip>)}
      </FilterBand>

      <Sheet label="Fund ownership" columns={columns} width={widthFor(n + 1, 22, 13)}>
        <SheetRow label="Positions">
          <GridColumnHeader>{''}</GridColumnHeader>
          {positions.map((p) => (p.security
            ? <GridColumnHeader key={p.id} numeric>{p.security}</GridColumnHeader>
            : <Fragment key={p.id}>{picker(p, 'security', POSITION_SECURITIES, 'Security')}</Fragment>))}
          <GridColumnDivider type="pinned" />
          <GridColumnHeader numeric>Total</GridColumnHeader>
        </SheetRow>
        {row('Security ID', () => v('calculated'), v('calculated'))}
        <SheetRow label="Entity">
          <RowLabelCell>Entity</RowLabelCell>
          {positions.map((p) => <Fragment key={p.id}>{picker(p, 'entity', ENTITIES, 'Entity')}</Fragment>)}
          <GridColumnDivider type="pinned" />
          {v('calculated')}
        </SheetRow>
        <SheetRow label="Fund (or Entity)">
          <RowLabelCell>Fund (or Entity)</RowLabelCell>
          {positions.map((p) => <Fragment key={p.id}>{picker(p, 'fund', FUNDS, 'Fund or entity')}</Fragment>)}
          <GridColumnDivider type="pinned" />
          {v('calculated')}
        </SheetRow>
        {row('Investment Date', (p) => v('editable', p.investmentDate), v('calculated'))}
        {row('Invested Capital', (p) => v('editable', usd.format(p.investedCapital)), v('calculated', usd.format(sum((p) => p.investedCapital))))}
        {row('Loan Value', () => v('calculated', usd.format(0)), v('calculated', usd.format(0)))}
        {row('Shares', (p) => v('editable', num.format(p.shares)), v('calculated', sum((p) => p.shares).toFixed(1)))}
        {row('Shares (as Converted)', (p) => v('calculated', num.format(p.sharesAsConverted)), v('calculated', sum((p) => p.sharesAsConverted).toFixed(1)))}
        {row('Fully Diluted Ownership %', () => v('calculated', '0.0%'), v('calculated', '0.0%'))}
        {row('Initial Liquidation Preference', (p) => v('calculated', usd.format(p.initialLiquidationPreference)), v('calculated', usd.format(sum((p) => p.initialLiquidationPreference))))}
        {row('Liquidation Preference', () => v('calculated', usd.format(0)), v('calculated', usd.format(0)))}
        {row('Cash Distributions', () => v('editable', usd.format(0)), v('calculated', usd.format(0)))}
        {row('Proceeds from Sold Shares', () => v('editable', usd.format(0)), v('calculated', usd.format(0)))}
      </Sheet>
    </CapTableLayout>
  );
}
